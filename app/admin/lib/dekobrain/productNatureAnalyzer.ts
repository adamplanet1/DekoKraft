export type ProductNature = "candle" | "glass" | "metal" | "wood" | "fabric" | "ceramic" | "plastic" | "paper" | "food" | "plant" | "jewelry" | "mixed" | "gypsum-decor" | "unknown";
export type SceneSource = "studioWhite" | "generated" | "phonePhoto" | "transparent" | "complexScene" | "unknown";
export type RiskLevel = "low" | "medium" | "high";
export type ProtectedFeature = "flame" | "wick" | "thinEdges" | "naturalShadow" | "reflection" | "transparency" | "text" | "logo" | "fineTexture" | "similarBackgroundColor";
export type ProductNatureReport = {
  nature: ProductNature; sceneSource: SceneSource; confidence: number; riskLevel: RiskLevel; protectedFeatures: ProtectedFeature[];
  detectedSignals: { likelyFlame:number; likelyThinParts:number; likelyReflection:number; likelyTransparency:number; backgroundComplexity:number; subjectBackgroundSimilarity:number; portraitLikeShape:number };
  recommendedSettings: { backgroundSensitivity:number; edgeSoftness:number; detailProtection:number; shadowMode:"keep"|"soften"|"experimentalRemove"; extractionPreset:"gentle"|"balanced"|"detailSafe"|"reflectionSafe"|"complexSceneManual"; fitMode:"contain"|"cover" };
  warnings:string[]; explanation:string[];
};

export const clamp=(value:number,min=0,max=100)=>Math.min(max,Math.max(min,Number.isFinite(value)?value:min));
const normalized=(value?:number)=>clamp((value??0)<=1?(value??0)*100:(value??0));
const patterns:Record<Exclude<ProductNature,"mixed"|"unknown">,RegExp>={
  "gypsum-decor":/gypsum|plaster decor|gipsdeko|gips decor|décor en plâtre|ديكور من الجبس|ديكور جبسي|جبس/i,
  candle:/candle|candles|bougie|kerze|شمعة|شموع/i, glass:/glass|verre|glas|زجاج/i, metal:/metal|métal|metall|معدن/i,
  wood:/wood|bois|holz|خشب/i, fabric:/fabric|textile|tissu|stoff|قماش/i, ceramic:/ceramic|céramique|keramik|سيراميك/i,
  plastic:/plastic|plastique|kunststoff|بلاستيك/i, paper:/paper|papier|ورق/i, food:/food|aliment|essen|طعام/i,
  plant:/plant|plante|pflanze|نبات/i, jewelry:/jewelry|jewellery|bijou|schmuck|مجوهرات/i,
};
function inferNature(value:string):ProductNature { for(const [nature,pattern] of Object.entries(patterns))if(pattern.test(value))return nature as ProductNature; if(/mixed|mixte|gemischt|مختلط/i.test(value))return "mixed"; return "unknown"; }
export function analyzeProductNature(input:{fileName:string;mimeType?:string;width?:number;height?:number;isTransparent?:boolean;selectedCategory?:string;imageMetrics?:{brightness?:number;contrast?:number;edgeDensity?:number;colorVariance?:number;backgroundUniformity?:number;warmHighlightRatio?:number;transparentPixelRatio?:number}}):ProductNatureReport {
  const metrics=input.imageMetrics??{}, manualProvided=typeof input.selectedCategory==="string", manual=manualProvided?inferNature(input.selectedCategory!):"unknown", filename=inferNature(input.fileName);
  let nature=manualProvided?manual:filename, confidence=manualProvided?98:filename!=="unknown"?86:24;
  const edge=normalized(metrics.edgeDensity), variance=normalized(metrics.colorVariance), uniformity=normalized(metrics.backgroundUniformity), warm=normalized(metrics.warmHighlightRatio), alpha=normalized(metrics.transparentPixelRatio);
  const complex=clamp(variance*.55+edge*.45), transparent=Boolean(input.isTransparent)||alpha>2, portrait=input.width&&input.height?clamp(((input.height/input.width)-1)*70):0;
  let sceneSource:SceneSource="unknown";
  if(transparent)sceneSource="transparent"; else if(complex>=65)sceneSource="complexScene"; else if(complex>=48)sceneSource="phonePhoto"; else if(uniformity>=72)sceneSource=variance<18?"studioWhite":"generated";
  const protectedFeatures:ProtectedFeature[]=[], warnings:string[]=[], explanation:string[]=[];
  let backgroundSensitivity=58,edgeSoftness=26,detailProtection=75,shadowMode:ProductNatureReport["recommendedSettings"]["shadowMode"]="keep",extractionPreset:ProductNatureReport["recommendedSettings"]["extractionPreset"]="balanced";const fitMode:"contain"|"cover"="contain";
  const add=(...values:ProtectedFeature[])=>values.forEach(value=>{if(!protectedFeatures.includes(value))protectedFeatures.push(value);});
  if(nature==="candle"){add("flame","wick","naturalShadow","fineTexture","thinEdges");extractionPreset="detailSafe";detailProtection=90;backgroundSensitivity=62;edgeSoftness=22;confidence=Math.max(confidence,warm>2?90:86);warnings.push("candleSensitivity");explanation.push("candleProtection");}
  else if(nature==="glass"){add("reflection","transparency","thinEdges");extractionPreset="reflectionSafe";detailProtection=92;backgroundSensitivity=48;edgeSoftness=18;explanation.push("glassProtection");}
  else if(nature==="jewelry"){add("reflection","thinEdges","fineTexture");extractionPreset="reflectionSafe";detailProtection=92;backgroundSensitivity=55;edgeSoftness=16;explanation.push("jewelryProtection");}
  else if(nature==="fabric"){add("fineTexture","thinEdges");extractionPreset="detailSafe";detailProtection=88;edgeSoftness=18;explanation.push("fabricProtection");}
  else if(nature==="metal"){add("reflection","fineTexture");extractionPreset="reflectionSafe";detailProtection=86;explanation.push("reflectionProtection");}
  else if(nature==="gypsum-decor"){add("thinEdges","fineTexture","naturalShadow");extractionPreset="detailSafe";backgroundSensitivity=48;edgeSoftness=20;detailProtection=92;shadowMode="soften";explanation.push("gypsumProtection");warnings.push("gypsumFragileDetails");}
  if(complex>=48){sceneSource=complex>=65?"complexScene":"phonePhoto";extractionPreset="complexSceneManual";backgroundSensitivity=Math.min(backgroundSensitivity,52);warnings.push("complexSceneReview");explanation.push("manualReview");}
  if(transparent){sceneSource="transparent";add("transparency");explanation.push("existingTransparency");}
  if(confidence<40||nature==="unknown"){nature="unknown";warnings.push("lowConfidence");extractionPreset="complexSceneManual";backgroundSensitivity=Math.min(backgroundSensitivity,45);detailProtection=Math.max(detailProtection,88);}
  const similarity=clamp((100-uniformity)*.35+Math.max(0,40-(metrics.contrast??40))*.7);if(similarity>55)add("similarBackgroundColor");
  const riskLevel:RiskLevel=confidence<40||nature==="unknown"||complex>=65||nature==="glass"?"high":complex>=40||["jewelry","candle","mixed"].includes(nature)?"medium":"low";
  return {nature,sceneSource,confidence:clamp(confidence),riskLevel,protectedFeatures,detectedSignals:{likelyFlame:clamp(nature==="candle"?Math.max(75,warm):warm),likelyThinParts:clamp(["candle","glass","jewelry","fabric"].includes(nature)?78:edge),likelyReflection:clamp(["glass","jewelry","metal"].includes(nature)?82:metrics.contrast??0),likelyTransparency:clamp(transparent?Math.max(80,alpha):alpha),backgroundComplexity:complex,subjectBackgroundSimilarity:similarity,portraitLikeShape:portrait},recommendedSettings:{backgroundSensitivity:clamp(backgroundSensitivity),edgeSoftness:clamp(edgeSoftness),detailProtection:clamp(detailProtection),shadowMode,extractionPreset,fitMode},warnings,explanation};
}

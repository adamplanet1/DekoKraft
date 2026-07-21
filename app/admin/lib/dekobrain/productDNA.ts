import type { ProductNature, ProductNatureReport, SceneSource } from "./productNatureAnalyzer";

export type ProductDNA = {
  version:number;
  productId:string;
  category:ProductNature;
  confidence:number;
  sourceType:SceneSource;
  sceneComplexity:number;
  visualTraits:{hasFlame:boolean;hasWick:boolean;hasNaturalShadow:boolean;hasReflection:boolean;hasTransparentParts:boolean;hasFineEdges:boolean;isTall:boolean;isRound:boolean};
  materials:string[];
  protections:{flame:boolean;wick:boolean;edges:boolean;details:boolean;shadow:boolean;reflections:boolean};
  extractionProfile:{backgroundSensitivity:number;edgeSoftness:number;detailProtection:number;shadowMode:"keep"|"soften"|"experimental-remove"};
  learning:{userCorrectedCategory:boolean;acceptedResult:boolean;correctionCount:number;lastUpdatedAt:string};
};

export type BuildProductDNAInput={
  productId:string;
  report:ProductNatureReport;
  image:{width:number;height:number;mimeType?:string;hasTransparency?:boolean};
  correctedCategory?:ProductNature|null;
  extractionSettings?:Partial<ProductDNA["extractionProfile"]>;
  previous?:ProductDNA|null;
  categoryCorrection?:boolean;
  acceptedResult?:boolean;
};

const materialByNature:Partial<Record<ProductNature,string[]>>={glass:["glass"],metal:["metal"],wood:["wood"],fabric:["fabric"],ceramic:["ceramic"],plastic:["plastic"],paper:["paper"],candle:["wax"],jewelry:["metal"],plant:["organic"],food:["organic"]};
export function buildProductDNA({productId,report,image,correctedCategory,extractionSettings,previous,categoryCorrection=false,acceptedResult}:BuildProductDNAInput):ProductDNA{
  const protectedSet=new Set(report.protectedFeatures), category=correctedCategory??report.nature;
  const suggested=report.recommendedSettings;
  const shadowMode=extractionSettings?.shadowMode??(suggested.shadowMode==="experimentalRemove"?"experimental-remove":suggested.shadowMode);
  const accepted=acceptedResult??previous?.learning.acceptedResult??false;
  return {
    version:Math.max(1,(previous?.version??1)+(acceptedResult===true?1:0)),productId,category,confidence:report.confidence,sourceType:report.sceneSource,sceneComplexity:report.detectedSignals.backgroundComplexity,
    visualTraits:{hasFlame:protectedSet.has("flame")||report.detectedSignals.likelyFlame>=50,hasWick:protectedSet.has("wick"),hasNaturalShadow:protectedSet.has("naturalShadow"),hasReflection:protectedSet.has("reflection")||report.detectedSignals.likelyReflection>=50,hasTransparentParts:Boolean(image.hasTransparency)||protectedSet.has("transparency")||report.detectedSignals.likelyTransparency>=50,hasFineEdges:protectedSet.has("thinEdges")||report.detectedSignals.likelyThinParts>=50,isTall:image.height>image.width*1.2,isRound:image.width/image.height>=.82&&image.width/image.height<=1.18},
    materials:materialByNature[category]??(category==="mixed"?["mixed"]:[]),
    protections:{flame:protectedSet.has("flame"),wick:protectedSet.has("wick"),edges:protectedSet.has("thinEdges"),details:protectedSet.has("fineTexture"),shadow:protectedSet.has("naturalShadow"),reflections:protectedSet.has("reflection")},
    extractionProfile:{backgroundSensitivity:extractionSettings?.backgroundSensitivity??suggested.backgroundSensitivity,edgeSoftness:extractionSettings?.edgeSoftness??suggested.edgeSoftness,detailProtection:extractionSettings?.detailProtection??suggested.detailProtection,shadowMode},
    learning:{userCorrectedCategory:previous?.learning.userCorrectedCategory||Boolean(correctedCategory),acceptedResult:accepted,correctionCount:(previous?.learning.correctionCount??0)+(categoryCorrection?1:0),lastUpdatedAt:new Date().toISOString()},
  };
}

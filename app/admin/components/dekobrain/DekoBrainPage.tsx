"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "../../config/translations";
import { dekoBrainAdvisorTranslations } from "../../config/dekoBrainAdvisorTranslations";
import { dekoBrainMemoryTranslations } from "../../config/dekoBrainMemoryTranslations";
import { dekoBrainBackgroundStudioTranslations } from "../../config/dekoBrainBackgroundStudioTranslations";
import {
  dekoBrainTranslations,
  interpolateDekoBrainText,
} from "../../config/dekoBrainTranslations";
import { analyzeImageFile } from "../../lib/dekobrain/analyzeImageFile";
import { evaluateCompatibility } from "../../lib/dekobrain/compatibilityEngine";
import { runDecisionEngine } from "../../lib/dekobrain/decisionEngine";
import { logDekoBrainEvent } from "../../lib/dekobrain/eventLog";
import { createSimilarityKey, generateImageFingerprint } from "../../lib/dekobrain/imageFingerprint";
import { clearMemory, deleteMemoryRecord, exportMemoryMetadata, findByFingerprint, findRelatedRecords, importMemoryMetadata, listRecentMemoryRecords, updateMemoryRecord } from "../../lib/dekobrain/memoryStore";
import { rememberMediaAnalysis } from "../../lib/dekobrain/memoryService";
import { getTransparentAlphaBounds } from "../../lib/dekobrain/smartCropTransparent";
import { dekoBrainPreviewTranslations } from "../../config/dekoBrainPreviewTranslations";
import { dekoBrainProductNatureTranslations } from "../../config/dekoBrainProductNatureTranslations";
import { dekoBrainLearningTranslations } from "../../config/dekoBrainLearningTranslations";
import {dekoBrainGoldenTranslations} from "../../config/dekoBrainGoldenTranslations";
import {dekoBrainSilhouetteTranslations} from "../../config/dekoBrainSilhouetteTranslations";
import {dekoBrainLivingIdentityTranslations} from "../../config/dekoBrainLivingIdentityTranslations";
import { analyzeProductImage } from "../../lib/dekobrain/productAnalyzer";
import type { ProductProfile } from "../../lib/dekobrain/productAnalyzerTypes";
import { analyzeProductNature, type ProductNature } from "../../lib/dekobrain/productNatureAnalyzer";
import {createEmptyLearningState,createMediaFingerprint,createOrUpdateProductDNA,exportLearningState,loadLearningState,normalizeProductCategory,recordCategoryConfirmation,recordCategoryCorrection,recordIdentityMatch,recordRecommendationApplied,recordResultApproval,replaceProductDNA,resetLearningState,saveLearningState,updateProductDnaSilhouette,type DekoBrainLearningState,type LearningContext,type ProcessingSettings,type ProductCategory,type ProtectedFeature} from "../../lib/dekobrain/learning";
import {analyzeSilhouetteDna} from "../../lib/dekobrain/silhouetteDna";
import {buildIdentityObservation,type IdentityObservation,type LivingIdentity,type LivingIdentityMatch} from "../../lib/dekobrain/livingIdentity";
import {createLivingIdentity,findLivingIdentityMatches,loadLivingIdentities,mergeLivingIdentity,saveLivingIdentities} from "../../lib/dekobrain/livingIdentityStorage";
import {recordLivingIdentityEvent} from "../../lib/dekobrain/livingIdentityEvents";
import {buildGoldenArchitecture,createDefaultGoldenArchitectureState,type DekoBrainGoldenArchitectureState,type DekoBrainGoldenEventType} from "../../lib/dekobrain/goldenArchitecture";
import {loadGoldenArchitectureState,saveGoldenArchitectureState} from "../../lib/dekobrain/goldenArchitectureStorage";
import {recordDekoBrainEvent} from "../../lib/dekobrain/goldenArchitectureEvents";
import type {
  AnalyzedMediaItem,
  BackgroundMode,
  BackgroundStudioType,
  DekoBrainCompositionSettings,
  CompatibilityOverride,
  MediaFit,
  MediaObjectPosition,
  MediaPreviewRatio,
  PreviewTransform,
  AssetApprovalStatus,
  ApprovedAssetKind,
  ShadowMode,
  SmartCropStatus,
  ImagePipelineState,
  ProvisionalCategory,
  WebPConversionResult,
} from "../../types/dekobrain";
import type { DekoBrainMemoryRecord, DekoBrainMemoryStatus } from "../../types/dekobrainMemory";
import BackgroundOptionsPanel from "./BackgroundOptionsPanel";
import ContentCompatibilityPanel from "./ContentCompatibilityPanel";
import DekoBrainAdvisorCard from "./DekoBrainAdvisorCard";
import DekoBrainMemoryPanel from "./DekoBrainMemoryPanel";
import DekoBrainBackgroundStudio from "./DekoBrainBackgroundStudio";
import AIMarketingStudio from "./AIMarketingStudio";
import MediaAnalysisPanel from "./MediaAnalysisPanel";
import MediaDropzone from "./MediaDropzone";
import MediaList from "./MediaList";
import MediaPreview from "./MediaPreview";
import ProcessingStages from "./ProcessingStages";
import WebPConversionPanel from "./WebPConversionPanel";
import DekoBrainMemoryInspector from "./DekoBrainMemoryInspector";
import DekoBrainGoldenArchitecture from "./DekoBrainGoldenArchitecture";
import{blobToDataUrl,getApprovedStudioImage,saveApprovedStudioImage,saveMarketingContext}from"../../studio/lib/ecoStudioStore";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const SUPPORTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
function createLearningContext(fingerprint:string,report:ReturnType<typeof analyzeProductNature>,category:ProductCategory,settings?:ProcessingSettings):LearningContext{const map:Partial<Record<string,ProtectedFeature>>={flame:"flame",wick:"wick",naturalShadow:"shadow",thinEdges:"fineEdges",fineTexture:"fineDetails",reflection:"reflection",transparency:"transparency"};const protectedFeatures=report.protectedFeatures.map(feature=>map[feature]).filter((feature):feature is ProtectedFeature=>Boolean(feature));if(category==="fabric"&&!protectedFeatures.includes("texture"))protectedFeatures.push("texture");if(category==="gypsum-decor")for(const feature of ["fineEdges","reliefDetails","floralDetails","delicateParts","gypsumTexture","designCracks"] as ProtectedFeature[])if(!protectedFeatures.includes(feature))protectedFeatures.push(feature);const sceneComplexity=report.detectedSignals.backgroundComplexity>=65?"complex":report.detectedSignals.backgroundComplexity>=40?"medium":"simple";const sourceType=report.sceneSource==="generated"?"generated":report.sceneSource==="phonePhoto"?"phoneCamera":report.sceneSource==="unknown"?"unknown":"uploaded";return{mediaFingerprint:fingerprint,predictedCategory:report.nature,category,confidence:report.confidence,sceneComplexity,riskLevel:report.riskLevel,sourceType,protectedFeatures,settings:settings??(category==="gypsum-decor"?{backgroundSensitivity:48,edgeSoftness:20,detailProtection:92,shadowMode:"soften"}:{backgroundSensitivity:report.recommendedSettings.backgroundSensitivity,edgeSoftness:report.recommendedSettings.edgeSoftness,detailProtection:report.recommendedSettings.detailProtection,shadowMode:report.recommendedSettings.shadowMode==="experimentalRemove"?"removeExperimental":report.recommendedSettings.shadowMode})}}

export type DekoBrainView="full"|"analysis"|"preview"|"extraction"|"backgrounds"|"webp"|"product-memory";

export default function DekoBrainPage({ lang,view="full",initialFile=null,onApprovedAsset,onProductIntelligence }: { lang: Lang;view?:DekoBrainView;initialFile?:File|null;onApprovedAsset?:(asset:{blob:Blob;fileName:string;mimeType:string;width:number;height:number})=>void;onProductIntelligence?:(value:{category:string;confidence:number;echoScore:number;protectedFeatures:string[];sceneComplexity:string;advisorScore:number}|null)=>void }) {
  const copy = dekoBrainTranslations[lang];
  const advisorCopy = dekoBrainAdvisorTranslations[lang];
  const memoryCopy = dekoBrainMemoryTranslations[lang];
  const studioCopy = dekoBrainBackgroundStudioTranslations[lang];
  const productNatureCopy=dekoBrainProductNatureTranslations[lang];
  const learningCopy=dekoBrainLearningTranslations[lang];
  const goldenCopy=dekoBrainGoldenTranslations[lang];
  const silhouetteCopy=dekoBrainSilhouetteTranslations[lang];
  const livingCopy=dekoBrainLivingIdentityTranslations[lang];
  const [items, setItems] = useState<AnalyzedMediaItem[]>([]);
  const itemsRef = useRef<AnalyzedMediaItem[]>([]);
  const importedInitialFileRef=useRef("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ratio, setRatio] = useState<MediaPreviewRatio>("original");
  const [fit, setFit] = useState<MediaFit>("contain");
  const [position, setPosition] = useState<MediaObjectPosition>("center");
  const [previewTransform, setPreviewTransform] = useState<PreviewTransform>({scale:1,x:0,y:0,zoom:1,safeArea:6});
  const [originalImageUrl,setOriginalImageUrl]=useState("");
  const [transparentPreviewUrl,setTransparentPreviewUrl]=useState("");
  const [transparentProductUrl,setTransparentProductUrl]=useState("");
  const [transparentProductWithShadowUrl,setTransparentProductWithShadowUrl]=useState("");
  const [approvedTransparentUrl,setApprovedTransparentUrl]=useState("");
  const [smartCroppedUrl,setSmartCroppedUrl]=useState("");
  const [enhancedPreviewUrl,setEnhancedPreviewUrl]=useState("");
  const [approvedCompositionUrl,setApprovedCompositionUrl]=useState("");
  const [activePreviewUrl,setActivePreviewUrl]=useState("");
  const [activeCompositionSourceUrl,setActiveCompositionSourceUrl]=useState("");
  const [assetApprovalStatus,setAssetApprovalStatus]=useState<AssetApprovalStatus>("not-ready");
  const [approvedAssetKind,setApprovedAssetKind]=useState<ApprovedAssetKind|null>(null);
  const [approvedAssetUrl,setApprovedAssetUrl]=useState("");
  const [smartCropStatus,setSmartCropStatus]=useState<SmartCropStatus>("idle");
  const [currentShadowMode,setCurrentShadowMode]=useState<ShadowMode>("keep");
  const [imagePipeline,setImagePipeline]=useState<ImagePipelineState>({sourceUrl:"",extractionPreviewUrl:null,approvedTransparentUrl:null,displayPreviewUrl:null});
  const [isExtractionApproved,setIsExtractionApproved]=useState(false);
  const [productProfile,setProductProfile]=useState<ProductProfile|null>(null);const [isAnalyzingProduct,setIsAnalyzingProduct]=useState(false);const [productAnalysisError,setProductAnalysisError]=useState<string|null>(null);const productAnalysisProcessId=useRef(0);const productAnalysisSignature=useRef("");
  const [selectedProductNature,setSelectedProductNature]=useState<ProductNature|null>(null);const [natureAnalysisRevision,setNatureAnalysisRevision]=useState(0);
  const [learningState,setLearningState]=useState<DekoBrainLearningState>(createEmptyLearningState);
  const [livingIdentities,setLivingIdentities]=useState<LivingIdentity[]>([]);const[currentLivingIdentityId,setCurrentLivingIdentityId]=useState("");const[livingMatches,setLivingMatches]=useState<LivingIdentityMatch[]>([]);const[currentObservation,setCurrentObservation]=useState<IdentityObservation|null>(null);
  const [storedGoldenState,setStoredGoldenState]=useState<DekoBrainGoldenArchitectureState>(createDefaultGoldenArchitectureState);const[savedGoldenAt,setSavedGoldenAt]=useState("");
  const [extractionProductBlob,setExtractionProductBlob]=useState<Blob|null>(null);const approvedProductOwnedUrl=useRef("");
  const previousManualState=useRef<{activePreviewUrl:string;fitMode:MediaFit;aspectRatio:MediaPreviewRatio;transform:PreviewTransform}|null>(null);
  const [memoryRecords, setMemoryRecords] = useState<DekoBrainMemoryRecord[]>([]);
  const [memoryStatus, setMemoryStatus] = useState<DekoBrainMemoryStatus>("new");
  const [exactMemory, setExactMemory] = useState<DekoBrainMemoryRecord | null>(null);
  const [relatedMemory, setRelatedMemory] = useState<DekoBrainMemoryRecord[]>([]);

  const selectedItem = items.find((item) => item.id === selectedId) ?? null;
  const productNatureReport=useMemo(()=>{if(!selectedItem)return null;const feature=(key:string)=>productProfile?.features.find(item=>item.key===key)?.confidence??0;return analyzeProductNature({fileName:selectedItem.filename,mimeType:selectedItem.mimeType,width:selectedItem.width,height:selectedItem.height,isTransparent:Boolean(selectedItem.hasTransparency),selectedCategory:selectedProductNature??undefined,imageMetrics:{edgeDensity:feature("thinEdges"),colorVariance:feature("complexBackground"),backgroundUniformity:feature("whiteBackground"),warmHighlightRatio:feature("flame"),transparentPixelRatio:feature("transparency"),contrast:feature("reflection")}});},[selectedItem,productProfile,selectedProductNature,natureAnalysisRevision]);
  const selectedFingerprint=selectedItem?createMediaFingerprint({name:selectedItem.preservedOriginalFile.name,size:selectedItem.preservedOriginalFile.size,type:selectedItem.preservedOriginalFile.type,lastModified:selectedItem.preservedOriginalFile.lastModified,width:selectedItem.width,height:selectedItem.height}):"";
  const productDNA=selectedFingerprint?learningState.productDna.find(item=>item.mediaFingerprint===selectedFingerprint)??null:null;
  const goldenState=useMemo(()=>{const state=buildGoldenArchitecture({hasImage:Boolean(selectedItem),analyzed:Boolean(selectedItem&&productProfile),dna:productDNA,learning:learningState,warningCount:productNatureReport?.warnings.length??0,events:storedGoldenState.events}),identity=livingIdentities.find(item=>item.identityId===currentLivingIdentityId);state.brainStatus={...state.brainStatus,livingIdentityCount:livingIdentities.length,currentIdentity:identity?.name??"Unknown",identityMatch:livingMatches[0]?.overallScore??(identity?100:0),identityGrowth:identity?.growthIndex??0,identityStatus:identity?.status??"new"};if(state.stages[1])state.stages[1].details.push(`Living Identity: ${identity?.identityId??"Unknown"}`);return state},[selectedItem,productProfile,productDNA,learningState,productNatureReport?.warnings.length,storedGoldenState.events,livingIdentities,currentLivingIdentityId,livingMatches]);
  useEffect(()=>{setLearningState(loadLearningState())},[]);
  useEffect(()=>{setLivingIdentities(loadLivingIdentities())},[]);
  useEffect(()=>{setStoredGoldenState(loadGoldenArchitectureState())},[]);
  useEffect(()=>{if(selectedProductNature===null&&productDNA?.history.some(entry=>entry.reason==="categoryCorrected"))setSelectedProductNature(productDNA.category)},[productDNA,selectedProductNature]);
  useEffect(()=>{if(!selectedItem||!productNatureReport||!selectedFingerprint)return;setLearningState(current=>{if(current.productDna.some(item=>item.mediaFingerprint===selectedFingerprint))return current;const context=createLearningContext(selectedFingerprint,productNatureReport,selectedProductNature??productNatureReport.nature);const dna=createOrUpdateProductDNA(current,context);return saveLearningState(replaceProductDNA(current,dna));});},[selectedItem?.id,selectedFingerprint,productNatureReport,selectedProductNature]);
  const canSmartCrop=Boolean(imagePipeline.approvedTransparentUrl);
  const canUseApprovedAsset=assetApprovalStatus==="approved"&&Boolean(approvedAssetUrl);
  const approvedAssetFile=useMemo(()=>{if(typeof File==="undefined"||!selectedItem)return undefined;const source=approvedAssetKind==="background-composition"?selectedItem.imageState.composedImage?.blob:selectedItem.imageState.transparentProduct?.blob;return source?new File([source],`${selectedItem.filename.replace(/\.[^.]+$/,"")}-approved.png`,{type:source.type||"image/png"}):undefined;},[approvedAssetKind,selectedItem]);
  const advisorDecision = useMemo(
    () => selectedItem ? runDecisionEngine(selectedItem) : null,
    [selectedItem]
  );
  useEffect(()=>{if(!onProductIntelligence)return;if(!productDNA){onProductIntelligence(null);return;}onProductIntelligence({category:productDNA.category,confidence:productDNA.confidence,echoScore:productDNA.echoScore,protectedFeatures:productDNA.protectedFeatures,sceneComplexity:productDNA.sceneComplexity,advisorScore:advisorDecision?.score??0});},[productDNA,advisorDecision?.score,onProductIntelligence]);
  useEffect(()=>{if(!productDNA)return;saveMarketingContext({productDNA:productDNA as unknown as Record<string,unknown>,echoScore:productDNA.echoScore,category:productDNA.category,confidence:productDNA.confidence,dekoBrainResults:{advisorScore:advisorDecision?.score??0,sceneComplexity:productDNA.sceneComplexity,protectedFeatures:productDNA.protectedFeatures}})},[productDNA,advisorDecision?.score]);
  const advisorLogSignature = useRef("");
  const memorySaveSignature = useRef("");
  const initializedAssetId=useRef("");
  const analyzeCurrentProduct=useCallback(async()=>{if(!selectedItem)return;const processId=++productAnalysisProcessId.current;setIsAnalyzingProduct(true);setProductAnalysisError(null);try{const profile=await analyzeProductImage({image:selectedItem.imageState.originalImage?.url??selectedItem.previewUrl,fileName:selectedItem.filename,mimeType:selectedItem.mimeType,userCategory:selectedItem.categoryConfirmed?selectedItem.provisionalCategory:undefined});if(processId===productAnalysisProcessId.current)setProductProfile(profile);}catch{if(processId===productAnalysisProcessId.current){setProductAnalysisError("local-analysis-failed");setProductProfile(null);}}finally{if(processId===productAnalysisProcessId.current)setIsAnalyzingProduct(false);}},[selectedItem]);
  useEffect(()=>{if(!selectedItem){setProductProfile(null);setProductAnalysisError(null);setIsAnalyzingProduct(false);return;}const signature=`${selectedItem.id}:${selectedItem.categoryConfirmed?selectedItem.provisionalCategory:"unconfirmed"}`;if(productAnalysisSignature.current===signature)return;productAnalysisSignature.current=signature;void analyzeCurrentProduct();},[selectedItem?.id,selectedItem?.categoryConfirmed,selectedItem?.provisionalCategory,analyzeCurrentProduct]);
  useEffect(()=>{
    if(!selectedItem||initializedAssetId.current===selectedItem.id)return;initializedAssetId.current=selectedItem.id;
    if(approvedProductOwnedUrl.current){URL.revokeObjectURL(approvedProductOwnedUrl.current);approvedProductOwnedUrl.current="";}
    const original=selectedItem.imageState.originalImage?.url??selectedItem.previewUrl;const approvedTransparent=selectedItem.imageState.transparentProduct?.approved?selectedItem.imageState.transparentProduct.url:"";const approvedComposition=selectedItem.imageState.composedImage?.approved?selectedItem.imageState.composedImage.url:"";
    const initialApproved=approvedComposition||approvedTransparent;setIsExtractionApproved(Boolean(approvedTransparent));setOriginalImageUrl(original);setTransparentPreviewUrl(approvedTransparent);setTransparentProductUrl(approvedTransparent);setTransparentProductWithShadowUrl(approvedTransparent);setApprovedTransparentUrl(approvedTransparent);setSmartCroppedUrl("");setSmartCropStatus("idle");setEnhancedPreviewUrl("");setApprovedCompositionUrl(approvedComposition);setActivePreviewUrl(initialApproved);setActiveCompositionSourceUrl(initialApproved);setApprovedAssetUrl(initialApproved);setImagePipeline({sourceUrl:original,extractionPreviewUrl:approvedTransparent||null,approvedTransparentUrl:approvedTransparent||null,displayPreviewUrl:initialApproved||null});setAssetApprovalStatus(initialApproved?"approved":"not-ready");setApprovedAssetKind(approvedComposition?"background-composition":approvedTransparent?"transparent-product":null);
  },[selectedItem]);
  const changeBackgroundProcessingStatus = useCallback((backgroundProcessingStatus: AnalyzedMediaItem["backgroundProcessingStatus"]) => {
    if (!selectedId) return;
    setItems((current) => current.map((item) => {
      if (item.id !== selectedId || (item.backgroundProcessingStatus === backgroundProcessingStatus && backgroundProcessingStatus !== "processing")) return item;
      return { ...item, backgroundProcessingStatus, transparentBackgroundPending: backgroundProcessingStatus === "processing" ? true : item.transparentBackgroundPending };
    }));
  }, [selectedId]);
  const handleTransparentPreviewReady=useCallback((result:{productBlob:Blob;productUrl:string;composedBlob:Blob;composedUrl:string;shadowMode:ShadowMode})=>{setIsExtractionApproved(false);setExtractionProductBlob(result.productBlob);setTransparentProductUrl(result.productUrl);setTransparentProductWithShadowUrl(result.composedUrl);setTransparentPreviewUrl(result.composedUrl);setCurrentShadowMode(result.shadowMode);setImagePipeline(current=>({...current,extractionPreviewUrl:result.composedUrl}));setAssetApprovalStatus(current=>current==="approved"?current:"preview-ready");},[]);

  async function refreshMemory() { setMemoryRecords(await listRecentMemoryRecords()); }
  useEffect(() => { refreshMemory().catch(() => setErrors([memoryCopy.importError])); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function inspectMemory(item: AnalyzedMediaItem) {
    try {
      const fingerprint = await generateImageFingerprint(item.preservedOriginalFile);
      const exact = await findByFingerprint(fingerprint);
      const related = (await findRelatedRecords(createSimilarityKey({ width:item.width,height:item.height,fileSizeBytes:item.preservedOriginalFile.size,filename:item.preservedOriginalFile.name,category:item.provisionalCategory }))).filter(r=>r.fingerprint!==fingerprint);
      setExactMemory(exact ?? null); setRelatedMemory(related);
      setMemoryStatus(exact ? "exactDuplicate" : related.length ? "possiblyRelated" : "new");
      if (exact) await updateMemoryRecord(exact.id, { duplicateDetections: exact.duplicateDetections + 1 });
    } catch { setMemoryStatus("new"); }
  }

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => { URL.revokeObjectURL(item.previewUrl); if (item.imageState.originalImage?.url && item.imageState.originalImage.url !== item.previewUrl) URL.revokeObjectURL(item.imageState.originalImage.url); if (item.imageState.transparentProduct?.url) URL.revokeObjectURL(item.imageState.transparentProduct.url); if (item.imageState.smartCroppedImage?.url) URL.revokeObjectURL(item.imageState.smartCroppedImage.url); if (item.imageState.composedImage?.url) URL.revokeObjectURL(item.imageState.composedImage.url); });if(approvedProductOwnedUrl.current)URL.revokeObjectURL(approvedProductOwnedUrl.current);
  }, []);

  useEffect(() => {
    if (!selectedItem || !advisorDecision) return;
    const signature = `${selectedItem.id}:${advisorDecision.verdict}:${advisorDecision.score}:${selectedItem.categoryConfirmed}:${selectedItem.compatibilityStatus}:${selectedItem.webpConverted}`;
    if (advisorLogSignature.current === signature) return;
    advisorLogSignature.current = signature;
    logDekoBrainEvent("advisorDecisionGenerated", { mediaId: selectedItem.id, filename: selectedItem.filename });
  }, [advisorDecision, selectedItem]);

  useEffect(() => {
    if (!selectedItem || !advisorDecision || !selectedItem.categoryConfirmed || selectedItem.compatibilityStatus === "unknown" || selectedItem.transparentBackgroundPending) return;
    const signature = `${selectedItem.id}:${selectedItem.provisionalCategory}:${selectedItem.compatibilityStatus}:${selectedItem.compatibilityOverride}:${selectedItem.backgroundMode}:${selectedItem.webpConverted}:${selectedItem.preferredWebPQuality}:${advisorDecision.score}:${selectedItem.transparentBackgroundApprovedAt ?? ""}`;
    if (memorySaveSignature.current === signature) return;
    const timer = window.setTimeout(async () => {
      if (memorySaveSignature.current === signature) return;
      try { const result=await rememberMediaAnalysis(selectedItem,advisorDecision); memorySaveSignature.current=signature; setExactMemory(result.record); setMemoryStatus("previouslyAnalyzed"); await refreshMemory(); }
      catch { /* Memory must not block the media workflow. */ }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [advisorDecision, selectedItem]);

  function updateSelectedItem(updater: (item: AnalyzedMediaItem) => AnalyzedMediaItem) {
    if (!selectedItem) return;
    setItems((current) => current.map((item) => item.id === selectedItem.id ? updater(item) : item));
  }

  function selectItem(id: string) {
    const item = items.find((candidate) => candidate.id === id);
    setSelectedId(id);
    setRatio(item?.recommendedCardRatio ?? "original");
    setFit(item?.recommendedFit ?? "contain");
    setPosition(item?.recommendedObjectPosition ?? "center");
    setPreviewTransform({scale:1,x:0,y:0,zoom:1,safeArea:6});
    const fingerprint=item?createMediaFingerprint({name:item.preservedOriginalFile.name,size:item.preservedOriginalFile.size,type:item.preservedOriginalFile.type,lastModified:item.preservedOriginalFile.lastModified,width:item.width,height:item.height}):"";const savedDNA=learningState.productDna.find(dna=>dna.mediaFingerprint===fingerprint);setSelectedProductNature(savedDNA?.history.some(entry=>entry.reason==="categoryCorrected")?savedDNA.category:null);setNatureAnalysisRevision(0);setCurrentLivingIdentityId("");setLivingMatches([]);setCurrentObservation(null);
    initializedAssetId.current="";
    setFeedback("");
    if (item) void inspectMemory(item);
  }

  function handleProductNatureChange(category:ProductNature){if(!productNatureReport||!selectedFingerprint)return;setSelectedProductNature(category);const result=recordCategoryCorrection(createLearningContext(selectedFingerprint,productNatureReport,category));setLearningState(result.state);recordGolden("categoryCorrected",{category});}
  function handleDNASettingsApplied(settings:ProcessingSettings){if(!productNatureReport||!selectedFingerprint)return;const category=selectedProductNature??productNatureReport.nature;const result=recordRecommendationApplied(createLearningContext(selectedFingerprint,productNatureReport,category,settings));setLearningState(result.state);recordGolden("suggestedSettingsApplied",{...settings});}
  function scanIdentity(){if(!selectedItem||!productDNA)return;const silhouette=analyzeSilhouetteDna({width:selectedItem.width,height:selectedItem.height,category:productDNA.category,categoryConfidence:productDNA.confidence,fileName:selectedItem.filename,sourceType:productDNA.sourceType,sceneComplexity:productDNA.sceneComplexity,protectedFeatures:productDNA.protectedFeatures,echoScore:productDNA.echoScore}),updated=updateProductDnaSilhouette(productDNA,silhouette,{decorationVariant:silhouette.ignoreLayers.length>0,sizeVariant:silhouette.estimatedObjectCount>1}),observation=buildIdentityObservation({productDna:updated,silhouette,mediaFingerprint:selectedFingerprint,width:selectedItem.width,height:selectedItem.height,source:updated.sourceType==="phoneCamera"?"phone":updated.sourceType==="generated"?"generated":"unknown",background:updated.sourceType==="generated"?"custom":silhouette.requiresHumanReview?"complex":"unknown"});setLearningState(current=>saveLearningState(replaceProductDNA(current,updated)));setCurrentObservation(observation);const matches=findLivingIdentityMatches(observation,livingIdentities);setLivingMatches(matches);setCurrentLivingIdentityId(matches[0]?.overallScore>=75?matches[0].identityId:"");setNatureAnalysisRevision(value=>value+1);}
  function createNewLivingIdentity(){if(!currentObservation)return;const rejected=livingMatches[0];if(rejected&&["exact","same-product"].includes(rejected.matchType))recordLivingIdentityEvent({type:"identity-match-rejected",identityId:rejected.identityId,mediaFingerprint:currentObservation.mediaFingerprint});const identity=createLivingIdentity(currentObservation,livingIdentities),next=saveLivingIdentities([...livingIdentities,identity]);setLivingIdentities(next);setCurrentLivingIdentityId(identity.identityId);setLivingMatches([]);recordLivingIdentityEvent({type:"identity-created",identityId:identity.identityId,mediaFingerprint:currentObservation.mediaFingerprint});if(currentObservation.resultApproved)recordLivingIdentityEvent({type:"identity-approved",identityId:identity.identityId,mediaFingerprint:currentObservation.mediaFingerprint});}
  function confirmSameLivingIdentity(identityId:string){if(!currentObservation||!productNatureReport)return;const suggested=livingMatches.find(match=>match.identityId===identityId),before=livingIdentities.find(identity=>identity.identityId===identityId),next=saveLivingIdentities(mergeLivingIdentity(identityId,currentObservation,livingIdentities)),after=next.find(identity=>identity.identityId===identityId);setLivingIdentities(next);setCurrentLivingIdentityId(identityId);setLivingMatches([]);recordLivingIdentityEvent({type:suggested?.matchType==="new-product"?"identity-match-corrected":"identity-matched",identityId,mediaFingerprint:currentObservation.mediaFingerprint});if(before&&after){if(after.colorVariants.length>before.colorVariants.length)recordLivingIdentityEvent({type:"color-variant-added",identityId,mediaFingerprint:currentObservation.mediaFingerprint});if(after.sizeVariants.length>before.sizeVariants.length)recordLivingIdentityEvent({type:"size-variant-added",identityId,mediaFingerprint:currentObservation.mediaFingerprint});if(after.captureVariants.length>before.captureVariants.length)recordLivingIdentityEvent({type:"capture-variant-added",identityId,mediaFingerprint:currentObservation.mediaFingerprint});}if(currentObservation.resultApproved)recordLivingIdentityEvent({type:"identity-approved",identityId,mediaFingerprint:currentObservation.mediaFingerprint});const learned=recordIdentityMatch(createLearningContext(currentObservation.mediaFingerprint,productNatureReport,productDNA?.category??productNatureReport.nature,productDNA?.preferredSettings));setLearningState(learned.state);}
  function markSameFamily(identityId:string){setCurrentLivingIdentityId(identityId);}

  async function handleFiles(files: File[]) {
    const nextErrors: string[] = [];
    const remainingSlots = Math.max(0, MAX_FILES - itemsRef.current.length);
    const accepted: File[] = [];

    for (const file of files) {
      if (!SUPPORTED_TYPES.has(file.type)) {
        nextErrors.push(interpolateDekoBrainText(copy.errors.unsupported, { name: file.name }));
      } else if (file.size > MAX_FILE_SIZE) {
        nextErrors.push(interpolateDekoBrainText(copy.errors.tooLarge, { name: file.name }));
      } else if (accepted.length >= remainingSlots) {
        if (!nextErrors.includes(copy.errors.limit)) nextErrors.push(copy.errors.limit);
      } else {
        accepted.push(file);
      }
    }

    setErrors(nextErrors);
    if (accepted.length === 0) return;
    setIsAnalyzing(true);

    const results = await Promise.allSettled(accepted.map(analyzeImageFile));
    const analyzed: AnalyzedMediaItem[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        analyzed.push(result.value);
        logDekoBrainEvent("fileImported", { mediaId: result.value.id, filename: result.value.filename });
        logDekoBrainEvent("technicalAnalysisCompleted", { mediaId: result.value.id, filename: result.value.filename });
      }
      else nextErrors.push(interpolateDekoBrainText(copy.errors.unreadable, { name: accepted[index].name }));
    });

    setErrors([...nextErrors]);
    setItems((current) => [...current, ...analyzed]);
    if (analyzed[0]) {
      setSelectedId((current) => current ?? analyzed[0].id);
      if (!selectedId) {
        setRatio(analyzed[0].recommendedCardRatio);
        setFit(analyzed[0].recommendedFit);
        setPosition(analyzed[0].recommendedObjectPosition);
      }
      void inspectMemory(analyzed[0]);
    }
    setIsAnalyzing(false);
  }

  useEffect(()=>{if(!initialFile)return;const signature=`${initialFile.name}:${initialFile.size}:${initialFile.lastModified}`;if(importedInitialFileRef.current===signature)return;importedInitialFileRef.current=signature;void handleFiles([initialFile]);},[initialFile]); // eslint-disable-line react-hooks/exhaustive-deps

  async function rerunAnalysis() {
    if (!selectedItem || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrors([]);
    try {
      const result = await analyzeImageFile(selectedItem.originalFile);
      const replacement: AnalyzedMediaItem = {
        ...result,
        id: selectedItem.id,
        status: selectedItem.status === "approved" ? "approved" : result.status,
        preservedOriginalFile: selectedItem.preservedOriginalFile,
        provisionalCategory: selectedItem.provisionalCategory,
        categorySource: selectedItem.categorySource,
        categoryConfirmed: selectedItem.categoryConfirmed,
        compatibilityStatus: selectedItem.compatibilityStatus,
        compatibilityOverride: selectedItem.compatibilityOverride,
        backgroundMode: selectedItem.backgroundMode,
        webpConverted: selectedItem.webpConverted || result.webpConverted,
        imageState: selectedItem.imageState,
        preferredWebPQuality: selectedItem.preferredWebPQuality,
        convertedSizeBytes: selectedItem.convertedSizeBytes,
      };
      if (selectedItem.previewUrl !== selectedItem.imageState.originalImage?.url) URL.revokeObjectURL(selectedItem.previewUrl);
      setItems((current) => current.map((item) => item.id === selectedItem.id ? replacement : item));
      setFit(replacement.recommendedFit);
      setRatio(replacement.recommendedCardRatio);
      setPosition(replacement.recommendedObjectPosition);
      logDekoBrainEvent("technicalAnalysisCompleted", { mediaId: replacement.id, filename: replacement.filename });
    } catch {
      setErrors([interpolateDekoBrainText(copy.errors.unreadable, { name: selectedItem.filename })]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function setItemStatus(status: "approved" | "needsReview") {
    if (!selectedItem) return;
    setItems((current) => current.map((item) => item.id === selectedItem.id ? { ...item, status } : item));
    setFeedback(status === "approved" ? copy.approvedMessage : copy.reviewMessage);
  }

  function changeCategory(category: ProvisionalCategory) {
    updateSelectedItem((item) => ({
      ...item,
      provisionalCategory: category,
      categorySource: "user",
      categoryConfirmed: false,
      compatibilityOverride: "none",
      compatibilityStatus: evaluateCompatibility(category),
    }));
    if(productNatureReport&&selectedFingerprint){const normalized=normalizeProductCategory(category);setSelectedProductNature(normalized);const result=recordCategoryCorrection(createLearningContext(selectedFingerprint,productNatureReport,normalized));setLearningState(result.state);}
  }

  function confirmCategory() {
    if (!selectedItem) return;
    updateSelectedItem((item) => ({ ...item, categoryConfirmed: true, categorySource: "user" }));
    logDekoBrainEvent("categoryConfirmed", { mediaId: selectedItem.id, filename: selectedItem.filename });
    recordGolden("categoryConfirmed",{category:selectedProductNature??selectedItem.provisionalCategory});
    if(productNatureReport&&selectedFingerprint){const category=selectedProductNature??normalizeProductCategory(selectedItem.provisionalCategory);const result=recordCategoryConfirmation(createLearningContext(selectedFingerprint,productNatureReport,category==="unknown"?productNatureReport.nature:category,productDNA?.preferredSettings));setLearningState(result.state);}
  }

  function changeCompatibilityOverride(override: CompatibilityOverride) {
    if (!selectedItem) return;
    updateSelectedItem((item) => ({
      ...item,
      compatibilityOverride: override,
      compatibilityStatus: evaluateCompatibility(item.provisionalCategory, override),
    }));
    logDekoBrainEvent("compatibilityReviewed", { mediaId: selectedItem.id, filename: selectedItem.filename });
  }

  function changeBackgroundMode(backgroundMode: BackgroundMode) {
    updateSelectedItem((item) => ({ ...item, backgroundMode, transparentBackgroundPending: backgroundMode === "transparent" ? true : item.transparentBackgroundPending, backgroundProcessingStatus: backgroundMode === "transparent" ? item.backgroundProcessingStatus : "idle" }));
  }

  async function persistApprovedStudioImage(blob:Blob,input:{name:string;width:number;height:number;source:"transparent-product"|"background-studio"|"product-preview"}){const permanentDataUrl=await blobToDataUrl(blob);saveApprovedStudioImage({id:typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():`approved-${Date.now()}`,name:input.name||"transparent-product.png",dataUrl:permanentDataUrl,mimeType:"image/png",width:input.width,height:input.height,source:input.source,approvedAt:new Date().toISOString()});const savedImage=getApprovedStudioImage();if(!savedImage?.dataUrl)throw new Error("approved-image-not-persisted");window.dispatchEvent(new CustomEvent("eco-studio-state-change"));return savedImage}

  async function approveTransparentBackground(result: { blob: Blob; url: string; threshold: number; softness: number; protection: number }) {
    if (!selectedItem || !advisorDecision) return;
    const approvedAt = new Date().toISOString();
    if(selectedItem.imageState.smartCroppedImage?.url)URL.revokeObjectURL(selectedItem.imageState.smartCroppedImage.url);
    const approvedUrl=imagePipeline.extractionPreviewUrl;if(!approvedUrl||!extractionProductBlob){setFeedback(dekoBrainPreviewTranslations[lang].approvedAssetRequired);return;}const approvedBlob=result.blob;const approvedProductUrl=URL.createObjectURL(extractionProductBlob);const previousProductUrl=approvedProductOwnedUrl.current;approvedProductOwnedUrl.current=approvedProductUrl;
    const approvedItem: AnalyzedMediaItem = { ...selectedItem, backgroundMode: "transparent", backgroundProcessingStatus: "ready", transparentBackgroundPending: false, transparentBackgroundApproved: true, transparentBackgroundBlob: approvedBlob, transparentBackgroundUrl: approvedUrl, transparentBackgroundThreshold: result.threshold, transparentBackgroundSoftness: result.softness, transparentBackgroundProtection: result.protection, transparentBackgroundApprovedAt: approvedAt, imageState:{...selectedItem.imageState,transparentProduct:{blob:approvedBlob,url:approvedUrl,width:selectedItem.imageState.smartCroppedImage?.width??selectedItem.width,height:selectedItem.imageState.smartCroppedImage?.height??selectedItem.height,approved:true}} };
    const previousApprovedUrl=selectedItem.imageState.transparentProduct?.url;updateSelectedItem(() => approvedItem);
    setFeedback(advisorCopy.transparentApproved);
    const kind:ApprovedAssetKind=currentShadowMode==="experimental-remove"?"transparent-product":"transparent-product-with-shadow";setIsExtractionApproved(true);setApprovedTransparentUrl(approvedProductUrl);setApprovedAssetUrl(approvedUrl);setActivePreviewUrl(approvedUrl);setActiveCompositionSourceUrl(approvedUrl);setImagePipeline(current=>({...current,approvedTransparentUrl:approvedProductUrl,displayPreviewUrl:approvedUrl}));setAssetApprovalStatus("approved");setApprovedAssetKind(kind);setRatio("original");setFit("contain");setPosition("center");setPreviewTransform({scale:1,x:0,y:0,zoom:1,safeArea:6});setSmartCropStatus("idle");setSmartCroppedUrl("");if(previousProductUrl&&previousProductUrl!==approvedProductUrl)queueMicrotask(()=>URL.revokeObjectURL(previousProductUrl));
    if(previousApprovedUrl&&previousApprovedUrl!==approvedUrl)queueMicrotask(()=>URL.revokeObjectURL(previousApprovedUrl));
    logDekoBrainEvent("transparentProductApproved", { mediaId: selectedItem.id, filename: selectedItem.filename });
    recordGolden("transparentProductApproved",{threshold:result.threshold,softness:result.softness,protection:result.protection});
    if(productNatureReport&&selectedFingerprint){const settings:ProcessingSettings={backgroundSensitivity:result.threshold,edgeSoftness:result.softness,detailProtection:result.protection,shadowMode:currentShadowMode==="experimental-remove"?"removeExperimental":currentShadowMode};const learned=recordResultApproval(createLearningContext(selectedFingerprint,productNatureReport,selectedProductNature??productNatureReport.nature,settings));setLearningState(learned.state);}
    onApprovedAsset?.({blob:approvedBlob,fileName:`${selectedItem.filename.replace(/\.[^.]+$/,"")}-transparent.png`,mimeType:approvedBlob.type||"image/png",width:selectedItem.width,height:selectedItem.height});
    try{await persistApprovedStudioImage(approvedBlob,{name:selectedItem.filename||"transparent-product.png",width:selectedItem.width,height:selectedItem.height,source:"transparent-product"});setFeedback("تم اعتماد المنتج الشفاف وحفظه داخل EcoDekoKraft Studio.")}catch{setFeedback("تعذر حفظ الصورة النهائية.")}
    try {
      const remembered = await rememberMediaAnalysis(approvedItem, advisorDecision);
      memorySaveSignature.current = `${approvedItem.id}:${approvedItem.provisionalCategory}:${approvedItem.compatibilityStatus}:${approvedItem.compatibilityOverride}:${approvedItem.backgroundMode}:${approvedItem.webpConverted}:${approvedItem.preferredWebPQuality}:${advisorDecision.score}:${approvedAt}`;
      setExactMemory(remembered.record);
      setMemoryStatus("previouslyAnalyzed");
      await refreshMemory();
    } catch { /* Background approval remains usable when local memory is unavailable. */ }
  }

  function autoEnhancePreview(){
    previousManualState.current={activePreviewUrl,fitMode:fit,aspectRatio:ratio,transform:previewTransform};setEnhancedPreviewUrl(activePreviewUrl);setActivePreviewUrl(activePreviewUrl);setFit("contain");setPosition("center");setPreviewTransform(current=>({...current,scale:.7,x:0,y:0,zoom:1}));setFeedback(dekoBrainPreviewTranslations[lang].autoSuccess);
  }

  async function smartCropPreview(){
    const cropSource=imagePipeline.approvedTransparentUrl;if(!cropSource){setFeedback(dekoBrainPreviewTranslations[lang].cropNeedsTransparent);setSmartCropStatus("error");return;}setSmartCropStatus("processing");previousManualState.current={activePreviewUrl:imagePipeline.displayPreviewUrl??"",fitMode:fit,aspectRatio:ratio,transform:previewTransform};
    try{const bounds=await getTransparentAlphaBounds(cropSource);const scale=Math.max(1,Math.min(bounds.sourceWidth/bounds.width,bounds.sourceHeight/bounds.height)*.9);const x=-(bounds.minX+bounds.width/2-bounds.sourceWidth/2);const y=-(bounds.minY+bounds.height/2-bounds.sourceHeight/2);setPreviewTransform(current=>({...current,scale,x,y,zoom:1}));setPosition("center");setSmartCropStatus("active");setFeedback(dekoBrainPreviewTranslations[lang].cropSuccess);}catch{setSmartCropStatus("error");setFeedback(dekoBrainPreviewTranslations[lang].cropNeedsTransparent);}
  }

  function undoSmartCrop(){const previous=previousManualState.current;setSmartCropStatus("idle");if(previous){setFit(previous.fitMode);setRatio(previous.aspectRatio);setPreviewTransform(previous.transform);}else setPreviewTransform(current=>({...current,scale:1,x:0,y:0,zoom:1}));setPosition("center");}

  async function useOriginalImage(){if(!selectedItem)return;setItemStatus("approved");setFit("contain");setRatio("original");setPosition("center");setPreviewTransform({scale:1,x:0,y:0,zoom:1,safeArea:6});setEnhancedPreviewUrl("");setSmartCroppedUrl("");setSmartCropStatus("idle");setFeedback(copy.approvedMessage);recordGolden("resultApproved",{source:"original"});try{await persistApprovedStudioImage(selectedItem.originalFile,{name:selectedItem.filename,width:selectedItem.width,height:selectedItem.height,source:"product-preview"});setFeedback("تم اعتماد الصورة وحفظها داخل EcoDekoKraft Studio.")}catch{setFeedback("تعذر حفظ الصورة النهائية.")}}

  async function approveComposedBackground(result:{blob:Blob;url:string;backgroundType:BackgroundStudioType;settings:DekoBrainCompositionSettings}){
    if(!selectedItem||!advisorDecision)return;
    const next:AnalyzedMediaItem={...selectedItem,backgroundMode:result.backgroundType==="blur"?"blur":result.backgroundType==="white"?"white":result.backgroundType==="transparent"?"transparent":"original",imageState:{...selectedItem.imageState,composedImage:{...result,approved:true}}};
    if(selectedItem.imageState.composedImage?.url&&selectedItem.imageState.composedImage.url!==result.url)URL.revokeObjectURL(selectedItem.imageState.composedImage.url);
    setItems(current=>current.map(item=>item.id===selectedItem.id?next:item));
    logDekoBrainEvent("backgroundCompositionApproved",{mediaId:selectedItem.id,filename:selectedItem.filename});
    recordGolden("backgroundApproved",{backgroundType:result.backgroundType});
    setFeedback(studioCopy.approved);
    setApprovedCompositionUrl(result.url);setApprovedAssetUrl(result.url);setActivePreviewUrl(result.url);setActiveCompositionSourceUrl(result.url);setImagePipeline(current=>({...current,displayPreviewUrl:result.url}));setAssetApprovalStatus("approved");setApprovedAssetKind("background-composition");
    onApprovedAsset?.({blob:result.blob,fileName:`${selectedItem.filename.replace(/\.[^.]+$/,"")}-final.png`,mimeType:result.blob.type||"image/png",width:selectedItem.width,height:selectedItem.height});
    try{await persistApprovedStudioImage(result.blob,{name:`${selectedItem.filename.replace(/\.[^.]+$/,"")}-final.png`,width:selectedItem.width,height:selectedItem.height,source:"background-studio"});setFeedback("تم اعتماد الخلفية وحفظها داخل EcoDekoKraft Studio.")}catch{setFeedback("تعذر حفظ الصورة النهائية.")}
    try{await rememberMediaAnalysis(next,runDecisionEngine(next));await refreshMemory();}catch{}
  }

  async function useConvertedFile(file: File) {
    if (!selectedItem) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageFile(file);
      const replacement: AnalyzedMediaItem = {
        ...result,
        id: selectedItem.id,
        preservedOriginalFile: selectedItem.preservedOriginalFile,
        provisionalCategory: selectedItem.provisionalCategory,
        categorySource: selectedItem.categorySource,
        categoryConfirmed: selectedItem.categoryConfirmed,
        compatibilityStatus: selectedItem.compatibilityStatus,
        compatibilityOverride: selectedItem.compatibilityOverride,
        backgroundMode: selectedItem.backgroundMode,
        imageState: selectedItem.imageState,
        webpConverted: true,
        preferredWebPQuality: selectedItem.preferredWebPQuality,
        convertedSizeBytes: file.size,
      };
      if (selectedItem.previewUrl !== selectedItem.imageState.originalImage?.url) URL.revokeObjectURL(selectedItem.previewUrl);
      setItems((current) => current.map((item) => item.id === selectedItem.id ? replacement : item));
      setFeedback(copy.approvedMessage);
      recordGolden("webpApproved",{size:file.size,type:file.type});
    } catch {
      setErrors([advisorCopy.conversionError]);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleAdvisorNextAction() {
    if (!selectedItem || !advisorDecision) return;
    if (advisorDecision.nextAction === "confirmCategory") confirmCategory();
    else if (advisorDecision.nextAction === "reviewCompatibility") changeCompatibilityOverride("approved");
    else if (advisorDecision.nextAction === "useAsIs") setItemStatus("approved");
    else document.getElementById("dkbrain-webp-conversion")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function removeSelected() {
    if (!selectedItem) return;
    URL.revokeObjectURL(selectedItem.previewUrl);
    if (selectedItem.imageState.originalImage?.url && selectedItem.imageState.originalImage.url !== selectedItem.previewUrl) URL.revokeObjectURL(selectedItem.imageState.originalImage.url);
    if (selectedItem.transparentBackgroundUrl) URL.revokeObjectURL(selectedItem.transparentBackgroundUrl);
    if (selectedItem.imageState.transparentProduct?.url) URL.revokeObjectURL(selectedItem.imageState.transparentProduct.url);
    if (selectedItem.imageState.smartCroppedImage?.url) URL.revokeObjectURL(selectedItem.imageState.smartCroppedImage.url);
    if (selectedItem.imageState.composedImage?.url) URL.revokeObjectURL(selectedItem.imageState.composedImage.url);
    const remaining = items.filter((item) => item.id !== selectedItem.id);
    setItems(remaining);
    itemsRef.current = remaining;
    const nextItem = remaining[0] ?? null;
    setSelectedId(nextItem?.id ?? null);
    setRatio(nextItem?.recommendedCardRatio ?? "original");
    setFit(nextItem?.recommendedFit ?? "contain");
    setPosition(nextItem?.recommendedObjectPosition ?? "center");
    setPreviewTransform({scale:1,x:0,y:0,zoom:1,safeArea:6});
    setFeedback("");
    if(!nextItem){productAnalysisProcessId.current++;setProductProfile(null);setProductAnalysisError(null);setIsAnalyzingProduct(false);productAnalysisSignature.current="";}
  }

  async function reuseMemory(record:DekoBrainMemoryRecord) {
    if (!selectedItem) return;
    updateSelectedItem(item=>({...item,provisionalCategory:record.category,categorySource:"user",categoryConfirmed:record.categoryConfirmed,compatibilityOverride:record.compatibilityOverride,compatibilityStatus:evaluateCompatibility(record.category,record.compatibilityOverride),backgroundMode:record.backgroundMode,preferredWebPQuality:record.webpQuality??82}));
    await updateMemoryRecord(record.id,{lastUsedAt:new Date().toISOString()}); setFeedback(memoryCopy.saved); await refreshMemory();
  }
  async function deleteMemory(record:DekoBrainMemoryRecord){await deleteMemoryRecord(record.id);if(exactMemory?.id===record.id){setExactMemory(null);setMemoryStatus("new");}await refreshMemory();}
  async function exportMemory(){const blob=new Blob([await exportMemoryMetadata()],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="dekobrain-memory.json";a.click();URL.revokeObjectURL(url);}
  async function importMemory(file:File){try{await importMemoryMetadata(await file.text());await refreshMemory();setFeedback(memoryCopy.saved);}catch{setErrors([memoryCopy.importError]);}}
  function exportLearning(){const blob=new Blob([exportLearningState()],{type:"application/json"}),url=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=url;anchor.download="dekobrain-learning-v1.json";anchor.click();URL.revokeObjectURL(url)}
  function clearLearning(){setLearningState(resetLearningState());setSelectedProductNature(null)}
  function recordGolden(type:DekoBrainGoldenEventType,payload:Record<string,string|number|boolean|null>={}){if(!selectedItem)return;setStoredGoldenState(current=>recordDekoBrainEvent(current,{type,productId:productDNA?.id??selectedItem.id,imageId:selectedFingerprint||selectedItem.id,payload}))}
  function saveGolden(){saveGoldenArchitectureState(goldenState);setStoredGoldenState(goldenState);setSavedGoldenAt(new Date().toLocaleTimeString())}

  const showPreview=view==="full"||view==="preview"||view==="webp";
  const showExtraction=view==="full"||view==="analysis"||view==="extraction"||view==="backgrounds"||view==="product-memory";
  const showBackgroundStudio=view==="full"||view==="backgrounds";
  const showWebP=view==="full"||view==="webp";
  const showMemory=view==="full"||view==="product-memory";

  return (
    <div className={`dkBrainPage ${view==="full"?"":"dkBrainPage--tool"}`} data-dekobrain-view={view} dir={lang === "ar" ? "rtl" : "ltr"}>
      <section className="dkBrainHero">
        <div><h2>{copy.title}</h2><p>{copy.subtitle}</p></div>
        <div className="dkBrainTemporaryNotice">ⓘ {copy.temporaryNotice}</div>
      </section>

      <MediaDropzone copy={copy} disabled={isAnalyzing || items.length >= MAX_FILES} onFiles={handleFiles} />
      {isAnalyzing && <div className="dkBrainLoading" role="status">◌ {copy.stageStatuses.analyzing}</div>}
      {errors.length > 0 && <div className="dkBrainErrorList" role="alert"><ul>{errors.map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul></div>}

      {view!=="analysis"&&<MediaList copy={copy} items={items} selectedId={selectedId} onSelect={selectItem} />}

      {selectedItem && (
        <>
          {showPreview&&<div className="dkBrainWorkspace">
            <MediaPreview copy={copy} locale={lang} item={selectedItem} ratio={ratio} fit={fit} position={position} previewSourceUrl={imagePipeline.displayPreviewUrl??""} sourceAvailable={Boolean(imagePipeline.displayPreviewUrl)} sourceWidth={selectedItem.width} sourceHeight={selectedItem.height} transform={previewTransform} setTransform={setPreviewTransform} smartCropActive={smartCropStatus==="active"} onUndoSmartCrop={undoSmartCrop} onRatioChange={setRatio} onFitChange={setFit} onPositionChange={setPosition} />
            <MediaAnalysisPanel copy={copy} item={selectedItem} />
          </div>}

          {showPreview&&<div className="dkBrainActionBar">
            <button type="button" onClick={rerunAnalysis} disabled={isAnalyzing}>{copy.actions.analyze}</button>
            <button type="button" onClick={useOriginalImage}>{copy.actions.useAsIs}</button>
            <button type="button" onClick={autoEnhancePreview}>{copy.actions.autoEnhance}</button>
            <button type="button" className={smartCropStatus==="active"?"active":smartCropStatus==="error"?"warning":""} disabled={!canSmartCrop||smartCropStatus==="processing"} title={!canSmartCrop?dekoBrainPreviewTranslations[lang].cropNeedsTransparent:undefined} onClick={smartCropPreview}>{smartCropStatus==="processing"?dekoBrainPreviewTranslations[lang].smartCropProcessing:smartCropStatus==="active"?dekoBrainPreviewTranslations[lang].smartCropActive:copy.actions.smartCrop}</button>
            <button type="button" onClick={() => document.getElementById("dkbrain-webp-conversion")?.scrollIntoView({ behavior: "smooth", block: "center" })}>{copy.actions.convertWebp}</button>
            <button type="button" onClick={() => setItemStatus("needsReview")}>{copy.actions.review}</button>
            <button type="button" className="danger" onClick={removeSelected}>{copy.actions.remove}</button>
          </div>}
          {feedback && <div className="dkBrainFeedback" role="status">✓ {feedback}</div>}
          {showExtraction&&<div className="dkBrainExtendedWorkspace">
            <ContentCompatibilityPanel copy={advisorCopy} item={selectedItem} onCategoryChange={changeCategory} onCategoryConfirm={confirmCategory} onOverrideChange={changeCompatibilityOverride} />
            <BackgroundOptionsPanel key={selectedItem.id} copy={advisorCopy} item={selectedItem} isApproved={isExtractionApproved} analysisOnly={view==="analysis"} productNatureCopy={productNatureCopy} productNatureReport={productNatureReport} productDNA={productDNA} learningState={learningState} learningCopy={learningCopy} silhouetteCopy={silhouetteCopy} livingCopy={livingCopy} livingIdentities={livingIdentities} livingIdentity={livingIdentities.find(identity=>identity.identityId===currentLivingIdentityId)??null} livingMatches={livingMatches} onScanIdentity={scanIdentity} onSameIdentity={confirmSameLivingIdentity} onSameFamily={markSameFamily} onNewIdentity={createNewLivingIdentity} selectedProductNature={selectedProductNature} onProductNatureChange={handleProductNatureChange} onDNASettingsApplied={handleDNASettingsApplied} onReanalyzeNature={()=>{setNatureAnalysisRevision(value=>value+1);void analyzeCurrentProduct();}} onProcessingStatusChange={changeBackgroundProcessingStatus} onPreviewReady={handleTransparentPreviewReady} onApprove={approveTransparentBackground} />
          </div>}
          {showMemory&&<DekoBrainMemoryInspector copy={learningCopy} state={learningState} onExport={exportLearning} onReset={clearLearning}/>} 
          {view==="full"&&<DekoBrainGoldenArchitecture state={goldenState} copy={goldenCopy} onSave={saveGolden} savedAt={savedGoldenAt}/>} 
          {showBackgroundStudio&&<DekoBrainBackgroundStudio key={selectedItem.id} copy={studioCopy} item={selectedItem} locale={lang} approvedAssetUrl={approvedAssetUrl} canUseApprovedAsset={canUseApprovedAsset} onApprove={approveComposedBackground} onCanvaExport={()=>recordGolden("sentToCanva")} onBack={()=>document.getElementById("dkbrain-product-extraction")?.scrollIntoView({behavior:"smooth",block:"start"})} />}
          {view==="full"&&<AIMarketingStudio key={`marketing-${selectedItem.id}`} locale={lang} isImageApproved={canUseApprovedAsset} sourceUrl={approvedAssetUrl} onContentCreated={()=>recordGolden("marketingContentCreated")} />}
          {showWebP&&<WebPConversionPanel
            copy={advisorCopy}
            item={selectedItem}
            sourceFile={approvedAssetFile}
            isSourceApproved={canUseApprovedAsset}
            disabledReason={dekoBrainPreviewTranslations[lang].approvedAssetRequired}
            onConverted={(result:WebPConversionResult) => {
              updateSelectedItem((item) => ({ ...item, webpConverted: result.previewUrl ? true : item.webpConverted, preferredWebPQuality: result.quality, convertedSizeBytes: result.previewUrl ? result.convertedSizeBytes : item.convertedSizeBytes }));
              if (!result.previewUrl) return;
              logDekoBrainEvent("webpConverted", { mediaId: selectedItem.id, filename: selectedItem.filename });
              recordGolden("webpCreated",{quality:result.quality,size:result.convertedSizeBytes});
            }}
            onUseConverted={useConvertedFile}
          />}
          {view==="full"&&advisorDecision&&<DekoBrainAdvisorCard copy={advisorCopy} decision={advisorDecision} onNextAction={handleAdvisorNextAction} />}
          {view==="full"&&<ProcessingStages copy={copy} advisorCopy={advisorCopy} item={selectedItem} />}
          {showMemory&&<DekoBrainMemoryPanel copy={memoryCopy} records={memoryRecords} status={memoryStatus} exact={exactMemory} related={relatedMemory} categoryLabels={advisorCopy.categories} verdictLabels={advisorCopy.verdicts} onReuse={reuseMemory} onAnalyzeAgain={rerunAnalysis} onDelete={deleteMemory} onExport={exportMemory} onImport={importMemory} onClear={async()=>{await clearMemory();setExactMemory(null);setRelatedMemory([]);setMemoryStatus("new");await refreshMemory();}} />}
        </>
      )}
    </div>
  );
}

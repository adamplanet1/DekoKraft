"use client";
import { useEffect, useRef, useState } from "react";
import type { DekoBrainAdvisorCopy } from "../../config/dekoBrainAdvisorTranslations";
import { composeExtractionLayers, removeSimpleBackgroundWithAnalysis } from "../../lib/dekobrain/removeSimpleBackground";
import type { AnalyzedMediaItem, BackgroundProcessingStatus, ShadowMode } from "../../types/dekobrain";
import ProductNatureReportCard from "./ProductNatureReportCard";
import type {ProductNatureCopy} from "../../config/dekoBrainProductNatureTranslations";
import type {ProductNature,ProductNatureReport} from "../../lib/dekobrain/productNatureAnalyzer";
import type {DekoBrainLearningState,ProcessingSettings,ProductDNA} from "../../lib/dekobrain/learning";
import type {LearningCopy} from "../../config/dekoBrainLearningTranslations";
import ProductDNACard from "./ProductDNACard";
import EchoLearningCard from "./EchoLearningCard";
import SilhouetteDNACard from "./SilhouetteDNACard";import type {SilhouetteCopy} from "../../config/dekoBrainSilhouetteTranslations";
import LivingIdentityCard from "./LivingIdentityCard";import type {LivingIdentityCopy} from "../../config/dekoBrainLivingIdentityTranslations";import type {LivingIdentity,LivingIdentityMatch} from "../../lib/dekobrain/livingIdentity";

export default function BackgroundOptionsPanel({ copy, item, isApproved, analysisOnly=false, productNatureCopy, productNatureReport, productDNA, learningState, learningCopy, silhouetteCopy, livingCopy, livingIdentities, livingIdentity, livingMatches, onScanIdentity, onSameIdentity, onSameFamily, onNewIdentity, selectedProductNature, onProductNatureChange, onDNASettingsApplied, onReanalyzeNature, onProcessingStatusChange, onApprove, onPreviewReady }:{
  copy:DekoBrainAdvisorCopy; item:AnalyzedMediaItem;
  isApproved:boolean;
  analysisOnly?:boolean;
  productNatureCopy:ProductNatureCopy;productNatureReport:ProductNatureReport|null;selectedProductNature:ProductNature|null;onProductNatureChange:(value:ProductNature)=>void;onReanalyzeNature:()=>void;
  productDNA:ProductDNA|null;learningState:DekoBrainLearningState;learningCopy:LearningCopy;onDNASettingsApplied:(settings:ProcessingSettings)=>void;
  silhouetteCopy:SilhouetteCopy;livingCopy:LivingIdentityCopy;livingIdentities:LivingIdentity[];livingIdentity:LivingIdentity|null;livingMatches:LivingIdentityMatch[];onScanIdentity:()=>void;onSameIdentity:(id:string)=>void;onSameFamily:(id:string)=>void;onNewIdentity:()=>void;
  onProcessingStatusChange:(status:BackgroundProcessingStatus)=>void;
  onApprove:(result:{blob:Blob;url:string;threshold:number;softness:number;protection:number})=>void;
  onPreviewReady:(result:{productBlob:Blob;productUrl:string;composedBlob:Blob;composedUrl:string;shadowMode:ShadowMode})=>void;
}) {
  const [threshold,setThreshold]=useState(item.transparentBackgroundThreshold??42);
  const [softness,setSoftness]=useState(item.transparentBackgroundSoftness??28);
  const [protection,setProtection]=useState(item.transparentBackgroundProtection??85);
  const [shadowMode,setShadowMode]=useState<ShadowMode>("keep");
  const [transparentUrl,setTransparentUrl]=useState(item.imageState.transparentProduct?.url??"");
  const [processedBlob,setProcessedBlob]=useState<Blob|null>(item.imageState.transparentProduct?.blob??null);
  const [productBlob,setProductBlob]=useState<Blob|null>(null);const [shadowBlob,setShadowBlob]=useState<Blob|null>(null);
  const [status,setStatus]=useState<BackgroundProcessingStatus>(item.imageState.transparentProduct?.approved?"ready":"idle");
  const [compare,setCompare]=useState(false);
  const [suggestionsApplied,setSuggestionsApplied]=useState(false);
  const [scanStep,setScanStep]=useState(-1);
  const generatedUrl=useRef("");const productUrlRef=useRef("");
  const extractionProcessId=useRef(0);const compositionProcessId=useRef(0);
  const originalUrl=item.imageState.originalImage?.url??item.previewUrl;

  useEffect(()=>()=>{if(generatedUrl.current)URL.revokeObjectURL(generatedUrl.current);if(productUrlRef.current)URL.revokeObjectURL(productUrlRef.current);},[]);
  useEffect(()=>{
    if(analysisOnly)return;
    let cancelled=false;
    const timer=window.setTimeout(async()=>{
      const processId=++extractionProcessId.current;
      setStatus("processing");onProcessingStatusChange("processing");
      try{
        const result=await removeSimpleBackgroundWithAnalysis(originalUrl,{threshold,softness,protection,shadowMode:"keep"});
        if(cancelled||processId!==extractionProcessId.current)return;
        const productUrl=URL.createObjectURL(result.productBlob);const previous=productUrlRef.current;productUrlRef.current=productUrl;setProductBlob(result.productBlob);setShadowBlob(result.shadowBlob);if(previous)URL.revokeObjectURL(previous);
        const next=result.isComplex?"complex":"idle";setStatus(result.isComplex?"complex":"ready");onProcessingStatusChange(next);
      }catch{if(!cancelled){setStatus("error");onProcessingStatusChange("error");}}
    },350);
    return()=>{cancelled=true;window.clearTimeout(timer);};
  },[analysisOnly,originalUrl,threshold,softness,protection,onProcessingStatusChange]);
  useEffect(()=>{if(analysisOnly||!productBlob||!shadowBlob||!productUrlRef.current)return;let cancelled=false;const processId=++compositionProcessId.current;(async()=>{try{const composedBlob=await composeExtractionLayers(productBlob,shadowBlob,shadowMode);if(cancelled||processId!==compositionProcessId.current)return;const composedUrl=URL.createObjectURL(composedBlob);const previous=generatedUrl.current;generatedUrl.current=composedUrl;setTransparentUrl(composedUrl);setProcessedBlob(composedBlob);onPreviewReady({productBlob,productUrl:productUrlRef.current,composedBlob,composedUrl,shadowMode});if(previous&&previous!==composedUrl)URL.revokeObjectURL(previous);setStatus("ready");onProcessingStatusChange("idle");}catch{if(!cancelled)setStatus("error");}})();return()=>{cancelled=true;};},[analysisOnly,productBlob,shadowBlob,shadowMode,onPreviewReady,onProcessingStatusChange]);

  function approve(){if(!processedBlob||!transparentUrl||status==="processing"||status==="error")return;onApprove({blob:processedBlob,url:transparentUrl,threshold,softness,protection});generatedUrl.current="";setStatus("ready");}
  function applySuggestedSettings(){if(!productDNA||productDNA.confidence<40||productDNA.sceneComplexity==="complex")return;const settings=productDNA.preferredSettings;setThreshold(settings.backgroundSensitivity);setSoftness(Math.min(50,settings.edgeSoftness));setProtection(Math.max(50,settings.detailProtection));setShadowMode(settings.shadowMode==="removeExperimental"?"experimental-remove":settings.shadowMode);onDNASettingsApplied(settings);setSuggestionsApplied(true);}
  async function scan(){if(scanStep>=0)return;for(let step=0;step<livingCopy.scanSteps.length;step++){setScanStep(step);await new Promise(resolve=>window.setTimeout(resolve,95));}onScanIdentity();onReanalyzeNature();setScanStep(-1);}
  const unsafeSensitivity=threshold>85;

  return <section className="dkBrainPanel dkBrainBackgroundPanel" id="dkbrain-product-extraction">
    {!analysisOnly&&<><div className="dkBrainSectionHeading"><div><span>07</span><h2>{copy.backgroundTitle}</h2></div></div><p>{copy.backgroundExtractionDescription}</p></>}
    {productNatureReport&&<ProductNatureReportCard copy={productNatureCopy} report={productNatureReport} category={selectedProductNature??productNatureReport.nature} onCategoryChange={value=>{setSuggestionsApplied(false);onProductNatureChange(value)}} onApply={applySuggestedSettings} onReanalyze={scan} applied={suggestionsApplied} canApply={Boolean(productDNA&&productDNA.confidence>=40&&productDNA.sceneComplexity!=="complex")}/>} 
    {productDNA&&<><ProductDNACard dna={productDNA} copy={learningCopy} natureCopy={productNatureCopy}/><EchoLearningCard dna={productDNA} state={learningState} copy={learningCopy}/></>} 
    <SilhouetteDNACard result={productDNA?.silhouetteDna??null} copy={silhouetteCopy} status={scanStep>=0?livingCopy.scanSteps[scanStep]:""}/>
    <LivingIdentityCard identity={livingIdentity} matches={livingMatches} identities={livingIdentities} copy={livingCopy} onSame={onSameIdentity} onFamily={onSameFamily} onNew={onNewIdentity}/>
    {!analysisOnly&&<><div className={`dkBrainExtractionBadge ${isApproved?"approved":"preview"}`}>{isApproved?copy.extractionApproved:copy.extractionUnapproved}</div>
    <div className={`dkBrainExtractionPreviews ${compare?"compare":""}`}>
      <figure><figcaption>{copy.originalImageLabel}</figcaption><div className="dkBrainExtractionViewport original"><img src={originalUrl} alt={item.filename}/></div></figure>
      <figure><figcaption>{copy.transparentPreviewLabel}</figcaption><div className="dkBrainExtractionViewport transparent"><img src={transparentUrl||originalUrl} alt={item.filename}/></div></figure>
    </div></>}
    <div className="dkBrainBackgroundHeuristic" aria-live="polite">
      <div className={`dkBrainBackgroundStatus ${status}`}>{status==="processing"?copy.backgroundProcessing:status==="ready"?copy.transparentReady:status==="complex"?copy.backgroundComplex:status==="error"?copy.backgroundError:""}</div>
      <label><span>{copy.backgroundTolerance}: <b>{threshold}</b></span><input type="range" min="0" max="100" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/></label>{threshold>=70&&!unsafeSensitivity&&<div className="dkBrainBackgroundStatus warning">{copy.highSensitivityWarning}</div>}{unsafeSensitivity&&<div className="dkBrainBackgroundStatus error">{copy.unsafeSensitivityWarning}</div>}
      <label><span>{copy.edgeSoftness}: <b>{softness}</b></span><input type="range" min="0" max="50" value={softness} onChange={e=>setSoftness(Number(e.target.value))}/></label>
      <label><span>{copy.productDetailProtection}: <b>{protection}</b></span><input type="range" min="50" max="100" value={protection} onChange={e=>setProtection(Number(e.target.value))}/></label>
      <fieldset className="dkBrainBackgroundPreviewModes"><legend>{copy.shadowMode}</legend><button type="button" className={shadowMode==="keep"?"active":""} onClick={()=>setShadowMode("keep")}>{copy.shadowKeep}</button><button type="button" className={shadowMode==="soften"?"active":""} onClick={()=>setShadowMode("soften")}>{copy.shadowSoften}</button><button type="button" className={shadowMode==="experimental-remove"?"active":""} onClick={()=>setShadowMode("experimental-remove")}>{copy.shadowRemoveExperimental}</button></fieldset>
      {shadowMode==="experimental-remove"&&<div className="dkBrainBackgroundStatus complex">{copy.shadowExperimentalWarning}</div>}
      <small>{copy.naturalShadowAdvice}</small>
      <div className="dkBrainBackgroundApprovalActions"><button type="button" className={compare?"active":""} aria-pressed={compare} onClick={()=>setCompare(v=>!v)}>{copy.compareBeforeAfter}</button><button type="button" className="primary" disabled={unsafeSensitivity||!processedBlob||status==="processing"||status==="error"} title={unsafeSensitivity?copy.unsafeSensitivityWarning:undefined} onClick={approve}>{item.imageState.transparentProduct?.approved?copy.transparentApproved:copy.approveTransparent}</button></div>
      <small>{copy.backgroundHeuristicNotice}</small>
    </div>
  </section>;
}

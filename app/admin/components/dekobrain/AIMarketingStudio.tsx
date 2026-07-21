"use client";
import { useState } from "react";
import type { Lang } from "../../config/translations";
import { dekoBrainMarketingTranslations, type MarketingContent } from "../../config/dekoBrainMarketingTranslations";

type MarketingIntelligence={category:string;confidence:number;echoScore:number;protectedFeatures:string[];sceneComplexity:string;advisorScore:number};
type ExtendedMarketingContent=MarketingContent&{longDescription:string;adCopy:string;facebookPost:string;instagramPost:string;seoKeywords:string};
const fields:(keyof ExtendedMarketingContent)[]=["productName","shortDescription","longDescription","adCopy","facebookPost","instagramPost","seoKeywords","hashtags"];

export default function AIMarketingStudio({locale,isImageApproved,sourceUrl,intelligence,onContentCreated,onSendToCanva}:{locale:Lang;isImageApproved:boolean;sourceUrl:string;intelligence?:MarketingIntelligence|null;onContentCreated?:()=>void;onSendToCanva?:()=>void}){
 const copy=dekoBrainMarketingTranslations[locale];const [content,setContent]=useState<ExtendedMarketingContent|null>(null);const [demoIndex,setDemoIndex]=useState(-1);const [copied,setCopied]=useState<keyof ExtendedMarketingContent|null>(null);
 const canGenerate=Boolean(intelligence);
 const labels:Record<keyof ExtendedMarketingContent,string>={...copy.fields,longDescription:locale==="ar"?"الوصف الطويل":locale==="de"?"Ausführliche Beschreibung":locale==="fr"?"Description longue":"Long description",adCopy:locale==="ar"?"نص الإعلان":locale==="de"?"Anzeigentext":locale==="fr"?"Texte publicitaire":"Ad copy",facebookPost:"Facebook",instagramPost:"Instagram",seoKeywords:"SEO"};
 function generate(){if(!intelligence)return;const next=(demoIndex+1)%copy.demos.length,base=copy.demos[next],signals=`${intelligence.category} · DNA ${Math.round(intelligence.confidence)}% · Echo ${intelligence.echoScore}`,features=intelligence.protectedFeatures.slice(0,4).join(", ");setDemoIndex(next);setContent({...base,longDescription:`${base.marketingParagraph} ${signals}. ${features}`.trim(),adCopy:`${base.marketingHeadline} ${base.marketingParagraph} ${base.callToAction}`,facebookPost:`${base.marketingHeadline}\n\n${base.marketingParagraph}\n\n${base.callToAction}\n${base.hashtags.join(" ")}`,instagramPost:`${base.shortDescription}\n\n${base.hashtags.join(" ")}`,seoKeywords:[intelligence.category,...intelligence.protectedFeatures,"DekoKraft"].join(", ")});setCopied(null);onContentCreated?.();}
 async function copyField(field:keyof ExtendedMarketingContent){if(!content)return;const value=Array.isArray(content[field])?(content[field] as string[]).join(" "):String(content[field]);try{await navigator.clipboard.writeText(value);setCopied(field);window.setTimeout(()=>setCopied(current=>current===field?null:current),1600);}catch{setCopied(null);}}
 return <section className="dkBrainPanel dkBrainMarketingStudio" id="dkbrain-ai-marketing-studio">
  <div className="dkBrainSectionHeading"><div><span>10</span><h2>{copy.studioTitle}</h2></div></div>
  <div className="dkBrainMarketingIntro"><div><h3>{copy.title}</h3><p>{copy.description}</p></div><button type="button" className="dkBrainPrimaryAction" disabled={!canGenerate} title={!canGenerate?copy.needsApprovedImage:undefined} onClick={generate}>{copy.generate}</button></div>
  {!canGenerate&&<p className="dkBrainMarketingLocked">{locale==="ar"?"حلّل المنتج أولًا لإنشاء المحتوى من Product DNA وEcho Score.":copy.needsApprovedImage}</p>}
  {content&&<div className="dkBrainMarketingResult" aria-live="polite">
   <div className="dkBrainMarketingFields">{fields.map(field=>{const value=field==="hashtags"?(content.hashtags.join(" ")):content[field];return <article key={field}><header><h4>{labels[field]}</h4><button type="button" onClick={()=>copyField(field)}>{copied===field?copy.copied:copy.copy}</button></header><p>{value}</p></article>})}</div>
   <div className="dkBrainMarketingActions"><button type="button" className="dkBrainMarketingAnother" onClick={generate}>{copy.generateAnother}</button><button type="button" className="dkBrainPrimaryAction" disabled={!isImageApproved||!sourceUrl} title={!isImageApproved?copy.needsApprovedImage:undefined} onClick={onSendToCanva}>إرسال إلى Canva</button></div>
  </div>}
 </section>;
}

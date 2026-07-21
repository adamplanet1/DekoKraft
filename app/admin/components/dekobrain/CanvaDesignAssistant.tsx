"use client";
import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../../config/translations";
import { dekoBrainCanvaTranslations } from "../../config/dekoBrainCanvaTranslations";
import { buildCanvaExportPayload, prepareCanvaDesign, type CanvaDesignType } from "../../lib/canva/canvaIntegration";
import { logDekoBrainEvent } from "../../lib/dekobrain/eventLog";

const DRAFT_KEY="dekobrain-canva-draft";
const designTypes:CanvaDesignType[]=["instagram-square","instagram-story","facebook-post","product-card","custom"];
type Props={sourceUrl:string|null;sourceFileName?:string;sourceMimeType?:string;width?:number;height?:number;isBackgroundApproved:boolean;productName?:string;locale:Lang;backgroundMode?:"transparent"|"white"|"custom"|"generated";sourceIdentity?:string;openRequest?:number;hideTrigger?:boolean;onExportRequested?:()=>void};

export default function CanvaDesignAssistant(props:Props){
 const copy=dekoBrainCanvaTranslations[props.locale];const [open,setOpen]=useState(false);const [designType,setDesignType]=useState<CanvaDesignType>("instagram-square");const [text,setText]=useState("");const [connectionMessage,setConnectionMessage]=useState("");
 const [content,setContent]=useState({productName:true,price:false,discount:false,shortDescription:false,logo:true,customText:false});
 const disabled=!props.sourceUrl||!props.isBackgroundApproved;
 const disabledMessage=!props.sourceUrl?copy.noImage:!props.isBackgroundApproved?copy.notApproved:"";
 const backgroundLabel=copy.backgroundLabels[props.backgroundMode??"transparent"];
 const fileName=props.sourceFileName??"dekobrain-approved-image.png";
 const format=props.sourceMimeType?.split("/")[1]?.toUpperCase()??fileName.split(".").pop()?.toUpperCase()??"PNG";
 const dimensions=props.width&&props.height?`${props.width} × ${props.height}px`:"—";
 const selectedContent=useMemo(()=>Object.entries(content).filter(([,selected])=>selected).map(([key])=>key),[content]);

 useEffect(()=>{if(!props.sourceIdentity)return;try{const raw=sessionStorage.getItem(DRAFT_KEY);if(raw){const draft=JSON.parse(raw) as {sourceIdentity?:string};if(draft.sourceIdentity&&draft.sourceIdentity!==props.sourceIdentity){sessionStorage.removeItem(DRAFT_KEY);logDekoBrainEvent("canva_draft_cleared",{filename:fileName,backgroundMode:props.backgroundMode});}}}catch{sessionStorage.removeItem(DRAFT_KEY);}},[props.sourceIdentity,fileName,props.backgroundMode]);
 useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false);};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close);},[open]);
 useEffect(()=>{if((props.openRequest??0)>0&&!disabled)showModal();},[props.openRequest]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(!open)return;sessionStorage.setItem(DRAFT_KEY,JSON.stringify({designType,text,productName:props.productName??"",time:new Date().toISOString(),fileName,sourceIdentity:props.sourceIdentity}));},[open,designType,text,props.productName,fileName,props.sourceIdentity]);

 function showModal(){if(disabled)return;setOpen(true);setConnectionMessage("");logDekoBrainEvent("canva_preview_opened",{filename:fileName,designType,textLength:text.length,backgroundMode:props.backgroundMode});}
 function download(){if(!props.sourceUrl)return;const anchor=document.createElement("a");anchor.href=props.sourceUrl;anchor.download=fileName;anchor.click();logDekoBrainEvent("canva_export_downloaded",{filename:fileName,designType,textLength:text.length,backgroundMode:props.backgroundMode});props.onExportRequested?.();}
 async function continueToCanva(){if(!props.sourceUrl||!props.isBackgroundApproved){setConnectionMessage(disabledMessage);return;}const payload=buildCanvaExportPayload({imageUrl:props.sourceUrl,fileName,productName:content.productName?props.productName:undefined,text:content.customText?text:undefined,designType,backgroundMode:props.backgroundMode});await prepareCanvaDesign(payload);download();window.open("https://www.canva.com/design/","_blank","noopener,noreferrer");setConnectionMessage(copy.notConnected);logDekoBrainEvent("canva_connection_requested",{filename:fileName,designType,textLength:text.length,backgroundMode:props.backgroundMode});}

 return <section className="dkBrainCanvaAssistant">
  <div><h3>{copy.title}</h3><p>{copy.description}</p></div>
  {!props.hideTrigger&&<button type="button" className="dkBrainCanvaButton" disabled={disabled} aria-disabled={disabled} onClick={showModal}>{copy.open}</button>}
  {disabledMessage&&<small>{disabledMessage}</small>}
  {open&&<div className="dkBrainCanvaModal" role="dialog" aria-modal="true" aria-labelledby="dkbrain-canva-title" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false);}}><div className="dkBrainCanvaDialog">
   <header><div><span>{copy.previewOnly}</span><h2 id="dkbrain-canva-title">{copy.previewTitle}</h2></div><button type="button" aria-label={copy.cancel} onClick={()=>setOpen(false)}>×</button></header>
   <div className="dkBrainCanvaPreview"><img src={props.sourceUrl??""} alt={fileName}/></div>
   <dl className="dkBrainCanvaMetadata"><div><dt>{copy.fileName}</dt><dd>{fileName}</dd></div><div><dt>{copy.format}</dt><dd>{format}</dd></div><div><dt>{copy.dimensions}</dt><dd>{dimensions}</dd></div><div><dt>{copy.background}</dt><dd>{backgroundLabel}</dd></div><div><dt>{copy.ready}</dt><dd>✓</dd></div></dl>
   <label className="dkBrainCanvaField">{copy.designType}<select value={designType} onChange={e=>setDesignType(e.target.value as CanvaDesignType)}>{designTypes.map(type=><option key={type} value={type}>{copy.designTypes[type]}</option>)}</select></label>
   <fieldset className="dkBrainCanvaContent"><legend>{copy.content}</legend>{(Object.keys(content) as Array<keyof typeof content>).map(key=><label key={key}><input type="checkbox" checked={content[key]} onChange={e=>setContent(current=>({...current,[key]:e.target.checked}))}/>{copy.contentOptions[key]??(props.locale==="ar"?"الخصم":props.locale==="de"?"Rabatt":props.locale==="fr"?"Remise":"Discount")}</label>)}</fieldset>
   <label className="dkBrainCanvaField">{copy.customText}<textarea rows={4} value={text} onChange={e=>{setText(e.target.value);setContent(current=>({...current,customText:true}));}}/></label>
   <small className="dkBrainCanvaSelection">{selectedContent.join(" · ")}</small>{connectionMessage&&<div className="dkBrainCanvaStatus" role="status">{connectionMessage}</div>}
   <footer><button type="button" onClick={download}>{copy.download}</button><button type="button" className="primary" onClick={continueToCanva}>{copy.continue}</button><button type="button" onClick={()=>setOpen(false)}>{copy.cancel}</button></footer>
  </div></div>}
 </section>;
}

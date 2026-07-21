"use client";

import Image from "next/image";
import {useEffect,useRef,useState,type ChangeEvent,type DragEvent} from "react";

export type StudioMedia={id:string;file:File;url:string;width:number;height:number;status:"ready"|"warning";warning?:string};

export default function StudioMediaUploader({multiple=true,onChange,onPrepare}:{multiple?:boolean;onChange?:(files:StudioMedia[])=>void;onPrepare?:(item:StudioMedia)=>void}){
  const [items,setItems]=useState<StudioMedia[]>([]),[activeId,setActiveId]=useState<string>();
  const itemsRef=useRef(items);useEffect(()=>{itemsRef.current=items},[items]);
  useEffect(()=>()=>itemsRef.current.forEach(item=>URL.revokeObjectURL(item.url)),[]);
  useEffect(()=>onChange?.(items),[items,onChange]);
  const add=async(files:FileList|File[])=>{const selected=Array.from(files).slice(0,multiple?20:1),created=await Promise.all(selected.map(async file=>{const url=URL.createObjectURL(file),valid=file.type.startsWith("image/"),dimensions=valid?await new Promise<{width:number;height:number}>(resolve=>{const image=new window.Image();image.onload=()=>resolve({width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>resolve({width:0,height:0});image.src=url}):{width:0,height:0},warning=!valid?"نوع الملف غير مدعوم":file.size>10*1024*1024?"حجم الملف أكبر من 10 MB":undefined;return{id:`${file.name}-${file.lastModified}-${crypto.randomUUID()}`,file,url,...dimensions,status:warning?"warning" as const:"ready" as const,warning}}));setItems(current=>{if(!multiple)current.forEach(item=>URL.revokeObjectURL(item.url));return multiple?[...current,...created]:created});setActiveId(current=>current??created[0]?.id)};
  const input=(event:ChangeEvent<HTMLInputElement>)=>{if(event.target.files)add(event.target.files);event.target.value=""},drop=(event:DragEvent)=>{event.preventDefault();add(event.dataTransfer.files)},remove=(id:string)=>setItems(current=>current.filter(item=>{if(item.id===id)URL.revokeObjectURL(item.url);return item.id!==id}));
  return <section className="studioUploader"><div className="studioDropzone" onDragOver={event=>event.preventDefault()} onDrop={drop}><strong>اسحب الصور هنا أو اخترها من الجهاز</strong><span>PNG، JPEG، WebP — حتى 10 MB للملف</span><label>اختيار الصور<input type="file" accept="image/*" multiple={multiple} onChange={input}/></label></div><div className="studioMediaCount">عدد الملفات: {items.length}</div>{items.length>0&&<div className="studioMediaGrid">{items.map(item=><article key={item.id} className={activeId===item.id?"active":""}><button type="button" className="studioMediaPreview" onClick={()=>setActiveId(item.id)}><Image src={item.url} alt={item.file.name} fill unoptimized sizes="180px"/></button><div><strong>{item.file.name}</strong><span>{item.file.type||"—"}</span><span>{item.width} × {item.height}</span><span>{(item.file.size/1024).toFixed(1)} KB</span><span className={item.status}>{item.warning??"جاهز"}</span>{onPrepare&&item.status==="ready"&&<button type="button" className="studioPrepareAction" onClick={()=>onPrepare(item)}>معاينة وتجهيز المنتج</button>}<button type="button" onClick={()=>remove(item.id)}>حذف الملف</button></div></article>)}</div>}</section>;
}

"use client";
import {useState,type ReactNode} from "react";
import {useLanguage} from "../../../components/LanguageProvider";
import StudioMediaUploader,{type StudioMedia} from "./StudioMediaUploader";
import StudioNotice from "./StudioNotice";
import StudioWorkspaceHeader from "./StudioWorkspaceHeader";
export default function StudioWorkspace({title,description,multiple=true,onPrepare,children}:{title:string;description:string;multiple?:boolean;onPrepare?:(item:StudioMedia)=>void;children:(media:StudioMedia[])=>ReactNode}){const{lang}=useLanguage(),[media,setMedia]=useState<StudioMedia[]>([]);return <main className="studioWorkspace" dir={lang==="ar"?"rtl":"ltr"}><StudioWorkspaceHeader title={title} description={description}/><StudioNotice/><StudioMediaUploader multiple={multiple} onChange={setMedia} onPrepare={onPrepare}/>{children(media)}</main>}

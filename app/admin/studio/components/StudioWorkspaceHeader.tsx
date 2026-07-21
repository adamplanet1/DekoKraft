import Link from "next/link";

export default function StudioWorkspaceHeader({title,description,backHref="/admin/studio"}:{title:string;description:string;backHref?:string}){
  return <header className="studioWorkspaceHeader"><Link href={backHref}>← العودة إلى EcoDekoKraft Studio</Link><h1>{title}</h1><p>{description}</p></header>;
}

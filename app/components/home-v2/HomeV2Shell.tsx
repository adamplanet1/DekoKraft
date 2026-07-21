import type{ReactNode}from"react";import PublicPageShell from"../PublicPageShell";import"../../home-v2.css";
export default function HomeV2Shell({children}:{children:ReactNode}){return <PublicPageShell><div className="homeV2Shell" data-master-layout="home-v2">{children}</div></PublicPageShell>}

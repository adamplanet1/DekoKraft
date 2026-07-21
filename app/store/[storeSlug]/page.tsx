import{notFound}from"next/navigation";import PublicPageShell from"../../components/PublicPageShell";import{getAllSellers}from"../../data/sellers";import"../../seller/seller.css";import Storefront from"./Storefront";
export function generateStaticParams(){return getAllSellers().map(s=>({storeSlug:s.store.storeSlug}))}
export default async function StorePage({params}:{params:Promise<{storeSlug:string}>}){const{storeSlug}=await params;if(!getAllSellers().some(s=>s.store.storeSlug===storeSlug))notFound();return <PublicPageShell><Storefront storeSlug={storeSlug}/></PublicPageShell>}

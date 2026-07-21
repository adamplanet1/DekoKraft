import{Suspense}from"react";import SellerStudioRoute from"../../components/SellerStudioRoute";
export default async function StudioPage({params}:{params:Promise<{sellerId:string}>}){const{sellerId}=await params;return <Suspense fallback={<main className="sellerPage">جارٍ فتح الاستوديو…</main>}><SellerStudioRoute sellerId={sellerId}/></Suspense>}

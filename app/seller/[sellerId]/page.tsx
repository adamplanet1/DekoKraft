import SellerDashboard from"../components/SellerDashboard";
export default async function SellerHome({params}:{params:Promise<{sellerId:string}>}){const{sellerId}=await params;return <SellerDashboard sellerId={sellerId}/>}

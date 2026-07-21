import {notFound}from"next/navigation";import{sellerProducts}from"../../../../data/sellerProducts";import SellerProductDetails from"../../../components/SellerProductDetails";
export function generateStaticParams(){return sellerProducts.map(product=>({productId:product.id}))}
export default async function ProductPage({params}:{params:Promise<{sellerId:string;productId:string}>}){const{sellerId,productId}=await params;const seeded=sellerProducts.find(p=>p.id===productId);if(seeded&&seeded.sellerId!==sellerId)notFound();return <SellerProductDetails sellerId={sellerId} productId={productId}/>}

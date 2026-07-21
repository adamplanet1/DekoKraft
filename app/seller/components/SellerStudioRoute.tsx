"use client";
import{useSearchParams}from"next/navigation";import SellerStudio from"./SellerStudio";
export default function SellerStudioRoute({sellerId}:{sellerId:string}){const searchParams=useSearchParams();return <SellerStudio sellerId={sellerId} productId={searchParams.get("productId")??undefined}/>}

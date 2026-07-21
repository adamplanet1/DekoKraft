"use client";
import{useEffect}from"react";import{useRouter}from"next/navigation";import SellerSessionProvider,{useSellerSession}from"./SellerSessionProvider";
function Redirect(){const router=useRouter(),{currentSellerId,isLoading}=useSellerSession();useEffect(()=>{if(!isLoading)router.replace(currentSellerId?`/seller/${currentSellerId}`:"/seller/login")},[currentSellerId,isLoading,router]);return <main className="sellerGuardLoading">جاري فتح لوحة البائع...</main>}
export default function SellerDashboardRedirect(){return <SellerSessionProvider><Redirect/></SellerSessionProvider>}

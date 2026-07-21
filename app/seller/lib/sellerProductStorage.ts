"use client";
import { sellerProducts, type SellerProduct, type SellerProductStatus } from "../../data/sellerProducts";
import { sellerOwnsProduct } from "./sellerAccess";

export const SELLER_PRODUCTS_STORAGE_KEY = "dekokraft_seller_products_v1";
function storedOnly(): SellerProduct[] { if (typeof window === "undefined") return []; try { const value=JSON.parse(localStorage.getItem(SELLER_PRODUCTS_STORAGE_KEY)??"[]"); return Array.isArray(value)?value:[]; } catch { return []; } }
function merge(stored: SellerProduct[]) { const map=new Map(sellerProducts.map((item)=>[item.id,item])); stored.forEach((item)=>map.set(item.id,item)); return [...map.values()]; }
function persistAll(products: SellerProduct[]) { if(typeof window!=="undefined") localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY,JSON.stringify(products.filter((item)=>!sellerProducts.some((seed)=>seed.id===item.id)||JSON.stringify(item)!==JSON.stringify(sellerProducts.find((seed)=>seed.id===item.id))))); return products; }
export function loadStoredSellerProducts(): SellerProduct[] { return merge(storedOnly()); }
export function saveStoredSellerProducts(products: SellerProduct[]): void { persistAll(products); window.dispatchEvent(new CustomEvent("seller-products-change")); }
export function createSellerProduct(product: SellerProduct): SellerProduct[] { const products=loadStoredSellerProducts(); if(products.some((item)=>item.id===product.id)) throw new Error("رقم المنتج مستخدم بالفعل."); const participantId=product.participantId??product.sellerId;if(!participantId)throw new Error("يجب ربط المنتج بمشارك.");return persistAll([...products,{...product,participantId}]); }
export function updateSellerProduct(sellerId:string,productId:string,updates:Partial<SellerProduct>):SellerProduct[]{const products=loadStoredSellerProducts();const current=products.find((item)=>item.id===productId);if(!current||!sellerOwnsProduct(sellerId,current))return products;return persistAll(products.map((item)=>item.id===productId?{...item,...updates,id:item.id,participantId:item.participantId??item.sellerId,sellerId:item.sellerId,updatedAt:new Date().toISOString()}:item));}
export function changeSellerProductStatus(sellerId:string,productId:string,status:SellerProductStatus){return updateSellerProduct(sellerId,productId,{status});}
export function deleteSellerProduct(sellerId:string,productId:string){const products=loadStoredSellerProducts();const current=products.find((item)=>item.id===productId);if(!current||!sellerOwnsProduct(sellerId,current))return products;return persistAll(products.filter((item)=>item.id!==productId));}

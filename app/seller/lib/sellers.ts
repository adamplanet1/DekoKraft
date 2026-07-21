import{getSellerById}from"../../data/sellers";
export function getSellerProfile(sellerId:string){const seller=getSellerById(sellerId);return seller?{name:seller.ownerName,storeName:seller.store.storeName}:{name:"بائع DekoKraft",storeName:`متجر ${sellerId}`};}

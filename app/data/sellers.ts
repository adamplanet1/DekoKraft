export type SellerAccountStatus="invited"|"active"|"paused"|"suspended";
export type SellerPlan="hobby"|"starter"|"professional";
export interface SellerStoreProfile{storeName:string;storeSlug:string;shortDescription:string;description?:string;logoUrl?:string;bannerUrl?:string;country:string;city:string;currency:"EUR";languages:Array<"ar"|"de"|"en"|"fr">;categories:string[]}
export interface SellerAccount{id:string;sellerNumber:number;ownerName:string;email:string;phone?:string;status:SellerAccountStatus;plan:SellerPlan;joinedAt:string;lastLoginAt?:string;store:SellerStoreProfile}
const base=(id:string,n:number,ownerName:string,email:string,status:SellerAccountStatus,plan:SellerPlan,storeName:string,storeSlug:string,categories:string[],city="برلين"):SellerAccount=>({id,sellerNumber:n,ownerName,email,status,plan,joinedAt:`2026-0${Math.min(n,6)}-0${Math.min(n,9)}T10:00:00.000Z`,store:{storeName,storeSlug,shortDescription:`متجر ${storeName} للمنتجات المصنوعة بعناية.`,country:"ألمانيا",city,currency:"EUR",languages:["ar","de"],categories}});
export const sellerAccounts:SellerAccount[]=[
base("seller-001",1,"صاحب متجر DekoKraft التجريبي","seller001@demo.de","active","professional","DekoKraft التجريبي","dekokraft-demo",["شموع","هدايا","ديكور"]),
base("seller-002",2,"صانع العلب الخشبية","seller002@demo.de","active","hobby","صناديق الحرفة","wooden-boxes",["علب وتغليف","منتجات خشبية"],"هامبورغ"),
base("seller-003",3,"حساب حرفي تجريبي 03","seller003@demo.de","invited","starter","ورشة النور","light-workshop",["ديكور جبسي"]),
base("seller-004",4,"حساب حرفي تجريبي 04","seller004@demo.de","active","starter","ألوان البيت","home-colors",["ديكور","هدايا"]),
base("seller-005",5,"حساب حرفي تجريبي 05","seller005@demo.de","paused","hobby","لمسة ورق","paper-touch",["ورق","تغليف"]),
base("seller-006",6,"حساب حرفي تجريبي 06","seller006@demo.de","active","professional","خشب وحكاية","wood-story",["منتجات خشبية"]),
base("seller-007",7,"حساب حرفي تجريبي 07","seller007@demo.de","suspended","starter","تفاصيل صغيرة","tiny-details",["مجوهرات"]),
base("seller-008",8,"حساب حرفي تجريبي 08","seller008@demo.de","invited","hobby","تعلم والعب","learn-play",["أطفال وألعاب تعليمية"]),
base("seller-009",9,"حساب حرفي تجريبي 09","seller009@demo.de","active","starter","طباعة مبتكرة","creative-printing",["طباعة ثلاثية الأبعاد"]),
base("seller-010",10,"حساب حرفي تجريبي 10","seller010@demo.de","invited","hobby","خدمات الحرفة","craft-services",["خدمات"]),
];
export function getAllSellers(){return sellerAccounts.map(seller=>({...seller,store:{...seller.store}}))}
export function getSellerById(sellerId:string){return getAllSellers().find(s=>s.id===sellerId)}
export function getSellerByEmail(email:string){const normalized=email.trim().toLowerCase();return getAllSellers().find(s=>s.email.toLowerCase()===normalized)}
export function getActiveSellers(){return getAllSellers().filter(s=>s.status==="active")}

import packagingProductData from "../../public/images/homepage/services/products.json" with { type: "json" };

export type SellerProductStatus = "draft" | "review" | "published" | "hidden" | "rejected";

export interface SellerProductImage { id: string; url: string; alt: string; isMain: boolean }
export interface SellerProduct {
  id: string; ownerType?: "admin" | "participant"; ownerId?: string; participantId?: string; sellerId?: string; title: string; slug: string; category: string;
  shortDescription: string; description: string; price: number; compareAtPrice?: number;
  currency: "EUR"; stock: number; status: SellerProductStatus; images: SellerProductImage[];
  createdAt: string; updatedAt: string;
  dekoBrain?: { category?: string; confidence?: number; echoScore?: number; productDNAStatus?: "new" | "learning" | "stable"; livingIdentityStatus?: "not-created" | "learning" | "stable"; warnings?: string[] };
}

type PackagingProductRecord = {
  id: string;
  title: string;
  description?: string;
  participantId: string;
  mainImage?: string;
  price?: number;
  currency?: string;
  stock?: number;
  status?: string;
};

const packagingProducts: SellerProduct[] = (packagingProductData as PackagingProductRecord[]).map((product) => ({
  id: product.id,
  ownerType: "participant",
  participantId: product.participantId,
  title: product.title,
  slug: product.id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  category: "التعليب",
  shortDescription: product.description || product.title,
  description: product.description || product.title,
  price: Number(product.price) || 0,
  currency: product.currency === "EUR" ? "EUR" : "EUR",
  stock: Number(product.stock) || 0,
  status: product.status === "hidden" ? "hidden" : product.status === "active" ? "published" : "review",
  images: product.mainImage ? [{
    id: `${product.id}-main`,
    url: `/images/homepage/services/${encodeURIComponent(product.id)}/${encodeURIComponent(product.mainImage)}`,
    alt: product.title,
    isMain: true,
  }] : [],
  createdAt: "2026-07-18T00:00:00.000Z",
  updatedAt: "2026-07-18T00:00:00.000Z",
}));

export const sellerProducts: SellerProduct[] = [
  {id:"candle-001",ownerType:"admin",ownerId:"admin",title:"شمعة العسل الفاخرة",slug:"luxury-honey-candle",category:"شموع",shortDescription:"شمعة يدوية بدفء طبيعي.",description:"شمعة مصنوعة بعناية لتمنح المكان هدوءًا ولمسة دافئة.",price:12.9,currency:"EUR",stock:8,status:"published",images:[{id:"candle-001-main",url:"/images/homepage/candles/candel-002/candel-002-01-1200.webp",alt:"شمعة العسل الفاخرة",isMain:true}],createdAt:"2026-05-03T09:00:00.000Z",updatedAt:"2026-07-08T11:30:00.000Z",dekoBrain:{category:"candle",confidence:94,echoScore:88,productDNAStatus:"stable",livingIdentityStatus:"learning"}},
  {id:"candle-002",ownerType:"admin",ownerId:"admin",title:"شمعة زهرية",slug:"floral-candle",category:"شموع",shortDescription:"شمعة مزينة بتفاصيل زهرية.",description:"قطعة ديكور عطرية مناسبة للهدايا والمناسبات.",price:15.5,compareAtPrice:18,currency:"EUR",stock:2,status:"review",images:[{id:"candle-002-main",url:"/images/homepage/candles/candel-003/candel-003-01-01-600.webp",alt:"شمعة زهرية",isMain:true}],createdAt:"2026-06-11T09:00:00.000Z",updatedAt:"2026-07-09T14:00:00.000Z",dekoBrain:{category:"candle",confidence:86,echoScore:57,productDNAStatus:"learning",livingIdentityStatus:"not-created",warnings:["المخزون منخفض"]}},
  {id:"gift-001",sellerId:"seller-001",title:"هدية المناسبات",slug:"occasion-gift",category:"هدايا",shortDescription:"هدية قابلة للتخصيص.",description:"تجهيز يدوي أنيق للمناسبات مع إمكانية التخصيص.",price:24,currency:"EUR",stock:5,status:"draft",images:[{id:"gift-001-main",url:"/images/homepage/gift/gift-001/gift-001-01-1200.webp",alt:"هدية المناسبات",isMain:true}],createdAt:"2026-07-01T09:00:00.000Z",updatedAt:"2026-07-10T08:15:00.000Z",dekoBrain:{confidence:72,echoScore:64,productDNAStatus:"new",livingIdentityStatus:"not-created"}},
  {id:"box-001",sellerId:"seller-002",title:"علبة هدية خشبية",slug:"wooden-gift-box",category:"علب وتغليف",shortDescription:"علبة هدية أنيقة قابلة للنقش.",description:"علبة خشبية مصنوعة يدويًا مع مساحة للنقش والتخصيص.",price:19.9,currency:"EUR",stock:6,status:"published",images:[{id:"box-001-main",url:"/images/homepage/gift/gift-002/gift-001-02-01-1200.webp",alt:"علبة هدية خشبية",isMain:true}],createdAt:"2026-05-18T10:00:00.000Z",updatedAt:"2026-07-07T12:00:00.000Z",dekoBrain:{category:"wood",confidence:91,echoScore:82,productDNAStatus:"stable",livingIdentityStatus:"stable"}},
  {id:"gift-002",sellerId:"seller-002",title:"باقة هدية صغيرة",slug:"small-gift-set",category:"هدايا",shortDescription:"مجموعة هدية صغيرة حسب الطلب.",description:"مجموعة مناسبة للضيافة والهدايا الشخصية.",price:9.5,currency:"EUR",stock:1,status:"hidden",images:[{id:"gift-002-main",url:"/images/homepage/gift/gift-002/gift-001-02-05-1200.webp",alt:"باقة هدية صغيرة",isMain:true}],createdAt:"2026-06-20T10:00:00.000Z",updatedAt:"2026-07-11T16:20:00.000Z",dekoBrain:{category:"gift",confidence:76,echoScore:54,productDNAStatus:"learning",livingIdentityStatus:"learning",warnings:["تحتاج الصورة إلى تحسين"]}},
  ...packagingProducts,
];

export function getSellerProducts(participantId: string) { return sellerProducts.filter((product) => (product.participantId ?? product.sellerId) === participantId); }
export function getSellerProduct(participantId: string, productId: string) { return sellerProducts.find((product) => (product.participantId ?? product.sellerId) === participantId && product.id === productId); }
export function getSellerProductBySlug(participantId: string, slug: string) { return sellerProducts.find((product) => (product.participantId ?? product.sellerId) === participantId && product.slug === slug); }

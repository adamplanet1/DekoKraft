"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SellerProduct } from "../../data/sellerProducts";
import { DkGlassPanel } from "../../components/ui";

export default function ParticipantProductsPanel() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/participant/products", { cache: "no-store" }).then(async (response) => { const body = await response.json() as { products?: SellerProduct[]; error?: string }; if (!response.ok) throw new Error(body.error); setProducts(body.products ?? []); }).catch((cause) => setError(cause instanceof Error ? cause.message : "تعذر تحميل المنتجات.")); }, []);
  return <DkGlassPanel as="section" className="participantInventory__panel" aria-label="منتجات المشارك"><h2>منتجاتي</h2>{error && <p role="alert">{error}</p>}<div className="participantInventory__grid">{products.map((product) => <article key={product.id}><strong>{product.title}</strong><span>{product.category}</span><span>المخزون: {product.stock}</span><span>#{product.id}</span><Link href={`/seller/${product.participantId ?? product.sellerId}/products/${product.id}`}>فتح المنتج</Link></article>)}</div>{!error && !products.length && <p>لا توجد منتجات مرتبطة بهذا الحساب.</p>}</DkGlassPanel>;
}


"use client";

import { useEffect, useState } from "react";
import { Package, X } from "lucide-react";
import { productRowToDNA } from "./PrimaryProductDNAStore";
import type { ProductDNA } from "../../../lib/echo/echoProductDNA";
import { publicPath } from "../../lib/publicPath";

export type PlatformProductSelection = { productDNA: ProductDNA; title: string; imageUrl: string | null };
export type ProductSelectionMode = "load-complete-product" | "apply-dna-to-current-image";
type ProductOption = PlatformProductSelection;

export default function ProductMemoryPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (product: PlatformProductSelection) => void }) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    void fetch("/api/admin/products/", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((payload: unknown) => {
        if (!Array.isArray(payload)) return;
        setProducts(payload.filter((row) => row && typeof row === "object").map((row) => {
          const record = row as Record<string, unknown>;
          const imageValue = record.primaryImageUrl ?? record.imageUrl;
          return {
            productDNA: productRowToDNA(record),
            title: String(record.title ?? record.title_ar ?? record.title_en ?? record.id ?? "-"),
            imageUrl: typeof imageValue === "string" && imageValue ? publicPath(imageValue) : null,
          };
        }));
      })
      .catch((error) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) console.error("[Product Memory] Failed to load product picker:", error);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [open]);

  if (!open) return null;
  return <section className="smartEditProductPicker" aria-label="اختيار منتج من المنصة">
    <header><strong><Package size={17} aria-hidden="true" />اختيار منتج</strong><button type="button" aria-label="إغلاق قائمة المنتجات" onClick={onClose}><X size={17} /></button></header>
    {loading ? <p>جارٍ تحميل المنتجات…</p> : products.length ? <div className="smartEditProductPicker__list">{products.map((product) => <button type="button" key={product.productDNA.id} onClick={() => onSelect(product)}><strong>{product.title}</strong><span>{product.productDNA.categoryId}</span></button>)}</div> : <p>لا توجد منتجات متاحة.</p>}
  </section>;
}

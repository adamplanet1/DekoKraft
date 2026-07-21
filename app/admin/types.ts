// app/admin/types.ts

import type { ProductDNA, ProductDimensions } from "../../lib/echo/echoProductDNA";

export type Lang = "ar" | "de" | "en";

/** صف المنتج الذى يعرضه API */
export interface ProductRow {
  id: string;
  category: string;
  type?: string;        // ← الحقل الجديد لتخزين نوع المنتج
  title_ar?: string;
  title_de?: string;
  title_en?: string;
  description_ar?: string;
  description_de?: string;
  description_en?: string;
  price?: string;
  old_price?: string;
  currency?: string;
  imageCount?: number;
  extension?: string;
  show_home?: string;
  // مواصفات إضافية يمكن توسيعها لاحقاً
  material?: string;
  color?: string;
  availableColors?: string[];
  customColorRequest?: string;
  fragrance?: string;
  weight_g?: string;
  size_cm?: string;
  dimensions: ProductDimensions;
  productDNA: ProductDNA;
  shape?: string;
  brand?: string;
  tags?: string;
}

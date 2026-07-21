import "server-only";
import fs from "fs";
import path from "path";
import { publicPath } from "../lib/publicPath";
import { normalizeProductDNA, type ProductDNA, type ProductDimensions } from "../../lib/echo/echoProductDNA";

export interface CategoryData {
  slug: string;
  title: string;
  description: string;
  folder: string;
  ownerType?: "admin" | "participant";
  ownerId?: string;
  participantId?: string;
}

export interface ProductData {
  id: string;
  category: string;
  title: string;
  description: string;
  imageCount: number;
  extension: string;
  folder: string;
  thumbnail: string;
  mainImage: string;
  images: string[];
  thumbnails: string[];
  participantId?: string;

  title_ar?: string;
  title_de?: string;
  title_en?: string;
  description_ar?: string;
  description_de?: string;
  description_en?: string;

  price?: string | number;
  old_price?: string | number;
  currency?: string;
  stock?: string | number;
  status?: string;
  featured?: string;
  brand?: string;

  material?: string;
  wax_type?: string;
  fragrance?: string;
  fragrance_strength?: string;
  wick?: string;
  burn_time?: string;
  color?: string;
  shape?: string;
  size?: string;

  length_cm?: string | number;
  width_cm?: string | number;
  height_cm?: string | number;
  diameter_cm?: string | number;
  weight_g?: string | number;
  package_weight_g?: string | number;

  tags?: string;
  dimensions: ProductDimensions;
  productDNA: ProductDNA;
}

function legacyDimensions(product: Partial<ProductData> & Record<string, unknown>): ProductDimensions {
  if (product.dimensions && typeof product.dimensions === "object") {
    return normalizeProductDNA({ dimensions: product.dimensions } as Partial<ProductDNA> & Record<string, unknown>).dimensions;
  }
  const size = typeof product.size_cm === "string" ? product.size_cm : typeof product.size === "string" ? product.size : "";
  const values = size.match(/\d+(?:[.,]\d+)?/g)?.slice(0, 3).map((value) => Number(value.replace(",", "."))) ?? [];
  const numberOrNull = (value: unknown) => value === "" || value === undefined || value === null ? null : Number(value);
  return {
    length: numberOrNull(product.length_cm) ?? values[0] ?? null,
    width: numberOrNull(product.width_cm) ?? values[1] ?? null,
    height: numberOrNull(product.height_cm) ?? values[2] ?? null,
    unit: values.length || product.length_cm != null || product.width_cm != null || product.height_cm != null ? "cm" : "mm",
    source: "product-data",
    confirmed: false,
  };
}

export function loadCategories(): CategoryData[] {
  const filePath = path.join(
    process.cwd(),
    "public",
    "images",
    "homepage",
    "categories.json"
  );

  const json = fs.readFileSync(filePath, "utf8");
  return JSON.parse(json);
}

export function loadCategoryProducts(categorySlug: string): ProductData[] {
  const categories = loadCategories();
  const category = categories.find((item) => item.slug === categorySlug);

  if (!category) {
    return [];
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    "images",
    "homepage",
    category.folder,
    "products.json"
  );

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const json = fs.readFileSync(filePath, "utf8");
  const products = JSON.parse(json);

  return products
    .filter((product: ProductData) => product.status !== "hidden")
    .map((product: ProductData) =>
      completeProduct(product, category.slug, category.folder)
    );
}

export function loadProduct(
  categorySlug: string,
  productId: string
): ProductData {
  const products = loadCategoryProducts(categorySlug);
  const decodedProductId = decodeURIComponent(productId);
  const product = products.find(
    (item) => item.id === productId || item.id === decodedProductId
  );

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

function completeProduct(
  product: ProductData,
  categorySlug: string,
  folder: string
): ProductData {
  const extension = product.extension || "webp";

  const thumbnail =
    product.thumbnail || `${product.id}-01-600.${extension}`;

  const mainImage =
    product.mainImage || `${product.id}-01-1200.${extension}`;

  const images: string[] = [];
  const thumbnails: string[] = [];
  const dimensions = legacyDimensions(product as ProductData & Record<string, unknown>);
  const productDNA = normalizeProductDNA({
    ...(product.productDNA ?? {}),
    id: product.id,
    categoryId: categorySlug,
    productType: product.productDNA?.productType || product.title,
    shape: product.productDNA?.shape || product.shape,
    material: product.productDNA?.material || product.material,
    color: product.productDNA?.color || product.color,
    dimensions,
    scent: product.productDNA?.scent || product.fragrance,
    burnTime: product.productDNA?.burnTime || product.burn_time,
    waxType: product.productDNA?.waxType || product.wax_type,
    notes: product.productDNA?.notes || product.description,
  });

  for (let i = 1; i <= product.imageCount; i++) {
    const number = String(i).padStart(2, "0");

    images.push(
      publicPath(
        `/images/homepage/${folder}/${product.id}/${product.id}-${number}-1200.${extension}`
      )
    );

    thumbnails.push(
      publicPath(
        `/images/homepage/${folder}/${product.id}/${product.id}-${number}-600.${extension}`
      )
    );
  }

  return {
    ...product,
    category: categorySlug,
    folder,
    extension,
    thumbnail,
    mainImage,
    images,
    thumbnails,
    dimensions,
    productDNA,
  };
}

export function firstProductImage(product: ProductData): string {
  return publicPath(
    `/images/homepage/${product.folder}/${product.id}/${product.thumbnail}`
  );
}

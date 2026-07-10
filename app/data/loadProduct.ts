import "server-only";
import fs from "fs";
import path from "path";

export interface CategoryData {
  slug: string;
  title: string;
  description: string;
  folder: string;
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
  const product = products.find((item) => item.id === productId);

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

  for (let i = 1; i <= product.imageCount; i++) {
    const number = String(i).padStart(2, "0");

    images.push(
      `/images/homepage/${folder}/${product.id}/${product.id}-${number}-1200.${extension}`
    );

    thumbnails.push(
      `/images/homepage/${folder}/${product.id}/${product.id}-${number}-600.${extension}`
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
  };
}

export function firstProductImage(product: ProductData): string {
  return `/images/homepage/${product.folder}/${product.id}/${product.thumbnail}`;
}
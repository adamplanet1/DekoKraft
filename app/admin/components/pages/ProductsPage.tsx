"use client";

import { useEffect, useState } from "react";

import { type Lang } from "../../config/translations";
import ProductFilters from "../products/ProductFilters";
import ProductSearch from "../products/ProductSearch";
import ProductsToolbar from "../products/ProductsToolbar";
import ProductsTable from "../products/ProductsTable";
import type { ProductTableItem } from "../products/ProductsTable";
import type { ProductModalSavedProduct } from "../products/ProductModal";

type Props = {
  lang: Lang;
  onAddProduct: () => void;
  refreshKey: number;
  savedProduct: ProductModalSavedProduct | null;
  saveSuccessMessage: string;
};

export default function ProductsPage({
  lang,
  onAddProduct,
  refreshKey,
  savedProduct,
  saveSuccessMessage,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [products, setProducts] = useState<ProductTableItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/admin/products/", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as ProductTableItem[];
        const loadedProducts = Array.isArray(result) ? result : [];

        if (savedProduct) {
          setProducts([
            savedProduct,
            ...loadedProducts.filter(
              (product) => product.id !== savedProduct.id
            ),
          ]);
        } else {
          setProducts(loadedProducts);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setProducts([]);
        }
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [refreshKey, savedProduct]);

  useEffect(() => {
    if (!savedProduct) {
      return;
    }

    setProducts((current) => {
      const savedId = savedProduct.id;
      const existingIndex = current.findIndex(
        (product) => savedId !== undefined && product.id === savedId
      );

      if (existingIndex < 0) {
        return [savedProduct, ...current];
      }

      return current.map((product, index) =>
        index === existingIndex ? { ...product, ...savedProduct } : product
      );
    });
  }, [savedProduct]);

  return (
    <div className="dkProductsPage">
      {saveSuccessMessage && (
        <p className="dkProductModalSubmitMessage success" role="status">
          {saveSuccessMessage}
        </p>
      )}

      <ProductsToolbar
        lang={lang}
        onAddProduct={onAddProduct}
      />

      <section className="dkHeroCard dkProductsCard">
        <div className="dkProductsControls">
          <ProductSearch
            lang={lang}
            value={search}
            onChange={setSearch}
          />

          <ProductFilters
            lang={lang}
            category={category}
            status={status}
            onCategoryChange={setCategory}
            onStatusChange={setStatus}
          />
        </div>

        <ProductsTable products={products} lang={lang} />
      </section>
    </div>
  );
}

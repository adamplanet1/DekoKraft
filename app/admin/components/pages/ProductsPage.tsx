"use client";

import { useState } from "react";

import { type Lang } from "../../config/translations";
import ProductFilters from "../products/ProductFilters";
import ProductSearch from "../products/ProductSearch";
import ProductsToolbar from "../products/ProductsToolbar";
import ProductsTable from "../products/ProductsTable";

type Props = {
  lang: Lang;
  onAddProduct: () => void;
};

export default function ProductsPage({
  lang,
  onAddProduct,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="dkProductsPage">
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

        <ProductsTable products={[]} lang={lang} />
      </section>
    </div>
  );
}

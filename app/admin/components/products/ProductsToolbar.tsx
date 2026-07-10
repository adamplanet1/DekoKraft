"use client";

import { type Lang } from "../../config/translations";

type ProductsToolbarProps = {
  lang: Lang;
  onAddProduct?: () => void;
};

const toolbarText: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    addProduct: string;
  }
> = {
  en: {
    title: "Products",
    subtitle: "Manage your product catalog and keep listings up to date.",
    addProduct: "Add Product",
  },
  de: {
    title: "Produkte",
    subtitle: "Verwalten Sie Ihren Produktkatalog und halten Sie Einträge aktuell.",
    addProduct: "Produkt hinzufügen",
  },
  fr: {
    title: "Produits",
    subtitle: "Gérez votre catalogue et gardez les produits à jour.",
    addProduct: "Ajouter un produit",
  },
  ar: {
    title: "المنتجات",
    subtitle: "إدارة كتالوج المنتجات وتحديث البيانات بسهولة.",
    addProduct: "إضافة منتج",
  },
};

export default function ProductsToolbar({
  lang,
  onAddProduct,
}: ProductsToolbarProps) {
  const text = toolbarText[lang];

  return (
    <div className="dkProductsToolbar" dir={lang === "ar" ? "rtl" : undefined}>
      <div className="dkProductsToolbarText">
        <h2>{text.title}</h2>
        <p>{text.subtitle}</p>
      </div>

      <button type="button" className="dkPrimaryButton" onClick={onAddProduct}>
        <span aria-hidden="true">+</span>
        {text.addProduct}
      </button>
    </div>
  );
}

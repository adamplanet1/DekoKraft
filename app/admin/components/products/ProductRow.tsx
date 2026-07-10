import { type Lang } from "../../config/translations";

type ProductRowItem = {
  id?: string | number;
  name?: string;
  title?: string;
  title_ar?: string;
  title_de?: string;
  title_en?: string;
  category?: string;
  price?: string | number;
  currency?: string;
  status?: string;
};

type ProductRowProps = {
  product: ProductRowItem;
  lang: Lang;
};

const actionText: Record<Lang, { edit: string; delete: string }> = {
  ar: {
    edit: "تعديل",
    delete: "حذف",
  },
  en: {
    edit: "Edit",
    delete: "Delete",
  },
  de: {
    edit: "Bearbeiten",
    delete: "Loschen",
  },
  fr: {
    edit: "Modifier",
    delete: "Supprimer",
  },
};

function getProductName(product: ProductRowItem, lang: Lang) {
  if (product.name || product.title) {
    return product.name || product.title;
  }

  if (lang === "ar") {
    return product.title_ar || product.title_en || product.title_de || product.id || "-";
  }

  if (lang === "de") {
    return product.title_de || product.title_en || product.title_ar || product.id || "-";
  }

  if (lang === "fr") {
    return product.title_en || product.title_de || product.title_ar || product.id || "-";
  }

  return product.title_en || product.title_de || product.title_ar || product.id || "-";
}

function getProductPrice(product: ProductRowItem) {
  return [product.price, product.currency].filter(Boolean).join(" ") || "-";
}

export default function ProductRow({ product, lang }: ProductRowProps) {
  const text = actionText[lang];

  return (
    <tr className="dkProductRow">
      <td>
        <div className="dkProductRowInfo">
          <div className="dkProductRowImage" aria-hidden="true" />
          <strong>{getProductName(product, lang)}</strong>
        </div>
      </td>
      <td>{product.category || "-"}</td>
      <td>{getProductPrice(product)}</td>
      <td>
        <span className="dkProductRowStatus">{product.status || "-"}</span>
      </td>
      <td>
        <div className="dkProductRowActions">
          <button type="button">{text.edit}</button>
          <button type="button">{text.delete}</button>
        </div>
      </td>
    </tr>
  );
}

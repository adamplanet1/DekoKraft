import { type Lang } from "../../config/translations";

type ProductTableItem = {
  id?: string | number;
  title?: string;
  title_ar?: string;
  title_de?: string;
  title_en?: string;
  category?: string;
  status?: string;
  price?: string | number;
  currency?: string;
};

type ProductsTableProps = {
  products: ProductTableItem[];
  lang: Lang;
};

const tableText: Record<
  Lang,
  {
    product: string;
    category: string;
    status: string;
    price: string;
    noProducts: string;
  }
> = {
  ar: {
    product: "المنتج",
    category: "القسم",
    status: "الحالة",
    price: "السعر",
    noProducts: "لا توجد منتجات بعد",
  },
  en: {
    product: "Product",
    category: "Category",
    status: "Status",
    price: "Price",
    noProducts: "No products yet",
  },
  de: {
    product: "Produkt",
    category: "Kategorie",
    status: "Status",
    price: "Preis",
    noProducts: "Noch keine Produkte",
  },
  fr: {
    product: "Produit",
    category: "Categorie",
    status: "Statut",
    price: "Prix",
    noProducts: "Aucun produit pour le moment",
  },
};

function getProductTitle(product: ProductTableItem, lang: Lang) {
  if (product.title) {
    return product.title;
  }

  if (lang === "ar") {
    return product.title_ar || product.title_en || product.title_de || product.id || "-";
  }

  if (lang === "de") {
    return product.title_de || product.title_en || product.title_ar || product.id || "-";
  }

  return product.title_en || product.title_de || product.title_ar || product.id || "-";
}

function getProductPrice(product: ProductTableItem) {
  return [product.price, product.currency].filter(Boolean).join(" ") || "-";
}

export default function ProductsTable({ products, lang }: ProductsTableProps) {
  const text = tableText[lang];

  return (
    <div className="dkProductsTableWrap" dir={lang === "ar" ? "rtl" : undefined}>
      <table className="dkProductsTable">
        <thead>
          <tr>
            <th>{text.product}</th>
            <th>{text.category}</th>
            <th>{text.status}</th>
            <th>{text.price}</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={4} className="dkProductsTableEmpty">
                {text.noProducts}
              </td>
            </tr>
          ) : (
            products.map((product, index) => (
              <tr key={product.id ?? index}>
                <td>{getProductTitle(product, lang)}</td>
                <td>{product.category || "-"}</td>
                <td>{product.status || "-"}</td>
                <td>{getProductPrice(product)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

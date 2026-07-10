type Lang = "ar" | "fr" | "de" | "en";

type Props = {
  lang: Lang;
  onAddProduct: () => void;
};

export default function HeroCard({ lang, onAddProduct }: Props) {
  const text = {
    ar: "DekoKraft CMS — منصة إدارة المتجر ومنصة الحرفيين. من هنا ستدير المنتجات، المعرض، الخلفيات، الألوان، العروض، العملاء والطلبات.",
    de: "DekoKraft CMS — Verwalten Sie Produkte, Galerie, Hintergründe, Farben, Angebote, Kunden und Bestellungen.",
    fr: "DekoKraft CMS — Gérez les produits, la galerie, les arrière-plans, les couleurs, les offres, les clients et les commandes.",
    en: "DekoKraft CMS — Manage products, gallery, backgrounds, colors, offers, customers and orders.",
  };
  const addProductLabel = lang === "ar" ? "إضافة منتج" : "Add Product";

  return (
    <section className="dkHeroCard">
      <h2>🏠 DekoKraft Creator Studio</h2>
      <p>{text[lang]}</p>

      <div className="dkHeroActions">
        <button
          type="button"
          className="dkPrimaryButton"
          onClick={onAddProduct}
        >
          <span aria-hidden="true">+</span>
          {addProductLabel}
        </button>
      </div>
    </section>
  );
}

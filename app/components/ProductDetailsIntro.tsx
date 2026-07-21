"use client";

import { useLanguage } from "./LanguageProvider";
import DkPageHero from "./ui/DkPageHero";

type ProductDetailsIntroProps = {
  product: {
    category: string;
    title: string;
    description: string;
    title_ar?: string;
    title_de?: string;
    title_en?: string;
    title_fr?: string;
    description_ar?: string;
    description_de?: string;
    description_en?: string;
    description_fr?: string;
  };
};

export default function ProductDetailsIntro({
  product,
}: ProductDetailsIntroProps) {
  const { lang, direction, t } = useLanguage();
  const localizedTitles = {
    ar: product.title_ar,
    de: product.title_de,
    en: product.title_en,
    fr: product.title_fr,
  };
  const localizedDescriptions = {
    ar: product.description_ar,
    de: product.description_de,
    en: product.description_en,
    fr: product.description_fr,
  };
  const title = localizedTitles[lang] || product.title;
  const description = localizedDescriptions[lang] || product.description;
  const categoryKey =
    product.category === "boxes" ||
    product.category === "gift" ||
    product.category === "candles" ||
    product.category === "kids"
      ? product.category
      : null;
  const categoryLabel = categoryKey
    ? t(`category.sections.${categoryKey}.title`)
    : product.category;

  return (
    <DkPageHero
      className="productDetailsHeader"
      dir={direction}
      title={title}
      description={description}
      metadata={<span className="productCategoryBadge">🏷 {categoryLabel}</span>}
      size="compact"
    />
  );
}

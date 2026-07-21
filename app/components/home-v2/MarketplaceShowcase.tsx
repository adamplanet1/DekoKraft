"use client";

import { getLocalizedValue } from "../../../locales";
import { categories } from "../../data/products";
import { useLanguage } from "../LanguageProvider";
import DkCategoryCard from "../ui/DkCategoryCard";
import DkContentSection from "../ui/DkContentSection";
import DkResponsiveGrid from "../ui/DkResponsiveGrid";

export default function MarketplaceShowcase() {
  const { lang, t } = useLanguage();
  return (
    <DkContentSection
      id="marketplace"
      className="publicContentContainer"
      eyebrow={t("homepage.marketEyebrow")}
      title={t("homepage.marketTitle")}
    >
      <DkResponsiveGrid desktop={4} tablet={2} mobile={1}>
        {categories.map((category) => (
          <DkCategoryCard
            key={category.slug}
            href={`/${category.slug}`}
            image={category.image}
            imageAlt=""
            title={getLocalizedValue(category.title, lang) ?? ""}
            description={getLocalizedValue(category.description, lang) ?? ""}
          />
        ))}
      </DkResponsiveGrid>
    </DkContentSection>
  );
}

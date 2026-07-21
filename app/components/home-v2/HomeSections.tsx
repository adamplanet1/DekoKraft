"use client";

import { categories } from "../../data/products";
import { useLanguage } from "../LanguageProvider";
import DkCategoryCard from "../ui/DkCategoryCard";
import DkContentSection from "../ui/DkContentSection";
import DkResponsiveGrid from "../ui/DkResponsiveGrid";

const sections = [
  { slug: "gift", key: "packaging" },
  { slug: "candles", key: "candles" },
  { slug: "gift", key: "gifts" },
  { slug: "kids", key: "kids" },
] as const;

export default function HomeSections() {
  const { t } = useLanguage();
  const visible = sections.flatMap((section) => {
    const category = categories.find((item) => item.slug === section.slug);
    return category ? [{ ...section, image: category.image }] : [];
  });

  return (
    <DkContentSection
      className="publicContentContainer"
      eyebrow={t("homepage.sectionsEyebrow")}
      title={t("homepage.sectionsTitle")}
    >
      <DkResponsiveGrid desktop={4} tablet={2} mobile={1}>
        {visible.map((section) => (
          <DkCategoryCard
            key={section.key}
            href={`/${section.slug}`}
            image={section.image}
            imageAlt=""
            title={t(`home.sections.${section.key}.title`)}
            description={t(`home.sections.${section.key}.description`)}
          />
        ))}
      </DkResponsiveGrid>
    </DkContentSection>
  );
}

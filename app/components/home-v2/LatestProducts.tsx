"use client";

import { getLocalizedValue } from "../../../locales";
import { sellerProducts } from "../../data/sellerProducts";
import { useLanguage } from "../LanguageProvider";
import DkContentSection from "../ui/DkContentSection";
import DkProductCard from "../ui/DkProductCard";
import DkResponsiveGrid from "../ui/DkResponsiveGrid";

export default function LatestProducts() {
  const { lang, t } = useLanguage();
  const latest = sellerProducts
    .filter((product) => product.status === "published")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4);

  return (
    <DkContentSection
      className="publicContentContainer"
      eyebrow={t("homepage.latestEyebrow")}
      title={t("homepage.latestTitle")}
    >
      <DkResponsiveGrid desktop={4} tablet={2} mobile={1}>
        {latest.map((product) => {
          const image = product.images.find((item) => item.isMain) ?? product.images[0];
          return image ? (
            <DkProductCard
              key={`${product.sellerId}-${product.id}`}
              image={image.url}
              imageAlt={image.alt}
              category={getLocalizedValue(product.category, lang) ?? ""}
              title={getLocalizedValue(product.title, lang) ?? ""}
              description={getLocalizedValue(product.shortDescription, lang) ?? ""}
              price={`${product.price.toFixed(2)} €`}
            />
          ) : null;
        })}
      </DkResponsiveGrid>
    </DkContentSection>
  );
}

"use client";

import { useLanguage } from "../LanguageProvider";
import { DkButton, DkGlassPanel } from "../ui";

export default function SellerStorePlaceholderPage({
  mode,
}: {
  mode: "potsdam" | "new";
}) {
  const { direction, t } = useLanguage();
  const isNew = mode === "new";

  return (
    <main className="dk-seller-store-placeholder" dir={direction}>
      <DkGlassPanel as="section" strength="normal" className="dk-seller-store-placeholder__panel">
        <span>{t("admin.sellerStores.eyebrow")}</span>
        <h1>{isNew ? t("admin.sellerStores.addStore") : t("admin.sellerStores.potsdamName")}</h1>
        <p>{isNew ? t("admin.sellerStores.newStorePageDescription") : t("admin.sellerStores.potsdamPageDescription")}</p>
        <DkButton href="/admin" variant="glass" size="md">
          {t("admin.sellerStores.backToDashboard")}
        </DkButton>
      </DkGlassPanel>
    </main>
  );
}

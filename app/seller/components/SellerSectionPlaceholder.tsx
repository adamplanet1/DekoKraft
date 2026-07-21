"use client";

import { useLanguage } from "../../components/LanguageProvider";
import { DkButton, DkGlassPanel } from "../../components/ui";
import { routes } from "../../config/routes";

type SellerSection =
  | "customers"
  | "analytics"
  | "media"
  | "earnings"
  | "aiCost"
  | "invoices"
  | "inventory"
  | "support";

export default function SellerSectionPlaceholder({ sellerId, section }: { sellerId: string; section: SellerSection }) {
  const { t } = useLanguage();
  return (
    <main className="sellerPage">
      <DkGlassPanel as="section" strength="normal" className="sellerEmpty">
        <h1>{t(`seller.${section}`)}</h1>
        <p>{t("welcome.comingSoon")}</p>
        <DkButton href={routes.seller.root(sellerId)} variant="glass" size="md">
          {t("seller.dashboard")}
        </DkButton>
      </DkGlassPanel>
    </main>
  );
}

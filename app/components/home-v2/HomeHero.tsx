"use client";

import { useLanguage } from "../LanguageProvider";
import { DkButton } from "../ui";
import DkPageHero from "../ui/DkPageHero";
import { routes } from "../../config/routes";

export default function HomeHero() {
  const { t } = useLanguage();
  return (
    <DkPageHero
      className="publicContentContainer"
      id="home-v2-title"
      eyebrow={t("homepage.eyebrow")}
      title={t("homepage.title")}
      description={t("home.heroDescription")}
      actions={<DkButton href={routes.studio} variant="primary" size="md">{t("seller.openStudio")}</DkButton>}
      size="large"
    />
  );
}

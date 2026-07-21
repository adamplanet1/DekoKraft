"use client";

import { useLanguage } from "../LanguageProvider";
import DkPageHero from "../ui/DkPageHero";

export default function HomeHero() {
  const { t } = useLanguage();
  return (
    <DkPageHero
      className="publicContentContainer"
      id="home-v2-title"
      eyebrow={t("homepage.eyebrow")}
      title={t("homepage.title")}
      description={t("home.heroDescription")}
      size="large"
    />
  );
}

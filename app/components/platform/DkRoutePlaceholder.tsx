"use client";

import { useLanguage } from "../LanguageProvider";
import PublicPageShell from "../PublicPageShell";
import { DkButton, DkGlassPanel } from "../ui";
import { routes } from "../../config/routes";

type DkRoutePlaceholderProps = {
  titleKey: string;
};

export default function DkRoutePlaceholder({ titleKey }: DkRoutePlaceholderProps) {
  const { direction, t } = useLanguage();

  return (
    <PublicPageShell>
      <main className="dkRoutePlaceholder" dir={direction}>
        <DkGlassPanel as="section" strength="normal">
          <h1>{t(titleKey)}</h1>
          <p>{t("welcome.comingSoon")}</p>
          <DkButton href={routes.home} variant="glass" size="md">
            {t("market.backHome")}
          </DkButton>
        </DkGlassPanel>
      </main>
    </PublicPageShell>
  );
}

"use client";

import { Box, Layers3, ScanLine, Sparkles } from "lucide-react";
import { useLanguage } from "../components/LanguageProvider";
import PublicPageShell from "../components/PublicPageShell";
import { DkButton, DkGlassPanel } from "../components/ui";
import { routes } from "../config/routes";
import EchoDekoStudioGateway from "./components/EchoDekoStudioGateway";
import StudioStatusBadge, { type StudioStatus } from "./components/StudioStatusBadge";

const STUDIOS: Array<{
  key: "laser" | "threeD" | "embroidery" | "echo";
  href: string;
  status: StudioStatus;
  icon: typeof ScanLine;
}> = [
  { key: "laser", href: routes.studios.laser, status: "development", icon: ScanLine },
  { key: "threeD", href: routes.studios.threeDForm, status: "development", icon: Box },
  { key: "embroidery", href: routes.studios.embroidery, status: "development", icon: Layers3 },
  { key: "echo", href: routes.admin.studio, status: "active", icon: Sparkles },
];

export default function SmartStudiosCenterPage() {
  const { direction, t } = useLanguage();

  return (
    <PublicPageShell>
      <main className="smartStudioPage smartStudioCenter" dir={direction}>
        <header className="smartStudioCenterHeader">
          <span className="smartStudioCenterHeader__icon" aria-hidden="true">✦</span>
          <h1>{t("studio.center.title")}</h1>
          <p>{t("studio.center.description")}</p>
        </header>

        <EchoDekoStudioGateway />

        <section className="smartStudioCenterGrid" aria-label={t("studio.center.title")}>
          {STUDIOS.map(({ key, href, status, icon: Icon }) => (
            <DkGlassPanel key={key} as="article" strength="subtle" className="smartStudioCenterCard">
              <div className="smartStudioCenterCard__topline">
                <span className="smartStudioCenterCard__icon" aria-hidden="true"><Icon size={30} /></span>
                <StudioStatusBadge status={status} />
              </div>
              <div className="smartStudioCenterCard__copy">
                <h2>{t(`studio.center.cards.${key}.title`)}</h2>
                <p>{t(`studio.center.cards.${key}.description`)}</p>
              </div>
              <DkButton href={href} variant="primary" size="md">
                {t("studio.common.open")}
              </DkButton>
            </DkGlassPanel>
          ))}
        </section>
      </main>
    </PublicPageShell>
  );
}

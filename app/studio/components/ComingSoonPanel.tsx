"use client";

import type { ReactNode } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import { DkGlassPanel } from "../../components/ui";
import StudioStatusBadge from "./StudioStatusBadge";

type ComingSoonPanelProps = {
  icon?: ReactNode;
  title?: string;
  description?: string;
};

export default function ComingSoonPanel({ icon = "✨", title, description }: ComingSoonPanelProps) {
  const { t } = useLanguage();

  return (
    <DkGlassPanel as="section" strength="subtle" className="smartStudioComingSoon">
      <span className="smartStudioComingSoon__icon" aria-hidden="true">{icon}</span>
      <StudioStatusBadge status="comingSoon" />
      <h2>{title ?? t("studio.common.comingSoonTitle")}</h2>
      <p>{description ?? t("studio.common.comingSoonMessage")}</p>
    </DkGlassPanel>
  );
}

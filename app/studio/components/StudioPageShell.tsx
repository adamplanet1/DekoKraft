"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";
import PublicPageShell from "../../components/PublicPageShell";
import { DkButton, DkGlassPanel } from "../../components/ui";
import { routes } from "../../config/routes";
import StudioStatusBadge, { type StudioStatus } from "./StudioStatusBadge";

type StudioPageShellProps = {
  title: string;
  description: string;
  status: StudioStatus;
  children: ReactNode;
};

export default function StudioPageShell({ title, description, status, children }: StudioPageShellProps) {
  const { direction, t } = useLanguage();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <PublicPageShell>
      <main className="smartStudioPage" dir={direction}>
        <DkGlassPanel as="header" strength="subtle" className="smartStudioPageHeader">
          <div className="smartStudioPageHeader__copy">
            <StudioStatusBadge status={status} />
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <DkButton
            href={routes.studio}
            variant="glass"
            size="sm"
            icon={<BackIcon size={18} />}
          >
            {t("studio.common.back")}
          </DkButton>
        </DkGlassPanel>
        <div className="smartStudioPageContent">{children}</div>
      </main>
    </PublicPageShell>
  );
}

"use client";

import { useLanguage } from "../../components/LanguageProvider";
import DkDashboardGrid from "../../components/platform/DkDashboardGrid";
import DkServicesCenter from "../../components/platform/DkServicesCenter";
import { participantNavigationItems } from "../participantNavigation";

export default function ParticipantStudioDashboard({ viewerRole = "participant", participantId }: { viewerRole?: "participant" | "admin"; participantId?: string }) {
  const { lang, direction, t } = useLanguage();
  const items = participantNavigationItems.map((item) => ({
    ...item,
    id: item.key,
    label: t(item.labelKey),
    description: item.descriptionKey ? t(item.descriptionKey) : undefined,
    href: viewerRole === "admin" && participantId
      ? item.key === "maintenance"
        ? `/admin/participants/${participantId}/maintenance`
        : `/admin/participants/${participantId}#${item.key}`
      : item.href,
  }));

  return (
    <section className="participantDashboard" aria-labelledby="participant-dashboard-title">
      <h2 id="participant-dashboard-title" className="participantDashboardTitle">
        {t("participantStudio.title")}
      </h2>
      <DkDashboardGrid items={items} label={t("participantStudio.navigationLabel")} />
      <DkServicesCenter locale={lang} direction={direction} />
    </section>
  );
}

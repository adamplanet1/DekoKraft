"use client";

import { useLanguage } from "../../components/LanguageProvider";

export type StudioStatus = "active" | "development" | "comingSoon";

export default function StudioStatusBadge({ status }: { status: StudioStatus }) {
  const { t } = useLanguage();

  return (
    <span className={`smartStudioStatus smartStudioStatus--${status}`}>
      {t(`studio.status.${status}`)}
    </span>
  );
}

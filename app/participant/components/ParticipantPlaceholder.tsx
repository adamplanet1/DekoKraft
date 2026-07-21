"use client";

import { useLanguage } from "../../components/LanguageProvider";
import { DkButton, DkGlassPanel } from "../../components/ui";
import {
  type ParticipantSection,
} from "../participantNavigation";

export default function ParticipantPlaceholder({ section }: { section: ParticipantSection }) {
  const { t } = useLanguage();

  return (
    <DkGlassPanel as="section" strength="normal" className="participantPlaceholder">
      <h2>{t(`dashboardCards.${section}`)}</h2>
      <p>{t(`participantStudio.placeholders.${section}`)}</p>
      <DkButton href="/participant/studio" variant="glass" size="md">
        {t("participantStudio.title")}
      </DkButton>
    </DkGlassPanel>
  );
}

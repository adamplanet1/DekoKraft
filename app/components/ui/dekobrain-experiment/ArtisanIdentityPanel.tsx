"use client";

import { useLanguage } from "../../LanguageProvider";
import { artisanPreferences, type ConfirmedLearningRecord } from "./LearningEchoStore";

export default function ArtisanIdentityPanel({ records }: { records: ConfirmedLearningRecord[] }) {
  const { t } = useLanguage();
  const preferences = artisanPreferences(records);
  return <section className="dkBrainDetailList"><p>{t("admin.brainCenter.experiment.details.artisanDescription")}</p>{preferences.length ? <ul>{preferences.map((preference, index) => <li key={`${preference.instruction}-${index}`}>{preference.instruction}</li>)}</ul> : <p>{t("admin.brainCenter.experiment.empty")}</p>}</section>;
}

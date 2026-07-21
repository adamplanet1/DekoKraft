"use client";

import { useLanguage } from "../../LanguageProvider";
import type { ExperimentStatus } from "./LearningEchoStore";

export type ExperimentResult = {
  understood: string;
  confirmed: string;
  ignored: string;
  stored: string;
  dnaChange: string;
  artisanChange: string;
};

export default function ExperimentResultPanel({ status, result }: { status: ExperimentStatus; result: ExperimentResult }) {
  const { t } = useLanguage();
  const keys = ["understood", "confirmed", "ignored", "stored", "dnaChange", "artisanChange"] as const;
  return (
    <section className="dkBrainExperimentResult">
      <header><h3>{t("admin.brainCenter.experiment.result.title")}</h3><span className={`status-${status}`}>{status}</span></header>
      <dl>{keys.map((key) => <div key={key}><dt>{t(`admin.brainCenter.experiment.result.${key}`)}</dt><dd>{result[key] || t("admin.brainCenter.experiment.none")}</dd></div>)}</dl>
    </section>
  );
}

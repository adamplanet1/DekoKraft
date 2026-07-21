"use client";

import { Dna } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { classNames } from "./classNames";
import DkButton from "./DkButton";
import DkGlassPanel from "./DkGlassPanel";
import DekoBrainDashboardDetails from "./dekobrain-experiment/DekoBrainDashboardDetails";
import DekoBrainExperiment from "./dekobrain-experiment/DekoBrainExperiment";
import { correctionRecords, knowledgeRules, loadLearningEchoRecords, uniqueProductDNA, type ConfirmedLearningRecord } from "./dekobrain-experiment/LearningEchoStore";
import { dkBrainProgressItems } from "./dkBrainProgressItems";

export type DkBrainProgressCenterProps = {
  className?: string;
  compact?: boolean;
};

export default function DkBrainProgressCenter({
  className,
  compact = false,
}: DkBrainProgressCenterProps) {
  const { t } = useLanguage();
  const [records, setRecords] = useState<ConfirmedLearningRecord[]>([]);
  const [isExperimentOpen, setIsExperimentOpen] = useState(false);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);
  const refreshRecords = useCallback(() => setRecords(loadLearningEchoRecords()), []);
  useEffect(() => {
    refreshRecords();
    const refresh = () => refreshRecords();
    window.addEventListener("dekobrain-experiment-change", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("dekobrain-experiment-change", refresh); window.removeEventListener("storage", refresh); };
  }, [refreshRecords]);
  const products = useMemo(() => uniqueProductDNA(records), [records]);
  const corrections = useMemo(() => correctionRecords(records), [records]);
  const rules = useMemo(() => knowledgeRules(records), [records]);
  const averageConfidence = products.length ? Math.round(products.reduce((sum, dna) => sum + dna.completeness, 0) / products.length) : 0;
  const lastLearning = records.at(-1)?.confirmedAt;
  const stats = [
    { label: "learnedProducts", value: String(products.length) },
    { label: "savedCorrections", value: String(corrections.length) },
    { label: "knowledgeRules", value: String(rules.length) },
    { label: "confidence", value: `${averageConfidence}%` },
    { label: "lastLearning", value: lastLearning ? new Date(lastLearning).toLocaleDateString() : t("admin.brainCenter.noLearningYet") },
  ];

  return (
    <DkGlassPanel
      as="section"
      strength="subtle"
      className={classNames(
        "dk-brain-progress-center",
        compact && "dk-brain-progress-center--compact",
        className,
      )}
      aria-label={t("admin.brainCenter.navigationLabel")}
    >
      <header className="dk-brain-progress-center__header">
        <span className="dk-brain-progress-center__eyebrow">{t("admin.brainCenter.eyebrow")}</span>
        <h2>{t("admin.brainCenter.title")}</h2>
        <p>{t("admin.brainCenter.description")}</p>
        <DkButton
          icon={<Dna />}
          variant="primary"
          size="lg"
          className="dk-brain-progress-center__primary"
          aria-haspopup="dialog"
          aria-expanded={isExperimentOpen}
          onClick={() => setIsExperimentOpen(true)}
        >
          {t("admin.brainCenter.experiment.start")}
        </DkButton>
      </header>

      <div className="dk-brain-progress-center__stats" aria-label={t("admin.brainCenter.statsLabel")}>
        {stats.map((stat) => (
          <div className="dk-brain-progress-center__stat" key={stat.label}>
            <span>{t(`admin.brainCenter.${stat.label}`)}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <nav className="dk-brain-progress-center__grid" aria-label={t("admin.brainCenter.navigationLabel")}>
        {dkBrainProgressItems.map((item) => {
          const Icon = item.icon;
          return (
            <DkButton
              key={item.id}
              icon={<Icon />}
              variant="glass"
              size="md"
              className="dk-brain-progress-center__item"
              aria-haspopup="dialog"
              onClick={() => setActiveDetail(item.id)}
            >
              {t(`admin.brainCenter.${item.id}`)}
            </DkButton>
          );
        })}
      </nav>
      <DekoBrainExperiment isOpen={isExperimentOpen} onClose={() => setIsExperimentOpen(false)} onRecordsChange={refreshRecords} />
      <DekoBrainDashboardDetails section={activeDetail} records={records} onClose={() => setActiveDetail(null)} />
    </DkGlassPanel>
  );
}

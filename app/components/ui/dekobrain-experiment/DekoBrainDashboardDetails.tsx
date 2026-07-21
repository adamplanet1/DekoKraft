"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../LanguageProvider";
import ArtisanIdentityPanel from "./ArtisanIdentityPanel";
import CorrectionHistoryPanel from "./CorrectionHistoryPanel";
import KnowledgeTreePanel from "./KnowledgeTreePanel";
import { correctionRecords, knowledgeRules, uniqueProductDNA, type ConfirmedLearningRecord } from "./LearningEchoStore";

type Props = { section: string | null; records: ConfirmedLearningRecord[]; onClose: () => void };

export default function DekoBrainDashboardDetails({ section, records, onClose }: Props) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [testAnswer, setTestAnswer] = useState("");
  const [testResult, setTestResult] = useState("");
  useEffect(() => {
    if (!section) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", close); };
  }, [onClose, section]);
  if (!section) return null;
  const products = uniqueProductDNA(records);
  const first = records[0]?.productDNA;
  const last = records.at(-1)?.productDNA;

  const content = section === "productIdentity" ? (
    <section className="dkBrainDetailList"><strong>{products.length}</strong>{products.length ? <ul>{products.map((dna) => <li key={dna.id}><b>{dna.productName}</b><span>{dna.category} · {dna.material} · {dna.completeness}%</span></li>)}</ul> : <p>{t("admin.brainCenter.experiment.empty")}</p>}</section>
  ) : section === "knowledgeTree" ? <KnowledgeTreePanel records={records} />
    : section === "echoLearning" ? <section className="dkBrainDetailMetric"><strong>{correctionRecords(records).length}</strong><p>{t("admin.brainCenter.experiment.details.learningDescription")}</p></section>
      : section === "corrections" ? <CorrectionHistoryPanel records={records} />
        : section === "livingIdentity" ? <ArtisanIdentityPanel records={records} />
          : section === "tests" ? (
            <section className="dkBrainUnderstandingTest"><p>{t("admin.brainCenter.experiment.test.question")}</p><textarea value={testAnswer} onChange={(event) => setTestAnswer(event.target.value)} rows={3} /><button type="button" onClick={() => setTestResult(testAnswer.trim() ? t("admin.brainCenter.experiment.test.understood") : t("admin.brainCenter.experiment.test.missing"))}>{t("admin.brainCenter.experiment.test.check")}</button>{testResult && <strong role="status">{testResult}</strong>}</section>
          ) : section === "progress" ? (
            <section className="dkBrainPerformanceComparison"><div><span>{t("admin.brainCenter.experiment.details.firstExperiment")}</span><strong>{first ? `${first.completeness}%` : "—"}</strong></div><div><span>{t("admin.brainCenter.experiment.details.lastExperiment")}</span><strong>{last ? `${last.completeness}%` : "—"}</strong></div><p>{first && last ? `${last.completeness - first.completeness >= 0 ? "+" : ""}${last.completeness - first.completeness}%` : t("admin.brainCenter.experiment.empty")}</p></section>
          ) : <section className="dkBrainDetailList"><p>{t("admin.brainCenter.experiment.details.performanceDescription")}</p><ul><li>{t("admin.brainCenter.learnedProducts")}: {products.length}</li><li>{t("admin.brainCenter.savedCorrections")}: {correctionRecords(records).length}</li><li>{t("admin.brainCenter.knowledgeRules")}: {knowledgeRules(records).length}</li></ul></section>;

  return createPortal(
    <div className="dkBrainExperimentOverlay" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="dkBrainDetailsDialog" role="dialog" aria-modal="true" aria-labelledby="dk-brain-details-title">
        <header><h2 id="dk-brain-details-title">{t(`admin.brainCenter.${section}`)}</h2><button ref={closeRef} type="button" aria-label={t("admin.brainCenter.experiment.close")} onClick={onClose}><X aria-hidden="true" /></button></header>
        {content}
      </section>
    </div>,
    document.body,
  );
}

"use client";

import { useLanguage } from "../../LanguageProvider";
import { correctionRecords, type ConfirmedLearningRecord } from "./LearningEchoStore";

export default function CorrectionHistoryPanel({ records }: { records: ConfirmedLearningRecord[] }) {
  const { t } = useLanguage();
  const corrections = correctionRecords(records);
  return <section className="dkBrainDetailList">{corrections.length ? <ol>{corrections.slice().reverse().map((record) => <li key={record.id}><strong>{record.productDNA.productName}</strong><p>{record.correction.finalRequest}</p><time>{new Date(record.confirmedAt).toLocaleString()}</time></li>)}</ol> : <p>{t("admin.brainCenter.experiment.empty")}</p>}</section>;
}

"use client";

import { useLanguage } from "../../LanguageProvider";
import { knowledgeRules, type ConfirmedLearningRecord } from "./LearningEchoStore";

export default function KnowledgeTreePanel({ records }: { records: ConfirmedLearningRecord[] }) {
  const { t } = useLanguage();
  const rules = knowledgeRules(records);
  return <section className="dkBrainDetailList"><p>{t("admin.brainCenter.experiment.details.knowledgeDescription")}</p>{rules.length ? <ul>{rules.map((rule, index) => <li key={`${rule}-${index}`}>{rule}</li>)}</ul> : <p>{t("admin.brainCenter.experiment.empty")}</p>}</section>;
}

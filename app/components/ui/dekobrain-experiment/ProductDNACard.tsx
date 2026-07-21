"use client";

import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../LanguageProvider";
import type { ProductDNA } from "./LearningEchoStore";

export default function ProductDNACard({ dna, confirmed, onConfirm }: { dna: ProductDNA; confirmed: boolean; onConfirm: () => void }) {
  const { t } = useLanguage();
  const rows: Array<[string, string]> = [
    ["identity", dna.identity], ["category", dna.category], ["material", dna.material], ["shape", dna.shape],
    ["color", dna.color], ["style", dna.style], ["usage", dna.usage], ["completeness", `${dna.completeness}%`],
  ];
  return (
    <article className="dkBrainProductDNA">
      <header><div><small>Product DNA</small><h3>{dna.productName}</h3></div><strong>{dna.completeness}%</strong></header>
      <dl>{rows.map(([key, value]) => <div key={key}><dt>{t(`admin.brainCenter.experiment.dna.${key}`)}</dt><dd>{value}</dd></div>)}</dl>
      <section><h4>{t("admin.brainCenter.experiment.dna.needsConfirmation")}</h4><div>{dna.needsConfirmation.length ? dna.needsConfirmation.map((item) => <span key={item}>{item}</span>) : <span>{t("admin.brainCenter.experiment.none")}</span>}</div></section>
      <button type="button" className="dkBrainExperimentPrimary" disabled={confirmed} onClick={onConfirm}><CheckCircle2 aria-hidden="true" />{confirmed ? t("admin.brainCenter.experiment.confirmed") : t("admin.brainCenter.experiment.confirmDNA")}</button>
    </article>
  );
}

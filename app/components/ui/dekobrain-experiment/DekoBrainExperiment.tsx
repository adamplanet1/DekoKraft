"use client";

import { RotateCcw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../LanguageProvider";
import EchoConfirmationDialog from "./EchoConfirmationDialog";
import ExperimentResultPanel, { type ExperimentResult } from "./ExperimentResultPanel";
import { clearLearningEchoRecords, saveConfirmedLearning, type ExperimentStatus, type ProductDNA } from "./LearningEchoStore";
import ProductDNACard from "./ProductDNACard";
import ProductDNAForm, { type ProductDNADraft } from "./ProductDNAForm";

const emptyDraft: ProductDNADraft = { productName: "", productType: "", description: "", imageName: "", imageUrl: "", material: "", color: "", dimensions: "", usage: "", style: "" };
const emptyResult: ExperimentResult = { understood: "", confirmed: "", ignored: "", stored: "", dnaChange: "", artisanChange: "" };

type Props = { isOpen: boolean; onClose: () => void; onRecordsChange: () => void };

export default function DekoBrainExperiment({ isOpen, onClose, onRecordsChange }: Props) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<ProductDNADraft>(emptyDraft);
  const [dna, setDna] = useState<ProductDNA | null>(null);
  const [status, setStatus] = useState<ExperimentStatus>("draft");
  const [dnaConfirmed, setDnaConfirmed] = useState(false);
  const [request, setRequest] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [result, setResult] = useState<ExperimentResult>(emptyResult);

  const close = useCallback(() => onClose(), [onClose]);
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKey); };
  }, [close, isOpen]);

  if (!isOpen) return null;

  const analyze = () => {
    const values = [draft.productName, draft.productType, draft.description, draft.imageName, draft.material, draft.color, draft.dimensions, draft.usage, draft.style];
    const completeness = Math.round((values.filter((value) => value.trim()).length / values.length) * 100);
    const source = `${draft.productType} ${draft.description}`.toLowerCase();
    const shape = /round|circle|دائر|rund|cercle/.test(source) ? t("admin.brainCenter.experiment.shapes.round")
      : /square|مربع|quadrat|carré/.test(source) ? t("admin.brainCenter.experiment.shapes.square")
        : /rectangle|مستطيل|rechteck/.test(source) ? t("admin.brainCenter.experiment.shapes.rectangle")
          : t("admin.brainCenter.experiment.unknown");
    const missing = (["productType", "material", "color", "dimensions", "usage", "style"] as const)
      .filter((field) => !draft[field].trim()).map((field) => t(`admin.brainCenter.experiment.fields.${field}`));
    if (shape === t("admin.brainCenter.experiment.unknown")) missing.push(t("admin.brainCenter.experiment.dna.shape"));
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `product-${Date.now()}`;
    setDna({ id, productName: draft.productName || t("admin.brainCenter.experiment.unnamedProduct"), identity: `${draft.productName || draft.productType || t("admin.brainCenter.experiment.unnamedProduct")} · ${draft.material || t("admin.brainCenter.experiment.unknown")}`, category: draft.productType || t("admin.brainCenter.experiment.unknown"), material: draft.material || t("admin.brainCenter.experiment.unknown"), shape, color: draft.color || t("admin.brainCenter.experiment.unknown"), style: draft.style || t("admin.brainCenter.experiment.unknown"), usage: draft.usage || t("admin.brainCenter.experiment.unknown"), dimensions: draft.dimensions, description: draft.description, imageName: draft.imageName, completeness, needsConfirmation: missing, confirmedTraits: [], updatedAt: new Date().toISOString() });
    setDnaConfirmed(false);
    setStatus("waiting_confirmation");
    setResult({ ...emptyResult, understood: t("admin.brainCenter.experiment.result.analysisUnderstood"), ignored: t("admin.brainCenter.experiment.result.unconfirmedIgnored") });
  };

  const confirmDNA = () => {
    if (!dna || dnaConfirmed) return;
    const confirmedDNA = { ...dna, confirmedTraits: [dna.category, dna.material, dna.color, dna.style, dna.usage].filter((item) => item !== t("admin.brainCenter.experiment.unknown")), updatedAt: new Date().toISOString() };
    saveConfirmedLearning({ productId: dna.id, productDNA: confirmedDNA, correction: {}, artisanPreference: {} });
    setDna(confirmedDNA); setDnaConfirmed(true); setStatus("confirmed"); onRecordsChange();
    setResult({ understood: result.understood, confirmed: t("admin.brainCenter.experiment.result.dnaConfirmed"), ignored: t("admin.brainCenter.experiment.none"), stored: t("admin.brainCenter.experiment.result.localRecordStored"), dnaChange: t("admin.brainCenter.experiment.result.dnaUpdated"), artisanChange: t("admin.brainCenter.experiment.none") });
  };

  const createSuggestion = () => {
    setSuggestion(t("admin.brainCenter.experiment.echoSuggestion", { request: request.trim() }));
    setStatus("waiting_confirmation"); setIsEditing(false);
    setResult((current) => ({ ...current, understood: request.trim(), ignored: t("admin.brainCenter.experiment.result.suggestionNotStored") }));
  };

  const confirmSuggestion = () => {
    if (!dna || !suggestion) return;
    const lower = request.toLowerCase();
    const preference = { instruction: request, preserveShape: /shape|شكل|form|forme/.test(lower), preserveOriginalColors: /color|لون|farbe|couleur/.test(lower), preferredBackground: /white|بيضاء|weiß|blanc/.test(lower) ? "white" : undefined };
    const nextDNA = { ...dna, confirmedTraits: [...new Set([...dna.confirmedTraits, request])], updatedAt: new Date().toISOString() };
    saveConfirmedLearning({ productId: dna.id, productDNA: nextDNA, correction: { originalRequest: request, echoSuggestion: suggestion, finalRequest: request, decision: "confirmed" }, artisanPreference: preference });
    setDna(nextDNA); setDnaConfirmed(true); setStatus("applied"); onRecordsChange();
    setResult({ understood: suggestion, confirmed: request, ignored: t("admin.brainCenter.experiment.none"), stored: t("admin.brainCenter.experiment.result.learningStored"), dnaChange: t("admin.brainCenter.experiment.result.preferenceAddedToDNA"), artisanChange: t("admin.brainCenter.experiment.result.preferenceAddedToArtisan") });
  };

  const newExperiment = () => { setDraft(emptyDraft); setDna(null); setStatus("draft"); setDnaConfirmed(false); setRequest(""); setSuggestion(""); setIsEditing(false); setResult(emptyResult); };
  const clearData = () => { if (!window.confirm(t("admin.brainCenter.experiment.clearConfirm"))) return; clearLearningEchoRecords(); onRecordsChange(); newExperiment(); };

  return createPortal(
    <div className="dkBrainExperimentOverlay" onPointerDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="dkBrainExperimentDialog" role="dialog" aria-modal="true" aria-labelledby="dk-brain-experiment-title">
        <header><div><small>{t("admin.brainCenter.eyebrow")}</small><h2 id="dk-brain-experiment-title">{t("admin.brainCenter.experiment.title")}</h2><p>{t("admin.brainCenter.experiment.description")}</p></div><button ref={closeRef} type="button" aria-label={t("admin.brainCenter.experiment.close")} onClick={close}><X aria-hidden="true" /></button></header>
        <p className="dkBrainExperimentDisclaimer">{t("admin.brainCenter.experiment.disclaimer")}</p>
        <ProductDNAForm value={draft} onChange={setDraft} onAnalyze={analyze} />
        {dna && <ProductDNACard dna={dna} confirmed={dnaConfirmed} onConfirm={confirmDNA} />}
        {dna && <EchoConfirmationDialog request={request} suggestion={suggestion} isEditing={isEditing} onRequestChange={setRequest} onSuggest={createSuggestion} onConfirm={confirmSuggestion} onEdit={() => setIsEditing(true)} onReject={() => { setStatus("rejected"); setSuggestion(""); setResult((current) => ({ ...current, confirmed: "", ignored: request, stored: t("admin.brainCenter.experiment.result.nothingStored") })); }} />}
        <ExperimentResultPanel status={status} result={result} />
        <footer><button type="button" onClick={newExperiment}><RotateCcw aria-hidden="true" />{t("admin.brainCenter.experiment.newExperiment")}</button><button type="button" className="danger" onClick={clearData}><Trash2 aria-hidden="true" />{t("admin.brainCenter.experiment.clearData")}</button></footer>
      </section>
    </div>,
    document.body,
  );
}

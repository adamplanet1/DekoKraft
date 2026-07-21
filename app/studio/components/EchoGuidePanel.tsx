"use client";

import { AlertTriangle, Check, LoaderCircle, Pencil, Sparkles, X } from "lucide-react";
import { useRef } from "react";
import type { EchoGuideRecommendation, EchoGuideUiState } from "../../../lib/echo-guide/types";

type EchoGuidePanelProps = {
  state: EchoGuideUiState;
  recommendation: EchoGuideRecommendation | null;
  finalPrompt: string;
  error: string | null;
  onFinalPromptChange: (value: string) => void;
  onCreate: () => void;
  onApprove: () => void;
  onCancel: () => void;
};

export default function EchoGuidePanel({ state, recommendation, finalPrompt, error, onFinalPromptChange, onCreate, onApprove, onCancel }: EchoGuidePanelProps) {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const loading = state === "loading-context";
  const executing = state === "executing";
  const busy = loading || executing || state === "accepting" || state === "rejecting";

  return <section className="echoGuidePanel" aria-labelledby="echo-guide-panel-title">
    <header className="echoGuidePanel__header">
      <div><h3 id="echo-guide-panel-title"><Sparkles size={18} aria-hidden="true" />Echo Guide</h3><p>يقرأ هوية المنتج وذاكرة Echo ويقترح إعدادات آمنة قبل التنفيذ</p></div>
      {recommendation && <span className={`echoGuidePanel__risk echoGuidePanel__risk--${recommendation.riskLevel}`}>المخاطر: {recommendation.riskLevel}</span>}
    </header>

    {!recommendation && <div className="echoGuidePanel__empty">
      <p>أنشئ توصية منظمة أولًا. لن يتم إرسال صورة أو تسجيل تكلفة في هذه الخطوة.</p>
      <button type="button" disabled={busy} onClick={onCreate}>{loading ? <LoaderCircle className="smartEditGenerateButton__spinner" size={18} /> : <Sparkles size={18} />}{loading ? "يجمع Echo السياق…" : "إنشاء اقتراح Echo"}</button>
    </div>}

    {recommendation && <div className="echoGuidePanel__content">
      <div className="echoGuidePanel__sources" aria-label="مصادر سياق Echo Guide">
        <span data-used={recommendation.contextSources.productDNAUsed}>Product DNA: {recommendation.contextSources.productDNAUsed ? "مستخدم" : "غير موجود"}</span>
        <span data-used={recommendation.contextSources.echoMemoryUsed}>Echo Memory: {recommendation.contextSources.echoMemoryUsed ? "مستخدمة" : "غير موجودة"}</span>
      </div>
      <section><h4>فهم الطلب</h4><p>{recommendation.interpretedGoal}</p></section>
      <section><h4>ما الذي سيبقى محفوظًا؟</h4><ul>{recommendation.preserve.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h4>ما الذي سيتم تغييره؟</h4><ul>{recommendation.changes.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h4>ما الذي يجب تجنبه؟</h4><ul>{recommendation.avoid.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="echoGuidePanel__settings"><h4>الإعدادات المقترحة</h4><dl>
        <div><dt>النموذج</dt><dd>{recommendation.suggestedModel}</dd></div>
        <div><dt>الجودة</dt><dd>{recommendation.suggestedQuality ?? "—"}</dd></div>
        <div><dt>الحجم</dt><dd>{recommendation.suggestedSize ?? "—"}</dd></div>
        <div><dt>النسبة</dt><dd>{recommendation.suggestedRatio ?? "—"}</dd></div>
      </dl></section>
      <section><h4>التكلفة التقديرية</h4><p>{typeof recommendation.estimatedCostUsd === "number" ? `$${recommendation.estimatedCostUsd.toFixed(2)} (تقديري)` : "غير متاحة"}</p></section>
      {recommendation.warnings.length > 0 && <section className="echoGuidePanel__warnings"><h4><AlertTriangle size={16} />التحذيرات</h4><ul>{recommendation.warnings.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      <label className="echoGuidePanel__prompt"><span><Pencil size={16} />الاقتراح النهائي القابل للتعديل</span><textarea ref={promptRef} value={finalPrompt} onChange={(event) => onFinalPromptChange(event.target.value)} disabled={busy} rows={8} /></label>
      <div className="echoGuidePanel__actions">
        <button type="button" disabled={busy || !finalPrompt.trim()} onClick={onApprove}>{executing ? <LoaderCircle className="smartEditGenerateButton__spinner" size={18} /> : <Check size={18} />}{executing ? "جارٍ التنفيذ…" : "اعتماد الاقتراح وتحليل التنفيذ"}</button>
        <button type="button" disabled={busy} onClick={() => promptRef.current?.focus()}><Pencil size={18} />تعديل الاقتراح</button>
        <button type="button" disabled={busy} onClick={onCreate}><Sparkles size={18} />إنشاء اقتراح جديد</button>
        <button type="button" disabled={busy} onClick={onCancel}><X size={18} />إلغاء</button>
      </div>
    </div>}
    {error && <p className="smartEditFieldError" role="alert">{error}</p>}
  </section>;
}

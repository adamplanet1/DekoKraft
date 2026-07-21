"use client";

import { AlertTriangle, CheckCircle2, LoaderCircle, RefreshCw, Route, X } from "lucide-react";
import type { DecisionPlanAction, DecisionResult, ExecutionProvider } from "../../../lib/decision-engine/types";

const providerLabels: Record<ExecutionProvider, string> = {
  local: "تنفيذ محلي",
  openai: "تنفيذ بواسطة OpenAI",
  hybrid: "تنفيذ هجين",
  "manual-review": "يحتاج مراجعة",
  blocked: "لا يمكن التنفيذ",
};

const actionLabels: Record<DecisionPlanAction, string> = {
  "background-removal": "إزالة الخلفية محليًا",
  "edge-cleanup": "تنظيف الحواف محليًا",
  "format-conversion": "إخراج الصيغة المطلوبة",
  resize: "تغيير حجم الصورة",
  "image-edit": "تنفيذ التعديل التوليدي",
  "image-generation": "توليد الصورة",
  relighting: "تغيير الإضاءة بواسطة OpenAI",
  "scene-generation": "إنشاء المشهد الجديد بواسطة OpenAI",
  "product-ad": "إنشاء التركيب الإعلاني بواسطة OpenAI",
  restoration: "تنفيذ الترميم المتقدم",
};

type Props = {
  decision: DecisionResult | null;
  loading: boolean;
  executing: boolean;
  error: string | null;
  onAnalyze: () => void;
  onExecute: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

export default function DecisionEnginePanel({ decision, loading, executing, error, onAnalyze, onExecute, onEdit, onCancel }: Props) {
  return <section className="decisionEnginePanel" aria-labelledby="decision-engine-title">
    <header><div><h3 id="decision-engine-title"><Route size={18} />قرار التنفيذ</h3><p>يختار DekoBrain المسار المحلي أو OpenAI أو المسار الهجين قبل بدء العملية.</p></div></header>
    {!decision ? <div className="decisionEnginePanel__empty"><button type="button" disabled={loading} onClick={onAnalyze}>{loading ? <LoaderCircle className="smartEditGenerateButton__spinner" size={18} /> : <Route size={18} />}{loading ? "جارٍ تحليل التنفيذ…" : "تحليل طريقة التنفيذ"}</button></div> : <>
      <div className="decisionEnginePanel__facts">
        <div><span>طريقة التنفيذ</span><strong>{providerLabels[decision.provider]}</strong></div>
        <div><span>مستوى الثقة</span><strong>{decision.confidence}</strong></div>
        <div><span>التكلفة التقديرية</span><strong>${decision.estimatedCostUsd.toFixed(2)}</strong></div>
      </div>
      <section><h4>سبب القرار</h4><p>{decision.reasonText}</p></section>
      <section><h4>خطوات التنفيذ</h4>{decision.plan.length ? <ol>{decision.plan.map((step) => <li key={step.id}><span>{step.order}</span><div><strong>{actionLabels[step.action]}</strong><small>{step.provider === "local" ? "محلي · دون تكلفة مزود" : "OpenAI · تكلفة مزود فعلية عند التنفيذ"}</small></div></li>)}</ol> : <p>لن تبدأ أي خطوة تنفيذية قبل تعديل الطلب أو مراجعته.</p>}</section>
      {decision.warnings.length > 0 && <section className="decisionEnginePanel__warnings"><h4><AlertTriangle size={16} />التحذيرات</h4><ul>{decision.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></section>}
      <div className="decisionEnginePanel__actions">
        <button type="button" className="decisionEnginePanel__execute" disabled={!decision.canExecute || executing} onClick={onExecute}>{executing ? <LoaderCircle className="smartEditGenerateButton__spinner" size={18} /> : <CheckCircle2 size={18} />}{executing ? "جارٍ التنفيذ…" : "اعتماد القرار والتنفيذ"}</button>
        <button type="button" disabled={loading || executing} onClick={onEdit}>تعديل الطلب</button>
        <button type="button" disabled={loading || executing} onClick={onAnalyze}><RefreshCw size={17} />إعادة التحليل</button>
        <button type="button" disabled={executing} onClick={onCancel}><X size={17} />إلغاء</button>
      </div>
    </>}
    {error && <p className="smartEditFieldError" role="alert">{error}</p>}
  </section>;
}

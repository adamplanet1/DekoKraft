"use client";

import { useMemo, useState } from "react";
import { DEKOCLEAN_UI_REGISTRY } from "../../../lib/dekoclean/uiRegistry";
import type { UIElementKind, UIElementStatus, UIInspectorRecord } from "../../../lib/dekoclean/uiInspectorTypes";

const statusLabels: Record<UIElementStatus, string> = { working: "يعمل", unconnected: "غير مربوط", disabled: "معطل", informational: "معلوماتي", unknown: "غير معروف" };
const kindLabels: Record<UIElementKind, string> = { button: "الأزرار", card: "البطاقات", link: "الروابط", tab: "علامات التبويب", control: "عناصر التحكم" };
type StatusFilter = "all" | UIElementStatus;
type KindFilter = "all" | UIElementKind;

export default function UIInspectorPanel({ onOpen }: { onOpen: (record: UIInspectorRecord) => void }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const records = DEKOCLEAN_UI_REGISTRY;
  const filtered = useMemo(() => records.filter((record) => (statusFilter === "all" || record.status === statusFilter) && (kindFilter === "all" || record.kind === kindFilter)), [records, statusFilter, kindFilter]);
  const summary = useMemo(() => { const count = (status: UIElementStatus) => records.filter((record) => record.status === status).length; const informational = count("informational"), disabled = count("disabled"), working = count("working"), actionable = Math.max(1, records.length - informational - disabled); return { total: records.length, working, unconnected: count("unconnected"), disabled, informational, health: Math.round(working / actionable * 100), checkedAt: records.map((record) => record.lastCheckedAt).sort().at(-1) }; }, [records]);
  return <section className="dkUIInspector" aria-labelledby="dk-ui-inspector-title">
    <header><div><h2 id="dk-ui-inspector-title">مفتش واجهة المستخدم</h2><p>يفحص عناصر الواجهة التفاعلية ويتحقق من ارتباطها بإجراء فعلي.</p></div><strong>{summary.health}%<small>نسبة سلامة الواجهة</small></strong></header>
    <div className="dkUIInspectorStats"><article><b>{summary.total}</b><span>إجمالي العناصر</span></article><article><b>{summary.working}</b><span>يعمل</span></article><article><b>{summary.unconnected}</b><span>غير مربوط</span></article><article><b>{summary.disabled}</b><span>معطل</span></article><article><b>{summary.informational}</b><span>معلوماتي</span></article><article><b>{summary.checkedAt ?? "غير متاح"}</b><span>آخر فحص</span></article></div>
    <div className="dkUIInspectorCategories">{(Object.keys(kindLabels) as UIElementKind[]).map((kind) => { const entries = records.filter((record) => record.kind === kind); return <article key={kind}><strong>{kindLabels[kind]}</strong><span>الإجمالي {entries.length}</span><small>يعمل {entries.filter((r) => r.status === "working").length} · غير مربوط {entries.filter((r) => r.status === "unconnected").length} · معطل {entries.filter((r) => r.status === "disabled").length} · معلوماتي {entries.filter((r) => r.status === "informational").length}</small></article>; })}</div>
    <div className="dkUIInspectorFilters" aria-label="مرشحات الحالة">{(["all", "working", "unconnected", "disabled", "informational"] as StatusFilter[]).map((status) => <button type="button" className={statusFilter === status ? "active" : ""} key={status} onClick={() => setStatusFilter(status)}>{status === "all" ? "الكل" : statusLabels[status]}</button>)}</div>
    <div className="dkUIInspectorFilters" aria-label="مرشحات الفئة"><button type="button" className={kindFilter === "all" ? "active" : ""} onClick={() => setKindFilter("all")}>الكل</button>{(Object.keys(kindLabels) as UIElementKind[]).map((kind) => <button type="button" className={kindFilter === kind ? "active" : ""} key={kind} onClick={() => setKindFilter(kind)}>{kindLabels[kind]}</button>)}</div>
    <div className="dkUIInspectorRecords">{filtered.length ? filtered.map((record) => <article key={record.id}><header><strong>{record.label}</strong><span className={`status-${record.status}`}>{statusLabels[record.status]}</span></header><dl><div><dt>الاسم</dt><dd>{record.label}</dd></div><div><dt>النوع</dt><dd>{kindLabels[record.kind]}</dd></div><div><dt>الحالة</dt><dd>{statusLabels[record.status]}</dd></div><div><dt>الإجراء المتوقع</dt><dd>{record.expectedAction}</dd></div><div><dt>المصدر</dt><dd dir="ltr">{record.source ?? "غير متاح"}</dd></div><div><dt>السبب</dt><dd>{record.reason ?? (record.status === "working" ? "مرتبط بإجراء أو وجهة مسجلة." : "غير متاح")}</dd></div><div><dt>آخر فحص</dt><dd>{record.lastCheckedAt}</dd></div></dl><button type="button" onClick={() => onOpen(record)} disabled={!record.target}>عرض العنصر</button></article>) : <p className="dkUIInspectorEmpty">لم يتم تسجيل عناصر واجهة للفحص بعد.</p>}</div>
  </section>;
}

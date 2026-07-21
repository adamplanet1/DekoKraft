"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, ArchiveRestore, Brain, CheckCircle2, Clock3, FileSearch, Gauge, History, LoaderCircle, Radar, Recycle, ShieldCheck, Wrench, X } from "lucide-react";

import type {
  DekoBrainSecurityRecommendation, DekoCleanAction, DekoCleanActionPlan, DekoCleanAuditEntry,
  DekoCleanFinding, DekoCleanRepairRecipe, DekoCleanSummary, DiagnosisCard, EchoRepairExecutionResult, HealthScore, HealthScoreHistoryEntry, SecurityMemoryEntry, TimelineEntry,
} from "../../../lib/dekoclean/types";
import type { DekoCleanManifestSummary } from "../../../lib/dekoclean/summary";
import type { InspectionCounters, NeedsReviewCountBreakdown } from "../../../lib/dekoclean/findingSelectors";
import { selectVisibleInspectionFindings } from "../../../lib/dekoclean/findingSelectors";
import { displayedFindingsLabel, findingDisplayStatus, noActionableFindingsMessage } from "../../../lib/dekoclean/findingPresentation";
import type { MissionControlAnalytics } from "../../../lib/dekoclean/missionControlTypes";
import type { DekoScanProfileId, DekoScanRun } from "../../../lib/dekoclean/scan/types";
import MissionControlAnalyticsPanel from "./MissionControlAnalytics";
import SmartScanCenter from "./SmartScanCenter";
import DekoRebuildPanel from "./DekoRebuildPanel";
import DekoAccordionSection from "./DekoAccordionSection";
import UIInspectorPanel from "./UIInspectorPanel";
import { DEKOCLEAN_ACCORDION_STORAGE_KEY, parseAccordionState } from "./accordionState";
import "./dekoclean.css";

type CenterData = {
  summary: DekoCleanSummary;
  findings: DekoCleanFinding[];
  securityMemory: SecurityMemoryEntry[];
  audit: DekoCleanAuditEntry[];
  manifests: DekoCleanManifestSummary[];
  health: HealthScore;
  healthHistory: HealthScoreHistoryEntry[];
  diagnoses: Record<string, DiagnosisCard>;
  timeline: TimelineEntry[];
  missionControl: MissionControlAnalytics | null;
  missionControlError: string | null;
  total: number;
  scope: string;
  needsReviewBreakdown: NeedsReviewCountBreakdown;
  inspectionCounters: InspectionCounters;
  securityFindings: DekoCleanFinding[];
  securityScore: { baseScore: number; criticalPenalty: number; highPenalty: number; mediumPenalty: number; finalScore: number };
};
type Connector = { id: string; label: string; available: boolean; engineVersion?: string; signaturesUpdatedAt?: string };
type Tab = "overview" | "security" | "memory" | "audit" | "timeline" | "ui-inspector";
type DekoCleanNavigationTarget = { type: "summary"; view: "healthy" | "quarantine" | "needs-review" | "radar" | "pending-decision" } | { type: "finding"; findingId: string; action?: DekoCleanAction };
const accordionIds = ["project-health", "smart-scan", "overview", "scan-results", "findings", "repair", "dekorebuild", "operations", "maintenance", "recovery-points"] as const;
type AccordionId = typeof accordionIds[number];
const defaultAccordionState: Record<AccordionId, boolean> = {
  "project-health": true, "smart-scan": false, overview: true, "scan-results": false, findings: false,
  repair: false, dekorebuild: false, operations: false, maintenance: false, "recovery-points": false,
};

const statusText: Record<DekoCleanSummary["status"], string> = {
  stable: "مستقر", review: "يحتاج مراجعة", warning: "تحذير", danger: "خطر", scanning: "جارٍ الفحص",
};
const categoryText: Record<DekoCleanFinding["category"], string> = {
  "integrity-issues": "مشكلات السلامة", "ownership-issues": "مشكلات الملكية",
  "missing-references": "مراجع مفقودة", "duplicate-components": "مكونات مكررة",
  "unused-files": "ملفات غير مستخدمة", "unused-routes": "مسارات غير مستخدمة",
  "broken-imports": "استيرادات معطلة", "missing-translations": "ترجمات مفقودة",
  "security-issues": "مشكلات أمنية", "api-inconsistencies": "عدم اتساق API", "ui-inspector": "مشكلات ربط الواجهة", general: "نتائج عامة",
};
const actionLabels: Record<"validate" | "restore" | "recreate" | "repair", string> = {
  validate: "Validate — تحقق", restore: "Restore — استعادة", recreate: "Recreate — إعادة إنشاء", repair: "Repair — إصلاح",
};
function primaryAction(finding: DekoCleanFinding): keyof typeof actionLabels {
  const action = finding.recommendedActions.includes(finding.recommendedAction as keyof typeof actionLabels)
    ? finding.recommendedAction
    : finding.recommendedActions.find((candidate) => candidate in actionLabels) ?? "validate";
  return action as keyof typeof actionLabels;
}
function abbreviated(value?: string): string { if (!value) return "غير متاح"; return value.length > 20 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value; }
const classificationLabels = { "authorized-project-change": "تغيير مشروع معروف", "unverified-change": "تغيير يحتاج تحقق", "unexpected-change": "تغيير غير متوقع", "integrity-failure": "فشل سلامة الملف" } as const;
const approvalLabels = { "pending-baseline-approval": "ينتظر اعتماد خط الأساس", "baseline-approved": "معتمد ضمن خط الأساس" } as const;

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "تعذر تنفيذ العملية.");
  return data;
}

export default function DekoCleanCenter() {
  const [data, setData] = useState<CenterData | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [plan, setPlan] = useState<DekoCleanActionPlan | null>(null);
  const [repairRecipe, setRepairRecipe] = useState<DekoCleanRepairRecipe | null>(null);
  const [repairPreviewAccepted, setRepairPreviewAccepted] = useState(false);
  const [repairExecution, setRepairExecution] = useState<EchoRepairExecutionResult | null>(null);
  const [repairExecutionAttempted, setRepairExecutionAttempted] = useState(false);
  const [recommendation, setRecommendation] = useState<DekoBrainSecurityRecommendation | null>(null);
  const [timelinePage, setTimelinePage] = useState(0);
  const [scanResultFilter, setScanResultFilter] = useState<{ profileId: DekoScanProfileId; findingIds: string[] } | null>(null);
  const [accordionOpen, setAccordionOpen] = useState<Record<AccordionId, boolean>>(defaultAccordionState);
  const [singleOpen, setSingleOpen] = useState(false);
  const [smartScanActive, setSmartScanActive] = useState(false);
  const [recoveryActive, setRecoveryActive] = useState(false);
  const [expandedSecurityId, setExpandedSecurityId] = useState("");
  const accordionStorageReady = useRef(false);

  useEffect(() => {
    const stored = parseAccordionState(window.localStorage.getItem(DEKOCLEAN_ACCORDION_STORAGE_KEY), accordionIds);
    if (stored) {
      setAccordionOpen((current) => ({ ...current, ...stored.sections }));
      setSingleOpen(stored.singleOpen);
    }
    queueMicrotask(() => { accordionStorageReady.current = true; });
  }, []);

  useEffect(() => {
    if (!accordionStorageReady.current) return;
    try { window.localStorage.setItem(DEKOCLEAN_ACCORDION_STORAGE_KEY, JSON.stringify({ sections: accordionOpen, singleOpen })); }
    catch { /* local UI preference remains optional */ }
  }, [accordionOpen, singleOpen]);

  const openAccordion = useCallback((id: AccordionId) => {
    setAccordionOpen((current) => {
      if (current[id]) return current;
      if (!singleOpen) return { ...current, [id]: true };
      return Object.fromEntries(accordionIds.map((sectionId) => [sectionId, sectionId === "project-health" ? current[sectionId] : sectionId === id])) as Record<AccordionId, boolean>;
    });
  }, [singleOpen]);

  const toggleAccordion = useCallback((rawId: string) => {
    const id = rawId as AccordionId;
    setAccordionOpen((current) => {
      const nextOpen = !current[id];
      if (!nextOpen || !singleOpen) return { ...current, [id]: nextOpen };
      return Object.fromEntries(accordionIds.map((sectionId) => [sectionId, sectionId === "project-health" ? current[sectionId] : sectionId === id])) as Record<AccordionId, boolean>;
    });
  }, [singleOpen]);

  const load = useCallback(async () => {
    setError("");
    try {
      const [center, status] = await Promise.all([
        requestJson<CenterData>("/api/admin/dekoclean/findings"),
        requestJson<{ connectors: Connector[] }>("/api/admin/dekoclean/security/status"),
      ]);
      setData(center);
      setConnectors(status.connectors);
      setSelectedId((current) => center.findings.some((finding) => finding.id === current) ? current : center.findings[0]?.id || "");
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "تعذر تحميل مركز DekoClean."); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const selected = useMemo(() => data?.findings.find((finding) => finding.id === selectedId) ?? null, [data, selectedId]);
  const diagnosis = selected ? data?.diagnoses[selected.id] ?? null : null;
  const openNavigationTarget = (target: DekoCleanNavigationTarget) => {
    if (target.type === "finding") { setSelectedId(target.findingId); setPlan(null); setRecommendation(null); setTab("overview"); openAccordion("findings"); }
    else { setTab(target.view === "radar" ? "security" : "overview"); openAccordion(target.view === "quarantine" ? "recovery-points" : target.view === "healthy" ? "scan-results" : "findings"); }
    const section = target.type === "summary" && target.view === "quarantine" ? "recovery-points" : target.type === "summary" && target.view === "healthy" ? "scan-results" : target.type === "summary" && target.view === "radar" ? "security" : "findings";
    requestAnimationFrame(() => document.querySelector(`[data-accordion-id="${section}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const openFindingPlan = (findingId: string, action?: string) => {
    const finding = data?.findings.find((entry) => entry.id === findingId);
    if (!finding) { setError("تعذر فتح الخطة لأن معرّف النتيجة غير متوفر."); return; }
    setSelectedId(finding.id); setPlan(null); setRecommendation(null); setTab("overview"); openAccordion("findings");
    requestAnimationFrame(() => document.querySelector('[data-accordion-id="findings"]')?.scrollIntoView({ behavior: "smooth", block: "start" }));
    if (action && ["validate", "restore", "recreate", "repair"].includes(action)) setMessage(`الخطة المحددة: ${action}`);
  };

  async function runAction(label: string, action: () => Promise<void>) {
    if (["restore", "validate", "quarantine"].includes(label)) openAccordion("repair");
    setBusy(label); setError(""); setMessage("");
    try { await action(); await load(); } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "تعذر تنفيذ العملية."); }
    finally { setBusy(""); }
  }

  const scan = (operation: "scan" | "radar-scan" = "scan") => runAction("scan", async () => {
    const response = await requestJson<{ result: { cacheHit: boolean } }>("/api/admin/dekoclean/scan", { method: "POST", body: JSON.stringify({ operation }) });
    setMessage(response.result.cacheHit ? "لم تتغير ملفات المشروع؛ استُخدمت نتيجة الفحص الذكي المخزنة." : "اكتمل فحص DekoClean وDekoRadar دون إجراء أي تعديل تلقائي.");
  });

  const securityScan = () => runAction("security", async () => {
    const result = await requestJson<{ available: boolean }>("/api/admin/dekoclean/security/scan", { method: "POST" });
    setMessage(result.available ? "تم استيراد تقارير الحماية المحلية المنظمة." : "لم يتم العثور على أداة حماية متصلة. ما زال فحص سلامة المشروع متاحًا.");
  });
  const acceptBaseline = (finding: DekoCleanFinding) => runAction("baseline-approval", async () => {
    if (!window.confirm("هل تريد اعتماد hash الحالي كخط أساس موثوق؟ سيُحفظ الخط السابق في السجل.")) return;
    await requestJson("/api/admin/dekoclean/security/baseline", { method: "POST", body: JSON.stringify({ findingId: finding.id, confirmed: true, scanId: finding.scanIds?.at(-1) ?? "legacy-reconciliation", reason: "Approved by local administrator after reviewing the current project change." }) });
    setMessage("تم اعتماد التغيير والتحقق من خط الأساس الجديد.");
  });

  async function buildPlan(action: DekoCleanAction) {
    if (!selected) throw new Error("اختر نتيجة أولًا.");
    const result = await requestJson<{ plan: DekoCleanActionPlan }>("/api/admin/dekoclean/plan", {
      method: "POST", body: JSON.stringify({ findingIds: [selected.id], action }),
    });
    setPlan(result.plan);
    setMessage(action === "repair" || action === "recreate"
      ? "تم إنشاء خطة مراجعة فقط. لن ينفذ الإصلاح أو إعادة الإنشاء دون وصفة حتمية وpatch معتمد."
      : "تم إنشاء خطة العملية. راجعها قبل التأكيد.");
    return result.plan;
  }

  const previewRepair = () => runAction("repair-preview", async () => {
    if (!selected) throw new Error("اختر نتيجة أولًا.");
    openAccordion("repair");
    requestAnimationFrame(() => document.querySelector('[data-accordion-id="repair"]')?.scrollIntoView({ behavior: "smooth", block: "start" }));
    const result = await requestJson<{ recipe: DekoCleanRepairRecipe }>("/api/admin/dekoclean/repair-preview", {
      method: "POST", body: JSON.stringify({ findingId: selected.id }),
    });
    setPlan(null);
    setRepairRecipe(result.recipe);
    setRepairPreviewAccepted(false);
    setRepairExecution(null);
    setRepairExecutionAttempted(false);
    openAccordion("repair");
    setMessage("اكتملت معاينة الإصلاح للقراءة فقط. لم يتغير أي ملف.");
    requestAnimationFrame(() => document.querySelector('[data-accordion-id="repair"]')?.scrollIntoView({ behavior: "smooth", block: "start" }));
  });

  const acceptRepairPreview = () => runAction("repair-accept", async () => {
    if (!repairRecipe) throw new Error("أنشئ معاينة الإصلاح أولًا.");
    const result = await requestJson<{ recipe: DekoCleanRepairRecipe }>("/api/admin/dekoclean/repair/accept", {
      method: "POST", body: JSON.stringify({ recipeId: repairRecipe.id }),
    });
    setRepairRecipe(result.recipe);
    setRepairPreviewAccepted(true);
    setMessage("تم قبول وصفة الإصلاح وحفظ موافقة المدير على الخادم. لم يتغير الملف بعد.");
  });

  const executeAcceptedRepair = () => runAction("repair-execute", async () => {
    if (!repairRecipe || !repairPreviewAccepted) throw new Error("يجب قبول معاينة الإصلاح أولًا.");
    if (!window.confirm("تحذير نهائي: سيُنشئ EchoRecovery نسخة احتياطية موثقة ثم يطبق الـpatch المعروض فقط. هل تريد التنفيذ؟")) return;
    setRepairExecutionAttempted(true);
    const result = await requestJson<EchoRepairExecutionResult>("/api/admin/dekoclean/repair/execute", {
      method: "POST", body: JSON.stringify({ recipeId: repairRecipe.id }),
    });
    setRepairExecution(result);
    setRepairRecipe((current) => current && current.id === result.recipeId ? { ...current, status: result.ok || result.status === "rolled-back" ? "executed" : current.status } : current);
    setMessage(result.message);
  });

  async function execute(action: "quarantine" | "ignore" | "validate") {
    const nextPlan = await buildPlan(action);
    if (!window.confirm(`تأكيد تنفيذ ${action}؟ لن يتم حذف أي ملف نهائيًا.`)) return;
    await requestJson("/api/admin/dekoclean/execute", { method: "POST", body: JSON.stringify({ planId: nextPlan.id, confirmed: true }) });
    setMessage(action === "quarantine" ? "اكتمل النقل إلى الحجر المؤقت. يتوفر rollback من الـmanifest." : "اكتملت العملية وتم تسجيلها في سجل التدقيق.");
  }

  const analyze = () => runAction("recommend", async () => {
    if (!selected) throw new Error("اختر نتيجة أولًا.");
    const result = await requestJson<{ recommendation: DekoBrainSecurityRecommendation }>("/api/admin/dekoclean/recommend", {
      method: "POST", body: JSON.stringify({ findingId: selected.id }),
    });
    setRecommendation(result.recommendation);
    setMessage("اكتمل تحليل البديل وعُرضت التوصية دون تعديل ملفات المشروع.");
  });

  const restoreLatest = () => runAction("restore", async () => {
    const manifest = data?.manifests.find((entry) => entry.status !== "restored");
    if (!manifest) throw new Error("لا يوجد manifest قابل للاستعادة.");
    if (!window.confirm(`استعادة manifest ${manifest.id}؟ لن تتم الكتابة فوق ملف موجود.`)) return;
    await requestJson("/api/admin/dekoclean/restore", { method: "POST", body: JSON.stringify({ manifestId: manifest.id, confirmed: true }) });
    setMessage("اكتملت الاستعادة والتحقق. راجع سجل العمليات للتفاصيل.");
  });

  const disableMemory = (id: string) => runAction("memory", async () => {
    await requestJson("/api/admin/dekoclean/security-memory", { method: "PATCH", body: JSON.stringify({ id }) });
    setMessage("تم تعطيل الوصفة. لن تستخدم في التوصيات اللاحقة.");
  });

  const summary = data?.summary;
  const activeFindings = useMemo(() => selectVisibleInspectionFindings(data?.findings ?? [], scanResultFilter?.findingIds), [data?.findings, scanResultFilter]);
  const critical = useMemo(() => activeFindings.filter((finding) => finding.severity === "critical"), [activeFindings]);
  const healthLabels: Record<HealthScore["label"], string> = { excellent: "ممتاز", good: "جيد", "needs-attention": "يحتاج انتباه", warning: "تحذير", critical: "حرج" };
  const timeline = data?.timeline ?? [];
  const timelinePages = Math.max(1, Math.ceil(timeline.length / 20));
  const visibleTimeline = timeline.slice(timelinePage * 20, timelinePage * 20 + 20);
  const renderState = !data ? (error ? "error" : "loading") : data.missionControl ? "loaded" : "mission-error";
  const runtimeVerification = data ? { dashboardSafe: data.summary.healthyFiles, safeDestination: data.summary.healthyFiles, dashboardReview: data.summary.reviewItems, reviewDestination: data.needsReviewBreakdown.total, renderedCards: data.findings.length, paginationTotal: data.total, mismatch: data.summary.reviewItems !== data.needsReviewBreakdown.total || data.findings.length !== data.total } : null;
  const quickActions = <section className="dkCleanQuickActions" aria-labelledby="dk-quick-actions"><header><div><h2 id="dk-quick-actions">إجراءات سريعة</h2><p>كل فحص قراءة فقط، وأي تعديل حساس يتطلب تأكيد المدير.</p></div></header><div><button className="is-primary" type="button" onClick={() => void scan("scan")} disabled={Boolean(busy)}><FileSearch /> فحص المشروع</button><button className="is-secondary" type="button" onClick={() => void scan("radar-scan")} disabled={Boolean(busy)}><Radar /> تشغيل DekoRadar</button><button className="is-secondary" type="button" onClick={() => void securityScan()} disabled={Boolean(busy)}><ShieldCheck /> فحص الأمان</button><button className="is-secondary" type="button" onClick={() => { setTab("overview"); openAccordion("findings"); if (selected) void buildPlan("quarantine"); requestAnimationFrame(() => document.querySelector('[data-accordion-id="findings"]')?.scrollIntoView({ behavior: "smooth" })); }} disabled={!selected || Boolean(busy)}>معاينة خطة التنظيف</button></div></section>;
  const handleScanActiveState = useCallback((active: boolean) => { setSmartScanActive(active); if (active) openAccordion("smart-scan"); }, [openAccordion]);
  const handleScanResultsChanged = useCallback(async (run: DekoScanRun) => {
    setScanResultFilter(run.findingIds.length ? { profileId: run.profileId, findingIds: run.findingIds } : null);
    setSelectedId(run.findingIds[0] ?? "");
    await load();
  }, [load]);
  const handleRecoveryActiveState = useCallback((active: boolean) => { setRecoveryActive(active); if (active) openAccordion("dekorebuild"); }, [openAccordion]);

  function navigateWorkspace(target: Tab) {
    setTab(target);
    const section = target === "audit" ? "operations" : target === "timeline" ? "maintenance" : target === "overview" ? "overview" : null;
    if (section) {
      openAccordion(section);
      requestAnimationFrame(() => document.querySelector(`[data-accordion-id="${section}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  return (
    <main className="dkCleanPage dkCleanContainer" dir="rtl" data-render-state={renderState}>
      <header className="dkCleanHero">
        <div><Link href="/admin">العودة إلى لوحة المدير</Link><span><ShieldCheck aria-hidden="true" /> مركز الصيانة والأمان</span><h1><b dir="ltr">DekoClean Security &amp; Repair Center</b></h1><p>Radar يكتشف، DekoClean يحلل، DekoBrain يوصي، والمدير يؤكد قبل أي إجراء حساس.</p></div>
        <div className="dkCleanHeroMeta"><div className={`dkCleanSystemStatus status-${summary?.status ?? "stable"}`}><strong>{summary ? statusText[summary.status] : "لم يُفحص"}</strong><small>حالة النظام</small></div><small>آخر فحص: {summary?.lastScanAt ? new Date(summary.lastScanAt).toLocaleDateString("ar") : "غير متاح"}</small><button type="button" onClick={() => void load()} disabled={Boolean(busy)}>تحديث البيانات</button></div>
      </header>

      {critical.length > 0 && <aside className="dkCleanCritical" role="alert"><AlertTriangle /> يوجد {critical.length} تنبيه حرج يحتاج مراجعة المدير. لم يُنفذ أي إجراء تلقائي.</aside>}
      {message && <p className="dkCleanMessage" role="status">{message}</p>}
      {error && data && <div className="dkCleanError" role="alert"><strong>تعذر تحميل بيانات DekoClean.</strong><span>لم تتأثر بيانات المشروع. يمكنك إعادة المحاولة.</span><button type="button" onClick={() => void load()}>إعادة المحاولة</button></div>}

      <nav className="dkCleanTabs" aria-label="أقسام DekoClean" role="tablist">
        {([['overview','نظرة عامة'],['security','الأمن والحماية'],['memory','ذاكرة العمليات'],['audit','سجل العمليات'],['timeline','الخط الزمني للصيانة'],['ui-inspector','مفتش الواجهة']] as const).map(([id, label]) =>
          <button type="button" role="tab" aria-selected={tab === id} key={id} className={tab === id ? "active" : ""} onClick={() => navigateWorkspace(id)}>{label}</button>)}
      </nav>
      {process.env.NODE_ENV === "development" && runtimeVerification && <aside className={`dkRuntimeVerification ${runtimeVerification.mismatch ? "is-mismatch" : ""}`} aria-label="DekoClean runtime count verification"><strong>Runtime verification</strong><span>ملفات سليمة في البطاقة: {runtimeVerification.dashboardSafe}</span><span>ملفات سليمة في الوجهة: {runtimeVerification.safeDestination}</span><span>تحتاج مراجعة في البطاقة: {runtimeVerification.dashboardReview}</span><span>تحتاج مراجعة في الوجهة: {runtimeVerification.reviewDestination}</span><span>البطاقات المعروضة: {runtimeVerification.renderedCards}</span><span>إجمالي الصفحات: {runtimeVerification.paginationTotal}</span><b>mismatch: {String(runtimeVerification.mismatch)}</b></aside>}
      {tab === "ui-inspector" && <UIInspectorPanel onOpen={(record) => { if (!record.target) return; if (record.id.startsWith("quick-")) { setTab("overview"); openAccordion("smart-scan"); return; } if (["overview", "security", "memory", "audit", "timeline"].includes(record.target)) { navigateWorkspace(record.target as Tab); return; } setTab("overview"); const section = accordionIds.includes(record.target as AccordionId) ? record.target as AccordionId : record.target.includes("finding") ? "findings" : "overview"; openAccordion(section); requestAnimationFrame(() => document.querySelector(`[data-accordion-id="${section}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" })); }} />}
      {tab === "security" && data && <section className="dkCleanPanel dkCompactSecurity" aria-labelledby="dk-compact-security-title"><header><div><h2 id="dk-compact-security-title">نتائج الأمان النشطة</h2><p>{data.securityFindings.length ? `1–${data.securityFindings.length} من ${data.securityFindings.length}` : "لا توجد نتائج في هذا القسم حاليًا."}</p></div><span>{data.securityFindings.length}</span></header><div>{data.securityFindings.map((finding) => { const expanded = expandedSecurityId === finding.id; const classification = finding.protectedChangeClassification ?? "unverified-change"; const approval = finding.baselineApprovalStatus ?? "pending-baseline-approval"; const eligible = ["authorized-project-change", "unverified-change"].includes(classification) && approval === "pending-baseline-approval" && (finding.lifecycle?.status ?? "OPEN") === "OPEN" && Boolean(finding.fileHashSha256 && finding.affectedFiles[0]); return <article key={finding.findingId ?? finding.id} data-finding-id={finding.findingId ?? finding.id} className={expanded ? "is-expanded" : ""}><header><strong>{classificationLabels[classification]}</strong><span className={`severity-${finding.severity}`}>{finding.severity}</span><span>{finding.lifecycle?.status ?? finding.status}</span><span>{approvalLabels[approval]}</span></header><code title={finding.affectedFiles[0]} dir="ltr">{finding.affectedFiles[0] ?? "غير متاح"}</code><dl><div><dt>المصدر</dt><dd>{finding.detector ?? finding.detectedBy}</dd></div><div><dt>أول ظهور</dt><dd>{finding.firstSeenAt ? new Date(finding.firstSeenAt).toLocaleDateString("ar") : "غير متاح"}</dd></div><div><dt>آخر ظهور</dt><dd>{finding.lastSeenAt ? new Date(finding.lastSeenAt).toLocaleDateString("ar") : "غير متاح"}</dd></div><div><dt>التكرار</dt><dd>{finding.occurrenceCount ?? 1}</dd></div></dl>{expanded && <section className="dkSecurityTechnical"><div><b>المسار</b><code dir="ltr">{finding.affectedFiles[0] ?? "غير متاح"}</code></div><div><b>Finding ID</b><code dir="ltr">{finding.findingId ?? finding.id}</code><button type="button" onClick={() => void navigator.clipboard.writeText(finding.findingId ?? finding.id)}>نسخ</button></div><div><b>Fingerprint</b><code dir="ltr">{finding.fingerprint ?? "غير متاح"}</code><button type="button" disabled={!finding.fingerprint} onClick={() => finding.fingerprint && void navigator.clipboard.writeText(finding.fingerprint)}>نسخ</button></div><div><b>البصمة السابقة</b><code dir="ltr">{finding.previousFileHashSha256 ?? "غير متاح"}</code><small>{abbreviated(finding.previousFileHashSha256)}</small></div><div><b>البصمة الحالية</b><code dir="ltr">{finding.fileHashSha256 ?? "غير متاح"}</code><small>{abbreviated(finding.fileHashSha256)}</small></div><div><b>Scan ID</b><code dir="ltr">{finding.scanIds?.at(-1) ?? "غير متاح"}</code></div><div><b>الإصدار</b><span>{finding.migrationVersion ?? "غير متاح"}</span></div><div><b>الدليل</b><span>{finding.evidence.join("، ") || "غير متاح"}</span></div></section>}<footer><button type="button" onClick={() => setExpandedSecurityId(expanded ? "" : finding.id)}>{expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}</button><button type="button" onClick={() => openFindingPlan(finding.id, "validate")}>تحقق</button>{eligible ? <button type="button" onClick={() => void acceptBaseline(finding)} disabled={Boolean(busy)}>اعتماد التغيير</button> : approval === "baseline-approved" ? <span>معتمد مسبقًا</span> : null}{finding.recommendedAction === "restore" && finding.previousFileHashSha256 && <button type="button" onClick={() => openFindingPlan(finding.id, "restore")}>استعادة</button>}</footer></article>; })}</div></section>}
      {tab === "security" && data?.securityScore && <details className="dkCleanPanel dkSecurityScoreExplanation"><summary>كيف تم حساب النتيجة؟</summary><div><span>الدرجة الأساسية <b>{data.securityScore.baseScore}</b></span><span>خصم حرج <b>-{data.securityScore.criticalPenalty}</b></span><span>خصم مرتفع <b>-{data.securityScore.highPenalty}</b></span><span>خصم متوسط <b>-{data.securityScore.mediumPenalty}</b></span><span>النتيجة النهائية <b>{data.securityScore.finalScore}%</b></span></div></details>}

      <label className="dkAccordionPreference"><input type="checkbox" checked={singleOpen} onChange={(event) => setSingleOpen(event.target.checked)} /> فتح قسم واحد فقط</label>

      {(["overview", "audit", "timeline"] as Tab[]).includes(tab) && <div className="dkAccordionWorkspace">
        <DekoAccordionSection id="project-health" title="صحة المشروع" subtitle="المؤشرات الحالية وMission Control Analytics" icon={<Gauge />} badge={`${data?.health.value ?? 0}%`} isOpen={accordionOpen["project-health"]} onToggle={toggleAccordion}>
          <section className="dkMissionControl" data-render-state={renderState} aria-busy={renderState === "loading"}>
            <MissionControlAnalyticsPanel
              data={data?.missionControl ?? null}
              state={renderState}
              error={data?.missionControlError ?? (!data && error ? "تعذر تحميل بيانات DekoClean." : undefined)}
              onRetry={data?.missionControlError || (!data && error) ? () => void load() : undefined}
              quickActions={quickActions}
              onActionFeedback={(kind, text) => kind === "success" ? (setError(""), setMessage(text)) : (setMessage(""), setError(text))}
              onNavigate={(target) => navigateWorkspace(target)}
              onInspectFinding={(id, action) => openFindingPlan(id, action)}
            />
          </section>
          <section className={`dkCleanHealth health-${data?.health.label ?? "good"}`} aria-labelledby="project-health-title">
            <div className="dkCleanHealthMain"><Gauge aria-hidden="true" /><div><span id="project-health-title">صحة المشروع</span><strong>{data?.health.value ?? 0}%</strong><small>{data ? healthLabels[data.health.label] : "جارٍ الحساب"}</small></div></div>
            <div className="dkCleanHealthProgress" role="progressbar" aria-label="درجة صحة المشروع" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data?.health.value ?? 0}><i style={{ width: `${data?.health.value ?? 0}%` }} /></div>
            <div className="dkCleanHealthTrend"><Activity aria-hidden="true" /><span>الاتجاه: {data?.health.trend === "improving" ? "يتحسن" : data?.health.trend === "declining" ? "يتراجع" : "مستقر"}</span><div className="dkCleanHealthBars" aria-label="سجل درجة الصحة">{(data?.healthHistory.slice(-12) ?? []).map((entry) => <i key={entry.recordedAt} style={{ height: `${Math.max(8, entry.value)}%` }} title={`${entry.value}% — ${entry.recordedAt}`} />)}</div></div>
            <details><summary>تفاصيل حساب الدرجة</summary><div className="dkCleanHealthFactors">{data?.health.factors.map((factor) => <span key={factor.id}><b>{factor.label}</b><small>{factor.findingCount} نتيجة · خصم {factor.penalty} من {factor.weight}</small></span>)}</div></details>
          </section>
        </DekoAccordionSection>

        <DekoAccordionSection id="smart-scan" title="مركز الفحص الذكي" subtitle="اختر نوع الفحص المناسب، ولن يبدأ أي فحص تلقائيًا." icon={<FileSearch />} badge="8 أنواع فحص" isOpen={accordionOpen["smart-scan"]} onToggle={toggleAccordion} lockedOpen={smartScanActive}>
          <SmartScanCenter
          onResultsChanged={handleScanResultsChanged}
          onActiveStateChange={handleScanActiveState}
          onShowResults={(profileId, findingIds) => {
            setScanResultFilter({ profileId, findingIds });
            setSelectedId(findingIds[0] ?? "");
            openAccordion("scan-results");
            requestAnimationFrame(() => document.querySelector('[data-accordion-id="scan-results"]')?.scrollIntoView({ behavior: "smooth", block: "start" }));
          }}
          />
        </DekoAccordionSection>

        <DekoAccordionSection id="overview" title="نظرة عامة" subtitle="ملخص مؤشرات الرادار والمراجعة والحجر والملفات المحمية" icon={<Radar />} badge={`${summary?.reviewItems ?? 0} تحتاج مراجعة`} isOpen={accordionOpen.overview} onToggle={toggleAccordion}>
        <section className="dkCleanMetrics dkCleanOverviewGroup" aria-label="حالة النظام">
          <button type="button" className="dkUnifiedKpiCard dkUnifiedKpiCard--compact" data-kpi-tone="blue" aria-label="تنبيهات الرادار" onClick={() => openNavigationTarget({ type: "summary", view: "radar" })}><Radar /><strong>{summary?.radarAlerts ?? 0}</strong><span>تنبيهات الرادار</span></button>
          <button type="button" className="dkUnifiedKpiCard dkUnifiedKpiCard--compact" data-kpi-tone="orange" aria-label="تحتاج مراجعة" onClick={() => openNavigationTarget({ type: "summary", view: "needs-review" })}><FileSearch /><strong>{summary?.reviewItems ?? 0}</strong><span>تحتاج مراجعة</span></button>
          <button type="button" className="dkUnifiedKpiCard dkUnifiedKpiCard--compact" data-kpi-tone="purple" aria-label="في الحجر المؤقت" onClick={() => openNavigationTarget({ type: "summary", view: "quarantine" })}><Recycle /><strong>{summary?.quarantinedFiles ?? 0}</strong><span>في الحجر المؤقت</span></button>
          <button type="button" className="dkUnifiedKpiCard dkUnifiedKpiCard--compact" data-kpi-tone="green" aria-label="ملفات سليمة" onClick={() => openNavigationTarget({ type: "summary", view: "healthy" })}><ShieldCheck /><strong>{summary?.healthyFiles ?? summary?.protectedFiles ?? 0}</strong><span>ملفات سليمة</span></button>
        </section>
        </DekoAccordionSection>

        <DekoAccordionSection id="scan-results" title="نتائج الفحص" subtitle="ملخص آخر فحص والمرشح النشط للنتائج" icon={<Gauge />} badge={scanResultFilter ? "نتائج محددة" : `${activeFindings.length} نتيجة`} isOpen={accordionOpen["scan-results"]} onToggle={toggleAccordion}>
          {scanResultFilter ? <div className="dkSmartScanFilter" role="status"><span>نتائج الفحص الحالي: {scanResultFilter.profileId} · {scanResultFilter.findingIds.length} نتيجة</span><button type="button" onClick={() => setScanResultFilter(null)}>كل النتائج</button></div> : <p className="dkAccordionEmpty">اعرض نتائج أحد ملفات الفحص لمراجعتها هنا، أو افتح خطة التنظيف لعرض جميع النتائج الحالية.</p>}
        </DekoAccordionSection>

        <DekoAccordionSection id="findings" title="نتائج الفحص الأخيرة" subtitle="يعرض هذا القسم نتائج آخر فحص، بما فيها النتائج التي تمت مراجعتها أو التي لم تعد تحتاج إلى إجراء." icon={<FileSearch />} badge={`${activeFindings.length} نتيجة مجمعة`} isOpen={accordionOpen.findings} onToggle={toggleAccordion}>
        <section className="dkCleanPanel">
          <header><div><h2>نتائج الفحص الأخيرة</h2><p>يعرض هذا القسم نتائج آخر فحص، بما فيها النتائج التي تمت مراجعتها أو التي لم تعد تحتاج إلى إجراء.</p></div></header>
          {data?.inspectionCounters && <><div className="dkCleanCountBreakdown" role="status"><span>إجمالي النتائج: <b>{data.inspectionCounters.totalFindings}</b></span><span><b>{displayedFindingsLabel(activeFindings.length, data.inspectionCounters.totalFindings)}</b></span><span>نتائج قابلة للإجراء: <b>{data.inspectionCounters.actionableFindings}</b></span><span>الملفات المتأثرة الفريدة: <b>{data.inspectionCounters.uniqueAffectedFiles}</b></span><span>تم تجاهلها: <b>{data.inspectionCounters.ignoredFindings}</b></span><span>تم حلها: <b>{data.inspectionCounters.resolvedFindings}</b></span></div><p className="dkAccordionEmpty">النتيجة هي مجموعة مشكلة، وقد تحتوي النتيجة الواحدة على عدة ملفات.</p>{noActionableFindingsMessage(data.inspectionCounters.actionableFindings) && <p className="dkFindingsNoAction" role="status">{noActionableFindingsMessage(data.inspectionCounters.actionableFindings)}</p>}</>}
          <div className="dkCleanFindings">
            <aside>{activeFindings.length === 0 ? <p>لا توجد نتائج نشطة. شغّل الفحص للحصول على بيانات فعلية.</p> : activeFindings.map((finding) => { const severity = data?.diagnoses[finding.id]?.severity; const action = primaryAction(finding); const displayStatus = findingDisplayStatus(finding); return <button type="button" key={finding.id} className={selectedId === finding.id ? "active" : ""} aria-expanded={selectedId === finding.id} aria-controls="dk-clean-finding-details" onClick={() => { setSelectedId(finding.id); setPlan(null); setRecommendation(null); }}><span className={`severity-${finding.severity} dkCleanSeverity`} title={severity?.explanation}>{severity?.label ?? finding.severity}<i>{severity?.explanation}</i></span><span className={`dkFindingStatus status-${displayStatus.status}`}>{displayStatus.label}</span><strong>{finding.title}</strong><small>{categoryText[finding.category]} · {finding.count} ملف · {actionLabels[action]}</small><small>عرض التفاصيل · الإجراء: {actionLabels[action]}</small></button>; })}</aside>
            <article id="dk-clean-finding-details">{selected && diagnosis ? <div className="dkCleanDiagnosis">
              <header><div><small>بطاقة التشخيص التفصيلي</small><h3>{diagnosis.problem}</h3></div><span className={`severity-${selected.severity} dkCleanSeverity`} tabIndex={0}>{diagnosis.severity.label}<i>{diagnosis.severity.explanation}</i></span></header>
              <div className="dkCleanDiagnosisGrid"><section><b>الإجراء المقترح</b><span>{actionLabels[primaryAction(selected)]}</span></section><section><b>الثقة</b><span>{Math.round((recommendation?.securityMemoryMatch?.confidence ?? diagnosis.confidence) * 100)}%</span></section><section><b>تحليل DekoBrain</b><span>{recommendation?.riskExplanation ?? diagnosis.analysis}</span></section><section><b>الأثر المتوقع</b><span>{diagnosis.expectedImpact}</span></section><section><b>الملفات المتأثرة</b><span>{diagnosis.affectedFiles.length}</span></section></div>
              <details className="dkCleanTechnical"><summary>عرض التفاصيل</summary><dl><div><dt>الملفات المتأثرة</dt><dd dir="ltr">{diagnosis.affectedFiles.join("، ") || "General finding without a path"}</dd></div><div><dt>السبب</dt><dd>{diagnosis.cause}</dd></div><div><dt>الإجراء المقترح</dt><dd>{actionLabels[primaryAction(selected)]}</dd></div><div><dt>التبعيات</dt><dd dir="ltr">{diagnosis.dependencies.join("، ") || "No recorded dependencies"}</dd></div><div><dt>نتائج مرتبطة</dt><dd dir="ltr">{diagnosis.relatedFindingIds.join("، ") || "No related findings"}</dd></div><div><dt>المصدر</dt><dd dir="ltr">{diagnosis.detectedBy}</dd></div><div><dt>Finding ID</dt><dd dir="ltr">{diagnosis.findingId}</dd></div></dl></details>
              <div className="dkCleanSafety"><strong>ملخص الأمان</strong><span>Snapshot: {diagnosis.safetyChecks.snapshot ? "مطلوب" : "غير مطلوب"}</span><span>Manifest: {diagnosis.safetyChecks.manifest ? "مطلوب" : "غير مطلوب"}</span><span>Rollback: {diagnosis.safetyChecks.rollback ? "متاح" : "غير مطلوب"}</span><span>Validation: {diagnosis.validation.join(" · ")}</span><span>المخاطر: {diagnosis.estimatedRisk}</span><span>الوقت: {diagnosis.estimatedTime}</span></div>
              <div className="dkCleanActions"><button className="is-secondary" onClick={() => void analyze()} disabled={Boolean(busy)}><Brain /> تحليل الدليل</button><button className="is-primary" title={selected?.recommendedActions.includes("repair") ? undefined : "Repair is not available for this finding type."} aria-label={selected?.recommendedActions.includes("repair") ? "Repair" : "Repair is not available for this finding type."} onClick={() => void previewRepair()} disabled={Boolean(busy) || !selected?.recommendedActions.includes("repair")}>{busy === "repair-preview" ? <LoaderCircle className="is-spinning" /> : <Wrench />} {busy === "repair-preview" ? "جارٍ إنشاء المعاينة..." : "إصلاح"}</button><button className="is-secondary" onClick={() => void restoreLatest()} disabled={!data?.manifests.some((entry) => entry.status !== "restored") || Boolean(busy)}><ArchiveRestore /> استعادة</button><button className="is-secondary" onClick={() => void execute("ignore")} disabled={Boolean(busy)}>تجاهل</button><button className="is-secondary" onClick={() => { setPlan(null); setRecommendation(null); setRepairRecipe(null); setRepairPreviewAccepted(false); setRepairExecution(null); setRepairExecutionAttempted(false); }} disabled={!plan && !recommendation && !repairRecipe}><X /> إلغاء</button></div>
            </div> : <p>اختر نتيجة لعرض التشخيص التفصيلي.</p>}</article>
          </div>
        </section>
        {(plan || recommendation) && <section className="dkCleanPanel dkCleanPreview"><h2>المعاينة والتوصية</h2>{plan && <div><strong>خطة {plan.action}</strong><p>{plan.explanation}</p><small>Snapshot: {plan.snapshotRequired ? "مطلوب" : "غير مطلوب"} · Rollback: {plan.rollbackAvailable ? "متاح" : "غير متاح"}</small></div>}{recommendation && <div><strong>{recommendation.summary}</strong><p>{recommendation.riskExplanation}</p>{recommendation.warnings.map((warning) => <small key={warning}>{warning}</small>)}</div>}</section>}
        </DekoAccordionSection>

        <DekoAccordionSection id="repair" title="مركز الإصلاح والاستعادة" subtitle="Repair وRestore وRecreate وValidate والحجر المؤقت" icon={<Wrench />} badge={repairRecipe ? (repairPreviewAccepted ? "معاينة مقبولة" : "معاينة جاهزة") : plan ? "خطة جاهزة" : undefined} isOpen={accordionOpen.repair} onToggle={toggleAccordion} lockedOpen={busy === "restore" || busy === "validate" || busy === "quarantine"}>
          <section className="dkCleanPanel"><header><div><h2>مركز الإصلاح والاستعادة</h2><p>الإصلاح وإعادة الإنشاء لا يعملان تلقائيًا دون وصفة حتمية معتمدة.</p></div><div className="dkCleanActions"><button onClick={() => selected && void buildPlan("recreate")} disabled={!selected || Boolean(busy)}>Recreate — إعادة إنشاء</button><button onClick={() => void restoreLatest()} disabled={!data?.manifests.some((entry) => entry.status !== "restored") || Boolean(busy)}><ArchiveRestore /> Restore — استعادة آخر حالة</button><button onClick={() => void execute("validate")} disabled={!selected || Boolean(busy)}>Validate — تحقق</button></div></header></section>
          {busy === "repair-preview" && <section className="dkCleanPanel dkRepairConnectionState" role="status"><LoaderCircle className="is-spinning" /><div><strong>جارٍ إنشاء وصفة الإصلاح</strong><p>يتم الآن التحقق من الملف والمرجع وحساب checksums. لم يتغير أي ملف.</p></div></section>}
          {error && !repairRecipe && <section className="dkCleanPanel dkRepairConnectionState is-error" role="alert"><AlertTriangle /><div><strong>تعذر إنشاء معاينة الإصلاح</strong><p>{error}</p></div></section>}
          {repairRecipe && <section className="dkCleanPanel dkRepairRecipe" aria-labelledby="dk-repair-preview-title">
            <header><div><small>READ-ONLY · DETERMINISTIC</small><h2 id="dk-repair-preview-title">معاينة وصفة الإصلاح</h2><p>Recipe ID: <b dir="ltr">{repairRecipe.id}</b></p></div><span>{repairRecipe.changes.length} تغيير</span></header>
            <div className="dkRepairSummary"><article><b>الملفات المتأثرة</b><span>{repairRecipe.affectedFiles.length}</span></article><article><b>Snapshot</b><span>{repairRecipe.backupPlan.recoveryPointType}</span></article><article><b>Rollback</b><span>متاح بعد التنفيذ</span></article></div>
            <div className="dkRepairChanges">{repairRecipe.changes.map((change) => <article key={`${change.path}:${change.line}`}><header><strong dir="ltr">{change.path}:{change.line}</strong><span>{change.kind}</span></header><dl><div><dt>القيمة الحالية</dt><dd dir="ltr"><code>{change.before}</code></dd></div><div><dt>القيمة المقترحة</dt><dd dir="ltr"><code>{change.after}</code></dd></div><div><dt>SHA-256 الحالي</dt><dd dir="ltr"><code>{change.expectedBeforeChecksum}</code></dd></div><div><dt>SHA-256 المتوقع</dt><dd dir="ltr"><code>{change.expectedAfterChecksum}</code></dd></div></dl></article>)}</div>
            <article className="dkRepairBackup"><strong>خطة النسخ الاحتياطي</strong><p>{repairRecipe.backupPlan.rollback}</p><span dir="ltr">Files: {repairRecipe.backupPlan.filesToSnapshot.join(", ")}</span></article>
            <div className="dkRepairValidation"><strong>التحقق المطلوب بعد التنفيذ</strong>{repairRecipe.validationCommands.map((command) => <code dir="ltr" key={command}>{command}</code>)}</div>
            <div className="dkCleanActions"><button type="button" className="is-primary" onClick={() => void acceptRepairPreview()} disabled={repairPreviewAccepted || Boolean(busy)}><CheckCircle2 /> {busy === "repair-accept" ? "جارٍ حفظ الموافقة..." : repairPreviewAccepted ? "تم قبول المعاينة" : "قبول المعاينة"}</button><button type="button" className="is-primary" onClick={() => void executeAcceptedRepair()} disabled={!repairPreviewAccepted || Boolean(busy) || repairExecutionAttempted}>{busy === "repair-execute" ? <LoaderCircle className="is-spinning" /> : <Wrench />} تأكيد وتنفيذ الإصلاح</button><button type="button" onClick={() => { setRepairRecipe(null); setRepairPreviewAccepted(false); setRepairExecution(null); setRepairExecutionAttempted(false); }} disabled={busy === "repair-execute"}><X /> إلغاء المعاينة</button></div>
            {repairPreviewAccepted && !repairExecution && <aside className="dkRepairWarning" role="alert"><AlertTriangle /> الوصفة مقبولة. التنفيذ سيعدل الملف المعروض فقط بعد إنشاء نسخة احتياطية والتحقق منها.</aside>}
            {busy === "repair-execute" && <article className="dkRepairExecution status-executing" aria-live="polite"><header><strong><LoaderCircle className="is-spinning" /> EchoRecovery: executing</strong></header><p>جارٍ التحقق من checksum وإنشاء النسخة الاحتياطية الموثقة قبل الكتابة...</p></article>}
            {repairExecution && <article className={`dkRepairExecution status-${repairExecution.status}`} role="status"><header><strong>EchoRecovery: {repairExecution.status}</strong><span>{repairExecution.errorCode ?? "CHECKSUMS_VERIFIED"}</span></header><p>{repairExecution.message}</p><dl><div><dt>النسخة الاحتياطية</dt><dd>{repairExecution.log.backupVerified ? "تم إنشاؤها والتحقق منها" : "لم تُنشأ"}</dd></div><div><dt>مسار النسخة</dt><dd dir="ltr">{repairExecution.log.backupPath ?? "—"}</dd></div><div><dt>Checksum قبل التنفيذ</dt><dd>{repairExecution.log.actualBeforeChecksum === repairExecution.log.expectedBeforeChecksum ? "مطابق" : "غير مطابق"}</dd></div><div><dt>Checksum بعد التنفيذ</dt><dd>{repairExecution.log.checksumVerified ? "مطابق" : repairExecution.status === "rolled-back" ? "فشل وتم التراجع" : "غير متحقق"}</dd></div></dl></article>}
          </section>}
        </DekoAccordionSection>

        <DekoAccordionSection id="dekorebuild" title="DekoRebuild" subtitle="النسخة السليمة، المعاينة، الاستعادة وRollback" icon={<Recycle />} badge="استعادة موثقة" isOpen={accordionOpen.dekorebuild} onToggle={toggleAccordion} lockedOpen={recoveryActive}>
          <DekoRebuildPanel suggestedFile={selected?.affectedFiles[0]} detectedProblem={selected?.title} onActiveStateChange={handleRecoveryActiveState} />
        </DekoAccordionSection>

        <DekoAccordionSection id="operations" title="سجل العمليات" subtitle="عمليات الفحص والإصلاح والاستعادة المسجلة" icon={<History />} badge={`${data?.audit.length ?? 0} عملية`} isOpen={accordionOpen.operations} onToggle={toggleAccordion}>
          <section className="dkCleanPanel"><h2><History /> سجل العمليات</h2><div className="dkCleanAudit">{data?.audit.length ? data.audit.map((entry) => <article key={entry.operationId}><CheckCircle2 /><div><strong>{entry.action} · {entry.status}</strong><span>{entry.createdAt}</span><small>{entry.affectedPaths.length} مسار · rollback: {entry.rollbackStatus}</small></div></article>) : <p>لا توجد عمليات مسجلة.</p>}</div></section>
        </DekoAccordionSection>

        <DekoAccordionSection id="maintenance" title="الخط الزمني للصيانة" subtitle="التغيرات الزمنية في صحة المشروع ونتائج العمليات" icon={<Clock3 />} badge={`${timeline.length} عملية`} isOpen={accordionOpen.maintenance} onToggle={toggleAccordion}>
          <section className="dkCleanPanel"><header><div><h2><Clock3 /> الخط الزمني للصيانة</h2><p>كل عملية مسجلة بمصدرها ونتيجتها وتغير درجة صحة المشروع. تعرض الصفحة 20 عملية.</p></div><span>{timeline.length} عملية</span></header><div className="dkCleanTimeline">{visibleTimeline.length ? visibleTimeline.map((entry) => <article key={entry.id} className={`result-${entry.result}`}><time dateTime={entry.time}>{new Date(entry.time).toLocaleString("ar")}</time><div><strong>{entry.operation}</strong><span>{entry.source} · {entry.actor}</span><small>{entry.detail ?? `${entry.affectedFiles.length} ملف متأثر`}</small></div><b>{entry.healthScoreBefore}% <span>←</span> {entry.healthScoreAfter}%</b></article>) : <p>لا توجد عمليات زمنية بعد. سيضيف الفحص أو الإصلاح أو الاستعادة أول إدخال تلقائيًا.</p>}</div>{timelinePages > 1 && <div className="dkCleanPagination"><button type="button" onClick={() => setTimelinePage((page) => Math.max(0, page - 1))} disabled={timelinePage === 0}>الأحدث</button><span>{timelinePage + 1} / {timelinePages}</span><button type="button" onClick={() => setTimelinePage((page) => Math.min(timelinePages - 1, page + 1))} disabled={timelinePage >= timelinePages - 1}>الأقدم</button></div>}</section>
        </DekoAccordionSection>

        <DekoAccordionSection id="recovery-points" title="نقاط الاستعادة" subtitle="Manifests الحالية وحالات الحجر والاستعادة" icon={<ArchiveRestore />} badge={`${data?.manifests.length ?? 0} نقطة`} isOpen={accordionOpen["recovery-points"]} onToggle={toggleAccordion}>
          <div className="dkCleanManifestList">{data?.manifests.length ? data.manifests.map((manifest) => <span key={manifest.id}>{manifest.id} · {manifest.entries} ملف · {manifest.status}</span>) : <p>لا توجد نقاط استعادة مسجلة.</p>}</div>
        </DekoAccordionSection>
      </div>}

      {tab === "security" && <section id="dekoclean-radar-section" className="dkCleanPanel"><header><div><h2>الأمن والحماية</h2><p>موصلات تقارير محلية منظمة فقط؛ لا رفع سحابي ولا تنفيذ للملفات.</p></div><button type="button" onClick={() => void securityScan()} disabled={Boolean(busy)}>فحص تقارير الحماية</button></header>{connectors.map((connector) => <article className="dkCleanConnector" key={connector.id}><ShieldCheck /><div><strong>{connector.label}</strong><p>{connector.available ? "متصل" : "غير متاح"}</p><small>{connector.signaturesUpdatedAt ?? "لا توجد بيانات توقيع"}</small></div></article>)}{!connectors.some((connector) => connector.available) && <p>لم يتم العثور على أداة حماية متصلة. ما زال فحص سلامة المشروع متاحًا.</p>}<h3>التنبيهات الأمنية النشطة ({data?.securityFindings.length ?? 0})</h3><div className="dkSecurityFindingList">{data?.securityFindings.length ? data.securityFindings.map((finding) => <article className="dkCleanSecurityFinding" data-finding-id={finding.findingId ?? finding.id} key={finding.findingId ?? finding.id}><header><strong>{finding.title}</strong><span className={`severity-${finding.severity}`}>{finding.severity}</span></header><dl><div><dt>المسار</dt><dd dir="ltr">{finding.affectedFiles[0] ?? "غير متاح"}</dd></div><div><dt>المصدر</dt><dd>{finding.detector ?? finding.detectedBy ?? "غير متاح"}</dd></div><div><dt>Finding ID</dt><dd dir="ltr">{finding.findingId ?? finding.id}</dd></div><div><dt>Fingerprint</dt><dd dir="ltr">{finding.fingerprint ?? "غير متاح"}</dd></div><div><dt>أول ظهور</dt><dd>{finding.firstSeenAt ?? finding.detectedAt ?? "غير متاح"}</dd></div><div><dt>آخر ظهور</dt><dd>{finding.lastSeenAt ?? "غير متاح"}</dd></div><div><dt>التكرار</dt><dd>{finding.occurrenceCount ?? 1}</dd></div><div><dt>الفحص</dt><dd dir="ltr">{finding.scanIds?.at(-1) ?? "غير متاح"}</dd></div><div><dt>الدليل</dt><dd>{finding.evidence.join("، ") || "غير متاح"}</dd></div><div><dt>الإجراء</dt><dd>{finding.recommendedAction ?? "غير متاح"}</dd></div><div><dt>الحالة</dt><dd>{finding.lifecycle?.status ?? finding.status}</dd></div></dl><button type="button" onClick={() => openFindingPlan(finding.id, finding.recommendedAction)}>عرض التفاصيل</button></article>) : <p>لا توجد نتائج في هذا القسم حاليًا.</p>}</div></section>}

      {tab === "memory" && <section className="dkCleanPanel"><h2>ذاكرة المعالجات</h2><p>بيانات دفاعية مؤكدة فقط؛ لا محتوى تنفيذي ولا أسرار.</p><div className="dkCleanMemoryGrid">{data?.securityMemory.length ? data.securityMemory.map((entry) => <article key={entry.id}><strong>{entry.threatName ?? entry.confirmedTreatment}</strong><span>{entry.category ?? "finding"}</span><code>{entry.fileHashSha256 ? `${entry.fileHashSha256.slice(0, 12)}…` : "no hash"}</code><small>{entry.result} · {entry.confirmedAt ?? entry.createdAt}</small><div className="dkCleanActions"><button type="button" onClick={() => setMessage(entry.treatmentRecipe.description)}>عرض الوصفة</button><button type="button" disabled={!entry.enabled || Boolean(busy)} onClick={() => void disableMemory(entry.id)}>تعطيل الوصفة</button><button type="button" onClick={() => { setSelectedId(entry.detectionId ?? ""); setTab("overview"); openAccordion("findings"); }}>طلب مراجعة جديدة</button></div></article>) : <p>لا توجد وصفات مؤكدة بعد.</p>}</div></section>}

    </main>
  );
}

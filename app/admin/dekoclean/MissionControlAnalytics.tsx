"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Activity, AlertTriangle, BarChart3, Brain, CheckCircle2, Clock3, Gauge, History, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

import type { DekoDomainKey, DekoIndexHistoryPoint, DekoScoreStatus, MissionControlAnalytics } from "../../../lib/dekoclean/missionControlTypes";

type RangeKey = "today" | "7d" | "30d" | "90d" | "all";
const statusLabels: Record<DekoScoreStatus, string> = { excellent: "ممتاز", "very-good": "جيد جدًا", good: "جيد", "needs-attention": "يحتاج تحسينًا", warning: "تحذير", critical: "حرج", unavailable: "غير متاح" };
const domainLabels: Record<DekoDomainKey, string> = { health: "صحة المشروع", performance: "الأداء", security: "الأمان", ai: "استقرار الذكاء الاصطناعي", memory: "سلامة الذاكرة المعرفية" };
const domainEnglish: Record<DekoDomainKey, string> = { health: "Project Health", performance: "Performance", security: "Security", ai: "AI Stability", memory: "Memory Integrity" };
const domainIcons = { health: Gauge, performance: Activity, security: ShieldCheck, ai: Brain, memory: Sparkles };
const domainTones: Record<DekoDomainKey, "blue" | "green" | "orange" | "rose" | "purple" | "cyan" | "beige"> = { health: "green", performance: "cyan", security: "rose", ai: "purple", memory: "blue" };
const rangeDays: Record<Exclude<RangeKey, "all">, number> = { today: 1, "7d": 7, "30d": 30, "90d": 90 };
const severityLabels = { critical: "حرج", high: "مرتفع", medium: "متوسط", low: "منخفض", info: "معلومات" } as const;
const actionLabels: Record<string, string> = { validate: "Validate — تحقق", restore: "Restore — استعادة", recreate: "Recreate — إعادة إنشاء", repair: "Repair — إصلاح" };
const displayAction = (action: string): string => actionLabels[action] ?? actionLabels.validate;
const timestampFormatter = new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
const formatTimestamp = (value: string) => timestampFormatter.format(new Date(value));
const domainKeys: DekoDomainKey[] = ["health", "performance", "security", "ai", "memory"];
const emptyMissionControl: MissionControlAnalytics = {
  snapshot: {
    score: null,
    isProvisional: true,
    coveragePercent: 0,
    missingDomains: domainKeys,
    status: "unavailable",
    trend: "unknown",
    domains: domainKeys.map((key) => ({ key, score: null, status: "unavailable", trend: "unknown", previousScore: null, contributingFactors: [] })),
    weights: { health: 30, performance: 20, security: 20, ai: 15, memory: 15 },
    calculatedAt: "1970-01-01T00:00:00.000Z",
    dataFreshness: "unavailable",
  },
  history: [],
  findingsBySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
  maintenanceOutcomes: { successful: 0, failed: 0, rolledBack: 0, awaitingConfirmation: 0 },
  insight: [],
  recommendations: [],
};

function filterHistory(history: DekoIndexHistoryPoint[], range: RangeKey) {
  if (range === "all") return history;
  const cutoff = Date.now() - rangeDays[range] * 86_400_000;
  return history.filter((point) => new Date(point.timestamp).getTime() >= cutoff);
}

function EmptyChart({ title = "لا توجد بيانات تاريخية كافية", children }: { title?: string; children?: ReactNode }) {
  return <div className="dkMissionEmpty"><BarChart3 aria-hidden="true" /><strong>{title}</strong><p>{children ?? "سيظهر الرسم بعد تسجيل أكثر من قياس أو عملية صيانة."}</p></div>;
}

function LineChart({ points, keys, title }: { points: DekoIndexHistoryPoint[]; keys: Array<"dekoIndex" | "health" | "performance">; title: string }) {
  const valid = points.filter((point) => keys.some((key) => point[key] !== null));
  if (valid.length < 2) return <EmptyChart />;
  const colors = ["#315eea", "#16834f", "#d97706"];
  return <div className="dkMissionChartBody"><svg className="dkMissionLine" viewBox="0 0 600 180" role="img" aria-label={title} preserveAspectRatio="none">
    {[25, 50, 75, 100].map((value) => <line key={value} x1="0" y1={180 - value * 1.6} x2="600" y2={180 - value * 1.6} stroke="rgba(20,40,80,.12)" />)}
    {keys.map((key, keyIndex) => { const coordinates = valid.flatMap((point, index) => point[key] === null ? [] : [`${index * (600 / (valid.length - 1))},${170 - (point[key] ?? 0) * 1.55}`]); return coordinates.length > 1 ? <polyline key={key} points={coordinates.join(" ")} fill="none" stroke={colors[keyIndex]} strokeWidth="4"><title>{key}: {valid.map((point) => point[key] ?? "غير متاح").join("، ")}</title></polyline> : null; })}
  </svg><details className="dkMissionTechnical"><summary>البيانات النصية للرسم</summary><div className="dkMissionTableScroll"><table className="dkMissionTable"><thead><tr><th>الوقت</th>{keys.map((key) => <th key={key}>{key === "dekoIndex" ? "Deko Index" : domainLabels[key]}</th>)}</tr></thead><tbody>{valid.slice(-20).map((point) => <tr key={point.operationId}><td>{formatTimestamp(point.timestamp)}</td>{keys.map((key) => <td key={key}>{point[key] === null ? "غير متاح" : `${Math.round(point[key] ?? 0)}%`}</td>)}</tr>)}</tbody></table></div></details></div>;
}

type MissionControlRenderState = "loading" | "loaded" | "error" | "mission-error";

export default function MissionControlAnalyticsPanel({ data, state, error, onRetry, onInspectFinding, onNavigate, quickActions }: { data: MissionControlAnalytics | null; state: MissionControlRenderState; error?: string; onRetry?: () => void; onInspectFinding: (id: string, action?: string) => void; onNavigate: (target: "overview" | "security" | "memory" | "timeline") => void; quickActions?: ReactNode }) {
  const [range, setRange] = useState<RangeKey>("7d");
  const resolvedData = data ?? emptyMissionControl;
  const isLoading = state === "loading";
  const hasError = state === "error" || state === "mission-error";
  const history = useMemo(() => filterHistory(resolvedData.history, range), [resolvedData.history, range]);
  const current = resolvedData.snapshot;
  const previous = history.length > 1 ? history.at(-2)?.dekoIndex ?? null : null;
  const summary = current.score === null ? "لا توجد تغطية كافية لحساب المؤشر." : previous === null ? `القيمة الحالية ${current.score}% ولا توجد فترة سابقة كافية للمقارنة.` : `${current.score >= previous ? "تحسن" : "انخفض"} Deko Index من ${previous}% إلى ${current.score}% في النطاق المحدد.`;

  return <section className="dkMission" aria-labelledby="dk-mission-title" aria-busy={isLoading}>
    <div className="dkMissionState" role={hasError ? "alert" : "status"} hidden={!isLoading && !hasError}><AlertTriangle aria-hidden="true" /><div><strong>{hasError ? "تعذر تحميل بيانات Mission Control" : "جارٍ تحميل بيانات Mission Control"}</strong><p>{hasError ? error : "تبقى بنية البطاقات ثابتة أثناء تحميل القيم."}</p><button type="button" className="dkMissionButtonPrimary" onClick={onRetry} hidden={!hasError || !onRetry}>إعادة المحاولة</button></div></div>
    <header className="dkMissionHeader"><div><span className="dkMissionEyebrow" dir="ltr">Mission Control Analytics</span><h2 id="dk-mission-title">مركز قيادة صحة المنصة</h2><p>درجات مطبّعة من الأدلة التشغيلية الحالية فقط، مع إظهار النطاقات غير المقاسة بوضوح.</p></div><small>آخر حساب<br /><time dateTime={current.calculatedAt}>{isLoading ? "جارٍ التحميل..." : formatTimestamp(current.calculatedAt)}</time></small></header>

    <article className={`dkMissionIndex dkUnifiedKpiCard status-${current.status}`} data-kpi-tone="blue">
      <div className="dkMissionGauge" role="progressbar" aria-label="Deko Index" aria-valuemin={0} aria-valuemax={100} aria-valuenow={current.score ?? undefined} style={{ "--score": current.score ?? 0 } as CSSProperties}><span>{current.score === null ? "—" : `${current.score}%`}</span></div>
      <div className="dkMissionIndexContent"><span className="dkMissionEyebrow" dir="ltr">Deko Index</span><div className="dkMissionIndexTitle"><h3>{current.isProvisional ? "مؤشر مؤقت" : "مؤشر موثّق"}</h3><span className="dkMissionStatusBadge">{statusLabels[current.status]}</span></div><p>حالة المنصة: <strong>{statusLabels[current.status]}</strong></p><div className="dkMissionCoverage"><span>تغطية البيانات</span><strong>{current.coveragePercent}%</strong><i><b style={{ width: `${current.coveragePercent}%` }} /></i></div><div className="dkMissionIndexMeta"><span>الاتجاه: {current.trend === "improving" ? "يتحسن ↑" : current.trend === "declining" ? "يتراجع ↓" : current.trend === "stable" ? "مستقر →" : "غير معروف"}</span><span>حداثة البيانات: {current.dataFreshness}</span></div>{current.missingDomains.length > 0 && <p className="dkMissionUnavailable">القياسات غير المتاحة: {current.missingDomains.map((key) => domainLabels[key]).join("، ")}</p>}<button className="dkMissionButtonPrimary" type="button" onClick={() => document.getElementById("dk-analytics")?.scrollIntoView({ behavior: "smooth" })}>عرض تفاصيل المؤشر</button></div>
    </article>

    <section className="dkMissionDomains dkDomainGrid" aria-label="مجالات Deko Index">{current.domains.map((domain) => { const Icon = domainIcons[domain.key]; const criticalFactors = domain.contributingFactors.filter((factor) => factor.impact <= -10).length; const target = domain.key === "security" ? "security" : domain.key === "memory" ? "memory" : "overview"; return <article key={domain.key} className={`dkMissionDomainCard dkUnifiedKpiCard status-${domain.status}`} data-kpi-tone={domainTones[domain.key]}><header><Icon aria-hidden="true" /><div><h3>{domainLabels[domain.key]}</h3><span dir="ltr">{domainEnglish[domain.key]}</span></div></header><strong className="dkMissionDomainScore" dir={domain.score === null ? "rtl" : "ltr"}>{domain.score === null ? "غير متاح" : `${Math.round(domain.score)}%`}</strong><div className={`dkMissionProgress ${domain.score === null ? "is-unavailable" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={domain.score ?? undefined} aria-label={domain.score === null ? "القياس غير متاح" : `الدرجة ${domain.score}%`}><i style={{ width: domain.score === null ? "100%" : `${domain.score}%` }} /></div><span className="dkMissionStatusBadge">{statusLabels[domain.status]}</span>{domain.key === "performance" && domain.score === null ? <p className="dkMissionUnavailable">لا تتوفر قياسات أداء فعلية حتى الآن.</p> : domain.unavailableReason && <p className="dkMissionUnavailable">{domain.unavailableReason}</p>}<dl><div><dt>الاتجاه</dt><dd>{domain.trend === "improving" ? "يتحسن ↑" : domain.trend === "declining" ? "يتراجع ↓" : domain.trend === "stable" ? "مستقر →" : "غير معروف"}</dd></div><div><dt>السابق</dt><dd>{domain.previousScore == null ? "غير متاح" : `${Math.round(domain.previousScore)}%`}</dd></div><div><dt>عوامل حرجة</dt><dd>{criticalFactors}</dd></div><div><dt>آخر قياس</dt><dd>{domain.measuredAt ? formatTimestamp(domain.measuredAt) : "لم يُقَس"}</dd></div></dl>{domain.key === "memory" && <small>يشير إلى مخازن معرفة المنصة، وليس ذاكرة الهاتف أو RAM.</small>}<button className="dkMissionButtonSecondary" type="button" onClick={() => onNavigate(target)}>عرض التفاصيل</button></article>; })}</section>

    {quickActions}

    <section id="dk-analytics" className="dkMissionAnalytics"><header><div><h3>الإحصاءات البيانية</h3><p>{summary}</p></div><div className="dkMissionFilters" aria-label="نطاق الرسوم">{([['today','اليوم'],['7d','7 أيام'],['30d','30 يومًا'],['90d','90 يومًا'],['all','الكل']] as const).map(([key, label]) => <button type="button" key={key} className={range === key ? "active" : ""} onClick={() => setRange(key)}>{label}</button>)}</div></header>
      <div className="dkMissionCharts dkAnalyticsGrid">
        <article><header><Gauge aria-hidden="true" /><div><h4>اتجاه Deko Index</h4><p>القيمة الحالية مقابل الفترة السابقة من snapshots الفعلية.</p></div></header><LineChart points={history} keys={["dekoIndex"]} title="اتجاه Deko Index" /></article>
        <article><header><BarChart3 aria-hidden="true" /><div><h4>مقارنة المجالات الخمسة</h4><p>القيمة غير المتاحة لا تُعامل كصفر.</p></div></header><div className="dkMissionDomainBars">{current.domains.map((domain) => <div key={domain.key} className={domain.score === null ? "is-unavailable" : ""}><div><span>{domainLabels[domain.key]}</span><small>{statusLabels[domain.status]}</small></div><i><b style={{ width: domain.score === null ? "100%" : `${domain.score}%` }} /></i><strong>{domain.score === null ? "غير متاح" : `${Math.round(domain.score)}%`}</strong></div>)}</div><details className="dkMissionTechnical"><summary>جدول مقارنة المجالات</summary><table className="dkMissionTable"><tbody>{current.domains.map((domain) => <tr key={domain.key}><th>{domainLabels[domain.key]}</th><td>{domain.score === null ? "غير متاح" : `${Math.round(domain.score)}%`}</td><td>{statusLabels[domain.status]}</td></tr>)}</tbody></table></details></article>
        <article><header><Activity aria-hidden="true" /><div><h4>صحة المشروع مقابل الأداء</h4><p>لا تُرسم قيمة الأداء قبل توفر قياس فعلي.</p></div></header><LineChart points={history} keys={["health", "performance"]} title="صحة المشروع مقابل الأداء" /></article>
        <article><header><AlertTriangle aria-hidden="true" /><div><h4>النتائج حسب الخطورة</h4><p>كل رقم داخل بطاقة مستقلة لتسهيل القراءة.</p></div></header><div className="dkMissionCounts dkMissionSeverityCounts">{(["critical", "high", "medium", "low", "info"] as const).map((key) => <span key={key} className={`severity-${key} dkUnifiedKpiCard dkUnifiedKpiCard--micro`} data-kpi-tone={key === "critical" ? "rose" : key === "high" ? "orange" : key === "medium" ? "beige" : key === "low" ? "blue" : "cyan"}><b>{resolvedData.findingsBySeverity[key]}</b><small>{severityLabels[key]}</small></span>)}</div></article>
        <article><header><History aria-hidden="true" /><div><h4>نتائج الصيانة</h4><p>ملخص من Maintenance Timeline.</p></div></header><div className="dkMissionCounts dkMissionOutcomeCounts"><span className="is-success dkUnifiedKpiCard dkUnifiedKpiCard--micro" data-kpi-tone="green"><CheckCircle2 /><b>{resolvedData.maintenanceOutcomes.successful}</b><small>ناجحة</small></span><span className="is-failed dkUnifiedKpiCard dkUnifiedKpiCard--micro" data-kpi-tone="rose"><AlertTriangle /><b>{resolvedData.maintenanceOutcomes.failed}</b><small>فاشلة</small></span><span className="is-rollback dkUnifiedKpiCard dkUnifiedKpiCard--micro" data-kpi-tone="purple"><RotateCcw /><b>{resolvedData.maintenanceOutcomes.rolledBack}</b><small>Rollback</small></span><span className="is-pending dkUnifiedKpiCard dkUnifiedKpiCard--micro" data-kpi-tone="orange"><Clock3 /><b>{resolvedData.maintenanceOutcomes.awaitingConfirmation}</b><small>بانتظار التأكيد</small></span></div><button className="dkMissionButtonSecondary" type="button" onClick={() => onNavigate("timeline")}>فتح الخط الزمني</button></article>
        <article><header><Activity aria-hidden="true" /><div><h4>مقاييس الأداء</h4><p>Page Load وBundle وBuild Duration.</p></div></header><EmptyChart title="مقاييس الأداء غير متاحة">لم يُعثر على Performance Monitor يقدم قياسات فعلية حتى الآن.</EmptyChart></article>
      </div>
    </section>

    <section className="dkMissionInsights"><article><header><Brain aria-hidden="true" /><h3>رؤية DekoBrain</h3></header><div className="dkMissionInsightRows">{resolvedData.insight.slice(0, 4).map((item) => <div key={item}><Sparkles aria-hidden="true" /><p>{item}<small>المصدر: بيانات Mission Control المقاسة</small></p></div>)}{resolvedData.insight.length === 0 && <div><Sparkles aria-hidden="true" /><p>{isLoading ? "جارٍ تحميل الرؤية..." : "لا توجد رؤية متاحة حاليًا."}<small>المصدر: بيانات Mission Control المقاسة</small></p></div>}</div></article><article><header><Gauge aria-hidden="true" /><h3>أهم الإجراءات المقترحة</h3></header><div className="dkMissionRecommendations">{resolvedData.recommendations.length ? resolvedData.recommendations.slice(0, 5).map((item) => <article key={item.findingId}><header><h4>{item.problem}</h4><span className={`dkMissionRisk severity-${item.risk}`}>{severityLabels[item.risk]}</span></header><dl><div><dt>المجال</dt><dd>{domainLabels[item.domain]}</dd></div><div><dt>الإجراء</dt><dd dir="ltr">{displayAction(item.suggestedAction)}</dd></div><div><dt>الأثر الحالي</dt><dd>{item.currentImpact}</dd></div><div><dt>الثقة</dt><dd>مبنية على الأدلة المسجلة</dd></div><div><dt>التحسن</dt><dd>{item.estimatedImprovement ?? "غير قابل للتقدير"}</dd></div><div><dt>مخاطر التنفيذ</dt><dd>{severityLabels[item.risk]}</dd></div></dl><button className="dkMissionButtonSecondary" type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onInspectFinding(item.findingId, item.suggestedAction); }}>عرض الخطة</button></article>) : <EmptyChart title={isLoading ? "جارٍ تحميل التوصيات" : "لا توجد توصيات مفتوحة"}>{isLoading ? "ستظهر التوصيات هنا بعد وصول البيانات." : "لا توجد نتائج تحتاج خطة إصلاح في الحالة الحالية."}</EmptyChart>}</div></article></section>
  </section>;
}

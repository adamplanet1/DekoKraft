import fs from "node:fs";
import path from "node:path";

import { createLocalStructuredReportConnector } from "../dekoradar/securityAlertAdapter.ts";
import { readFindings } from "./findingStore.ts";
import { calculateHealthScore, readHealthScoreHistory } from "./healthScore.ts";
import { readSecurityMemory } from "./securityMemory.ts";
import { readMaintenanceTimeline } from "./timeline.ts";
import type { DekoCleanFinding, DekoCleanSeverity } from "./types.ts";
import { calculateSecurityScore, selectSecurityFindings } from "./findingSelectors.ts";
import type {
  DekoDomainKey, DekoDomainScore, DekoIndexCalculation, DekoIndexHistoryPoint, DekoIndexSnapshot,
  DekoIndexTrigger, DekoScoreStatus, MissionControlAnalytics, MissionControlRecommendation,
} from "./missionControlTypes.ts";

export const DEKO_INDEX_WEIGHTS: Record<DekoDomainKey, number> = { health: 30, performance: 25, security: 20, ai: 15, memory: 10 };

export function clampDomainScore(value: number): number { return Math.min(100, Math.max(0, value)); }
export function scoreStatus(score: number | null): DekoScoreStatus {
  if (score === null) return "unavailable";
  if (score >= 95) return "excellent";
  if (score >= 85) return "very-good";
  if (score >= 70) return "good";
  if (score >= 50) return "needs-attention";
  if (score >= 25) return "warning";
  return "critical";
}

export function validateDekoIndexWeights(weights: Record<DekoDomainKey, number>): void {
  const values = Object.values(weights);
  if (values.some((weight) => !Number.isFinite(weight) || weight < 0) || values.reduce((sum, value) => sum + value, 0) !== 100) {
    throw new Error("Deko Index weights must be finite, non-negative, and total 100.");
  }
}

export function calculateDekoIndex(domains: DekoDomainScore[], weights = DEKO_INDEX_WEIGHTS): DekoIndexCalculation {
  validateDekoIndexWeights(weights);
  const byKey = new Map(domains.map((domain) => [domain.key, domain]));
  const missingDomains = (Object.keys(weights) as DekoDomainKey[]).filter((key) => byKey.get(key)?.score === null || byKey.get(key)?.score === undefined);
  const available = (Object.keys(weights) as DekoDomainKey[]).filter((key) => !missingDomains.includes(key));
  const coveragePercent = available.reduce((sum, key) => sum + weights[key], 0);
  if (coveragePercent === 0) return { score: null, isProvisional: true, coveragePercent: 0, missingDomains };
  const weighted = available.reduce((sum, key) => sum + (byKey.get(key)?.score ?? 0) * weights[key], 0);
  return { score: Math.round(weighted / coveragePercent), isProvisional: missingDomains.length > 0, coveragePercent, missingDomains };
}

function historyPath(projectRoot: string): string { return path.join(projectRoot, ".dekoclean", "state", "deko-index-history.json"); }
export function readDekoIndexHistory(projectRoot = process.cwd()): DekoIndexHistoryPoint[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(historyPath(projectRoot), "utf8"));
    return Array.isArray(parsed) ? (parsed as DekoIndexHistoryPoint[]).sort((a, b) => a.timestamp.localeCompare(b.timestamp)) : [];
  } catch { return []; }
}

function recentTrend(current: number | null, previous: number | null | undefined): DekoDomainScore["trend"] {
  if (current === null || previous === null || previous === undefined) return "unknown";
  return current === previous ? "stable" : current > previous ? "improving" : "declining";
}

function adaptHealth(projectRoot: string): DekoDomainScore {
  const health = calculateHealthScore(projectRoot);
  const history = readHealthScoreHistory(projectRoot);
  const previous = history.length > 1 ? history.at(-2)?.value ?? null : null;
  return {
    key: "health", score: clampDomainScore(health.value), status: scoreStatus(health.value), trend: recentTrend(health.value, previous), previousScore: previous,
    measuredAt: health.calculatedAt, sourceUpdatedAt: health.calculatedAt,
    contributingFactors: health.factors.map((factor) => ({ id: factor.id, label: factor.label, value: factor.findingCount, impact: -factor.penalty, explanation: `${factor.findingCount} نتيجة مثبتة؛ الخصم ${factor.penalty} من وزن ${factor.weight}.` })),
  };
}

function performanceUnavailable(): DekoDomainScore {
  return { key: "performance", score: null, status: "unavailable", trend: "unknown", contributingFactors: [], unavailableReason: "لا يوجد Performance Monitor أو Performance Memory مقاس في المشروع حاليًا." };
}

async function adaptSecurity(projectRoot: string, findings: DekoCleanFinding[]): Promise<DekoDomainScore> {
  const connector = createLocalStructuredReportConnector(projectRoot);
  const connectorStatus = await connector.getStatus();
  const securityFindings = selectSecurityFindings(findings);
  const scoreExplanation = calculateSecurityScore(findings);
  const memory = readSecurityMemory(projectRoot);
  const hasTrustedEvidence = connectorStatus.available || securityFindings.length > 0 || memory.length > 0;
  const factors = [
    { id: "connector", label: "موصل الحماية", value: connectorStatus.available, impact: 0, explanation: connectorStatus.available ? "تقرير حماية محلي منظم متاح." : "لا يوجد موصل حماية محلي متصل؛ لا يُصنف ذلك وحده كفشل سلامة." },
    { id: "findings", label: "نتائج الأمان المفتوحة", value: securityFindings.length, impact: -(scoreExplanation.criticalPenalty + scoreExplanation.highPenalty + scoreExplanation.mediumPenalty), explanation: `الأساس 100؛ critical -${scoreExplanation.criticalPenalty}، high -${scoreExplanation.highPenalty}، medium -${scoreExplanation.mediumPenalty}. تغييرات info لا تخصم مباشرة.` },
    { id: "memory", label: "Security Memory موثقة", value: memory.filter((entry) => entry.enabled && entry.validationPassed).length, impact: 0, explanation: "وصفات دفاعية مؤكدة وناجحة فقط." },
  ];
  if (!hasTrustedEvidence) return { key: "security", score: null, status: "unavailable", trend: "unknown", contributingFactors: factors, unavailableReason: "الأدلة الأمنية الحالية غير كافية لحساب درجة موثقة." };
  const score = scoreExplanation.finalScore;
  const previous = readDekoIndexHistory(projectRoot).at(-1)?.security ?? null;
  return { key: "security", score, status: scoreStatus(score), trend: recentTrend(score, previous), previousScore: previous, measuredAt: new Date().toISOString(), contributingFactors: factors };
}

async function adaptAI(): Promise<DekoDomainScore> {
  let records: Awaited<ReturnType<typeof import("../ai-cost/costStore.ts")["listAICostRecords"]>>;
  let summary: Awaited<ReturnType<typeof import("../ai-cost/costStore.ts")["getAICostSummary"]>>;
  try {
    const store = await import("../ai-cost/costStore.ts");
    [records, summary] = await Promise.all([store.listAICostRecords(), store.getAICostSummary()]);
  } catch {
    return { key: "ai", score: null, status: "unavailable", trend: "unknown", contributingFactors: [], unavailableReason: "مخزن AI Cost غير متاح في سياق التشغيل الحالي." };
  }
  if (records.length === 0) return { key: "ai", score: null, status: "unavailable", trend: "unknown", contributingFactors: [], unavailableReason: "لا توجد عمليات AI زمنية كافية لقياس الاستقرار التشغيلي." };
  const completed = summary.successfulOperations + summary.failedOperations;
  const failureRate = completed ? summary.failedOperations / completed : 0;
  const pending = records.filter((record) => record.status === "pending").length;
  const score = clampDomainScore(100 - failureRate * 65 - Math.min(20, pending * 2) - (summary.apiStatus === "memory-fallback" ? 15 : 0));
  const last = records[0];
  return { key: "ai", score, status: scoreStatus(score), trend: "unknown", measuredAt: last?.createdAt, sourceUpdatedAt: last?.createdAt, contributingFactors: [
    { id: "failure-rate", label: "نسبة فشل العمليات", value: Number((failureRate * 100).toFixed(1)), impact: -(failureRate * 65), explanation: "مقياس تشغيلي من سجلات AI Cost، وليس تقييمًا ذاتيًا لجودة الناتج." },
    { id: "pending", label: "العمليات المعلقة", value: pending, impact: -Math.min(20, pending * 2), explanation: "عمليات لم تصل بعد إلى نجاح أو فشل نهائي." },
    { id: "cost-store", label: "سلامة سجل AI Cost", value: summary.apiStatus, impact: summary.apiStatus === "memory-fallback" ? -15 : 0, explanation: "يعكس قابلية قراءة وكتابة سجل التكلفة الحالي." },
  ] };
}

function readableJson(target: string): "available" | "missing" | "invalid" {
  if (!fs.existsSync(target)) return "missing";
  try { JSON.parse(fs.readFileSync(target, "utf8")); return "available"; } catch { return "invalid"; }
}

function adaptMemory(projectRoot: string, findings: DekoCleanFinding[]): DekoDomainScore {
  const sources = [
    { id: "security-memory", label: "Security Memory", state: readableJson(path.join(projectRoot, ".dekoclean", "state", "security-memory.json")) },
    { id: "echo-memory", label: "Echo Learning", state: readableJson(path.join(projectRoot, "data", "echo-guide-accepted-memory.json")) },
    { id: "product-source", label: "Product DNA source", state: fs.existsSync(path.join(projectRoot, "app", "data", "products.xlsx")) ? "available" as const : "missing" as const },
  ];
  const available = sources.filter((source) => source.state === "available").length;
  const invalid = sources.filter((source) => source.state === "invalid").length;
  const ownership = findings.filter((finding) => finding.type === "ownership-inconsistency" && !["resolved", "ignored"].includes(finding.status)).length;
  if (available === 0) return { key: "memory", score: null, status: "unavailable", trend: "unknown", contributingFactors: [], unavailableReason: "لا توجد مخازن معرفة قابلة للقياس من الخادم حاليًا. هذا لا يشير إلى ذاكرة الجهاز." };
  const score = clampDomainScore(100 - invalid * 30 - ownership * 12 - (3 - available) * 8);
  return { key: "memory", score, status: scoreStatus(score), trend: "unknown", measuredAt: new Date().toISOString(), contributingFactors: [
    ...sources.map((source) => ({ id: source.id, label: source.label, value: source.state, impact: source.state === "invalid" ? -30 : source.state === "missing" ? -8 : 0, explanation: "سلامة بنية مخزن معرفة المنصة وقابليته للاستعادة؛ ليست ذاكرة RAM للهاتف أو الجهاز." })),
    { id: "ownership", label: "اتساق مراجع Product DNA", value: ownership, impact: -(ownership * 12), explanation: "عدم اتساق الملكية أو المراجع المؤكد بواسطة DekoRadar." },
  ] };
}

function freshness(domains: DekoDomainScore[]): DekoIndexSnapshot["dataFreshness"] {
  const available = domains.filter((domain) => domain.score !== null);
  if (!available.length) return "unavailable";
  if (available.length !== domains.length) return "partially-stale";
  const stale = available.some((domain) => domain.measuredAt && Date.now() - new Date(domain.measuredAt).getTime() > 7 * 86_400_000);
  return stale ? "stale" : "fresh";
}

export async function getDekoIndexSnapshot(projectRoot = process.cwd()): Promise<DekoIndexSnapshot> {
  const findings = readFindings(projectRoot);
  const domains = [adaptHealth(projectRoot), performanceUnavailable(), await adaptSecurity(projectRoot, findings), await adaptAI(), adaptMemory(projectRoot, findings)];
  const calculation = calculateDekoIndex(domains);
  const history = readDekoIndexHistory(projectRoot);
  const previous = history.at(-1)?.dekoIndex;
  return { ...calculation, status: scoreStatus(calculation.score), trend: recentTrend(calculation.score, previous), domains, weights: DEKO_INDEX_WEIGHTS, calculatedAt: new Date().toISOString(), dataFreshness: freshness(domains) };
}

export async function recordDekoIndexSnapshot(input: { operationId: string; trigger: DekoIndexTrigger }, projectRoot = process.cwd()): Promise<DekoIndexHistoryPoint> {
  const history = readDekoIndexHistory(projectRoot);
  const duplicate = history.find((point) => point.operationId === input.operationId);
  if (duplicate) return duplicate;
  const snapshot = await getDekoIndexSnapshot(projectRoot);
  const get = (key: DekoDomainKey) => snapshot.domains.find((domain) => domain.key === key)?.score ?? null;
  const point: DekoIndexHistoryPoint = { operationId: input.operationId, timestamp: snapshot.calculatedAt, dekoIndex: snapshot.score, health: get("health"), performance: get("performance"), security: get("security"), ai: get("ai"), memory: get("memory"), trigger: input.trigger };
  history.push(point);
  const target = historyPath(projectRoot); fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(history.slice(-1500), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return point;
}

function domainForFinding(finding: DekoCleanFinding): DekoDomainKey {
  if (["security-alert", "suspicious-file", "integrity-mismatch"].includes(finding.type)) return "security";
  if (finding.type === "ownership-inconsistency" && finding.evidence.some((entry) => /dna|memory/i.test(entry))) return "memory";
  return "health";
}

function recommendations(findings: DekoCleanFinding[]): MissionControlRecommendation[] {
  const rank: Record<DekoCleanSeverity, number> = { info: 1, low: 2, medium: 4, high: 8, critical: 12 };
  const confidence = (finding: DekoCleanFinding) => Math.min(0.95, 0.45 + finding.evidence.length * 0.1 + (finding.fileHashSha256 ? 0.2 : 0));
  const executionRisk = (finding: DekoCleanFinding) => ["repair", "restore", "recreate", "quarantine"].includes(finding.recommendedActions[0] ?? "") ? 2 : 1;
  const priority = (finding: DekoCleanFinding) => rank[finding.severity] * confidence(finding) * Math.max(1, finding.affectedPaths.length) / executionRisk(finding);
  return findings.filter((finding) => !["resolved", "ignored"].includes(finding.status)).sort((a, b) => priority(b) - priority(a)).slice(0, 5).map((finding) => ({
    findingId: finding.id, problem: finding.title, domain: domainForFinding(finding), currentImpact: rank[finding.severity], suggestedAction: finding.recommendedActions[0] ?? "validate",
    estimatedImprovement: finding.severity === "info" ? null : `تقدير: ${Math.max(1, Math.floor(rank[finding.severity] / 4))}–${Math.max(2, Math.ceil(rank[finding.severity] / 2))} نقاط`, risk: finding.severity,
  }));
}

export async function getMissionControlAnalytics(projectRoot = process.cwd()): Promise<MissionControlAnalytics> {
  const [snapshot, history] = await Promise.all([getDekoIndexSnapshot(projectRoot), Promise.resolve(readDekoIndexHistory(projectRoot))]);
  const findings = readFindings(projectRoot).filter((finding) => !["resolved", "ignored"].includes(finding.status));
  const timeline = readMaintenanceTimeline(projectRoot);
  const severity = { info: 0, low: 0, medium: 0, high: 0, critical: 0 } satisfies Record<DekoCleanSeverity, number>;
  findings.forEach((finding) => { severity[finding.severity] += 1; });
  const missing = snapshot.missingDomains.map((key) => ({ performance: "الأداء", security: "الأمان", ai: "استقرار AI", memory: "سلامة الذاكرة", health: "صحة المشروع" })[key]);
  const availableDomains = snapshot.domains.filter((domain) => domain.score !== null).sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const insight = [
    snapshot.isProvisional ? `المؤشر مؤقت لأن البيانات غير متاحة في: ${missing.join("، ")}.` : "جميع مجالات Deko Index مقاسة حاليًا.",
    availableDomains[0] ? `أكثر مجال مقاس يؤثر حاليًا هو ${availableDomains[0].key} بدرجة ${Math.round(availableDomains[0].score ?? 0)}%.` : "لا توجد قياسات كافية لتحديد المجال الأكثر تأثيرًا.",
    findings.length ? `توجد ${findings.length} نتيجة مفتوحة مبنية على الفحص الحالي.` : "لا توجد نتائج مفتوحة في آخر حالة محفوظة.",
  ];
  return { snapshot, history: history.slice(-500), findingsBySeverity: severity, maintenanceOutcomes: {
    successful: timeline.filter((entry) => entry.result === "successful").length,
    failed: timeline.filter((entry) => entry.result === "failed").length,
    rolledBack: timeline.filter((entry) => entry.operation === "rollback" && entry.result === "successful").length,
    awaitingConfirmation: findings.filter((finding) => finding.status === "new" || finding.status === "reviewing").length,
  }, insight, recommendations: recommendations(findings) };
}

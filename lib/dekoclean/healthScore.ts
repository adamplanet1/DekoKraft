import fs from "node:fs";
import path from "node:path";

import { readFindings } from "./findingStore.ts";
import { listDekoCleanManifests } from "./summary.ts";
import type {
  DekoCleanFinding, HealthScore, HealthScoreFactor, HealthScoreHistoryEntry, HealthScoreLabel,
} from "./types.ts";

type FactorDefinition = {
  id: string;
  label: string;
  weight: number;
  matches: (finding: DekoCleanFinding) => boolean;
};

const FACTORS: FactorDefinition[] = [
  { id: "build", label: "أخطاء Build", weight: 14, matches: (f) => f.type === "build-error" },
  { id: "lint", label: "أخطاء Lint", weight: 9, matches: (f) => f.type === "lint-error" },
  { id: "radar", label: "تنبيهات Radar", weight: 8, matches: (f) => f.detectedBy === "dekoradar" && !["broken-asset-reference", "broken-import", "broken-route", "ownership-inconsistency"].includes(f.type) },
  { id: "assets", label: "الأصول المفقودة", weight: 8, matches: (f) => f.type === "broken-asset-reference" || f.type === "missing-file" },
  { id: "imports", label: "الاستيرادات والمسارات", weight: 10, matches: (f) => f.type === "broken-import" || f.type === "broken-route" },
  { id: "duplicates", label: "الملفات المكررة", weight: 4, matches: (f) => f.type === "duplicate-file" },
  { id: "integrity", label: "سلامة الملفات المحمية", weight: 8, matches: (f) => f.type === "integrity-mismatch" || f.type === "unexpected-file-change" },
  { id: "product-dna", label: "اتساق Product DNA", weight: 5, matches: (f) => f.type === "ownership-inconsistency" && f.evidence.some((e) => /product.?dna/i.test(e)) },
  { id: "participants", label: "اتساق سجل المشاركين", weight: 7, matches: (f) => f.type === "ownership-inconsistency" && f.evidence.some((e) => /participant|owner/i.test(e)) },
  { id: "finance", label: "اتساق السجل المالي", weight: 5, matches: (f) => f.type === "ownership-inconsistency" && f.evidence.some((e) => /financial|ledger/i.test(e)) },
  { id: "inventory", label: "اتساق المخزون", weight: 5, matches: (f) => f.type === "ownership-inconsistency" && f.evidence.some((e) => /inventory|stock/i.test(e)) },
  { id: "ai-cost", label: "اتساق تكلفة الذكاء الاصطناعي", weight: 4, matches: (f) => f.type === "ownership-inconsistency" && f.evidence.some((e) => /ai.?cost/i.test(e)) },
  { id: "security", label: "نتائج الأمان", weight: 9, matches: (f) => f.type === "security-alert" || f.type === "suspicious-file" },
];

const SEVERITY_WEIGHT: Record<DekoCleanFinding["severity"], number> = {
  info: 0.08, low: 0.18, medium: 0.42, high: 0.75, critical: 1,
};

function scoreLabel(value: number): HealthScoreLabel {
  if (value >= 95) return "excellent";
  if (value >= 85) return "good";
  if (value >= 70) return "needs-attention";
  if (value >= 50) return "warning";
  return "critical";
}

function historyPath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "health-history.json");
}

export function readHealthScoreHistory(projectRoot = process.cwd()): HealthScoreHistoryEntry[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(historyPath(projectRoot), "utf8"));
    return Array.isArray(parsed) ? parsed as HealthScoreHistoryEntry[] : [];
  } catch { return []; }
}

function factorFrom(definition: FactorDefinition, findings: DekoCleanFinding[]): HealthScoreFactor {
  const matches = findings.filter(definition.matches);
  const pressure = matches.reduce((total, finding) => total + SEVERITY_WEIGHT[finding.severity], 0);
  const penalty = Math.min(definition.weight, Number((definition.weight * Math.min(1, pressure)).toFixed(2)));
  return {
    id: definition.id, label: definition.label, weight: definition.weight, penalty,
    findingCount: matches.length, status: matches.length ? "attention" : "healthy",
  };
}

export function calculateHealthScore(projectRoot = process.cwd()): HealthScore {
  const findings = readFindings(projectRoot).filter((finding) => !["resolved", "ignored"].includes(finding.status));
  const factors = FACTORS.map((definition) => factorFrom(definition, findings));
  const unresolvedQuarantine = listDekoCleanManifests(projectRoot).filter((manifest) => manifest.status !== "restored").reduce((sum, item) => sum + item.entries, 0);
  factors.push({
    id: "quarantine", label: "عناصر الحجر غير المحسومة", weight: 4,
    penalty: Math.min(4, unresolvedQuarantine * 0.5), findingCount: unresolvedQuarantine,
    status: unresolvedQuarantine ? "attention" : "healthy",
  });
  const value = Math.max(0, Math.round(100 - factors.reduce((sum, factor) => sum + factor.penalty, 0)));
  const previous = readHealthScoreHistory(projectRoot).at(-1)?.value;
  return {
    value, label: scoreLabel(value), calculatedAt: new Date().toISOString(), factors,
    trend: previous === undefined || previous === value ? "stable" : value > previous ? "improving" : "declining",
  };
}

export function recordHealthScore(projectRoot = process.cwd()): HealthScore {
  const health = calculateHealthScore(projectRoot);
  const history = readHealthScoreHistory(projectRoot);
  const latest = history.at(-1);
  if (!latest || latest.value !== health.value) {
    const target = historyPath(projectRoot);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    history.push({ value: health.value, label: health.label, recordedAt: health.calculatedAt });
    fs.writeFileSync(target, `${JSON.stringify(history.slice(-365), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  }
  return health;
}

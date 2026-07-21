import type { DekoCleanFinding } from "./types.ts";

export type NeedsReviewCountBreakdown = {
  total: number;
  byDetector: Record<string, number>;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  duplicateRecordsExcluded: number;
  resolvedRecordsExcluded: number;
  historicalRecordsExcluded: number;
  informationalRecordsExcluded: number;
};

export type InspectionCounters = {
  totalFindings: number;
  actionableFindings: number;
  uniqueAffectedFiles: number;
  ignoredFindings: number;
  resolvedFindings: number;
};

export function canonicalStatus(finding: DekoCleanFinding): string {
  if (finding.status === "resolved") return "RESOLVED";
  if (finding.status === "ignored") return "IGNORED";
  if (finding.status === "failed") return "FAILED";
  return finding.lifecycle?.status ?? "OPEN";
}

function increment(target: Record<string, number>, key: string): void { target[key || "unknown"] = (target[key || "unknown"] ?? 0) + 1; }

export function isActionableFinding(finding: DekoCleanFinding): boolean {
  if (finding.status === "approved" || finding.status === "reviewing" || ["RESOLVED", "IGNORED"].includes(canonicalStatus(finding))) return false;
  return finding.severity !== "info" || finding.recommendedActions.some((action) => ["repair", "restore", "recreate", "quarantine"].includes(action));
}

export function selectNeedsReviewFindings(findings: DekoCleanFinding[]): { findings: DekoCleanFinding[]; breakdown: NeedsReviewCountBreakdown } {
  const resolvedRecordsExcluded = findings.filter((finding) => ["RESOLVED", "IGNORED"].includes(canonicalStatus(finding))).length;
  const lifecycleActive = findings.filter((finding) => ["OPEN", "FAILED"].includes(canonicalStatus(finding)));
  const active = lifecycleActive.filter(isActionableFinding);
  const seen = new Set<string>();
  const canonical = active.filter((finding) => { const identity = finding.fingerprint || finding.id; if (seen.has(identity)) return false; seen.add(identity); return true; });
  const breakdown: NeedsReviewCountBreakdown = { total: canonical.length, byDetector: {}, byType: {}, bySeverity: {}, duplicateRecordsExcluded: active.length - canonical.length, resolvedRecordsExcluded, historicalRecordsExcluded: 0, informationalRecordsExcluded: lifecycleActive.length - active.length };
  for (const finding of canonical) { increment(breakdown.byDetector, finding.detector ?? finding.detectedBy); increment(breakdown.byType, finding.type); increment(breakdown.bySeverity, finding.severity); }
  return { findings: canonical, breakdown };
}

export function selectInspectionFindings(findings: DekoCleanFinding[]): DekoCleanFinding[] {
  const seen = new Set<string>();
  return findings
    .filter((finding) => ["OPEN", "FAILED"].includes(canonicalStatus(finding)))
    .filter((finding) => {
      const identity = finding.fingerprint || finding.id;
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
}

export function selectVisibleInspectionFindings(findings: DekoCleanFinding[], findingIds?: string[]): DekoCleanFinding[] {
  const active = selectInspectionFindings(findings);
  if (!findingIds) return active;
  const visibleIds = new Set(findingIds);
  return active.filter((finding) => visibleIds.has(finding.id));
}

export function calculateInspectionCounters(findings: DekoCleanFinding[]): InspectionCounters {
  const active = selectInspectionFindings(findings);
  return {
    totalFindings: active.length,
    actionableFindings: active.filter(isActionableFinding).length,
    uniqueAffectedFiles: new Set(active.flatMap((finding) => finding.affectedFiles)).size,
    ignoredFindings: findings.filter((finding) => canonicalStatus(finding) === "IGNORED").length,
    resolvedFindings: findings.filter((finding) => canonicalStatus(finding) === "RESOLVED").length,
  };
}

export function selectSecurityFindings(findings: DekoCleanFinding[]): DekoCleanFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => ["OPEN", "FAILED"].includes(canonicalStatus(finding)) && ["security-alert", "suspicious-file", "integrity-mismatch"].includes(finding.type)).filter((finding) => { const key = finding.fingerprint || finding.id; if (seen.has(key)) return false; seen.add(key); return true; });
}

export type SecurityScoreExplanation = { baseScore: 100; criticalPenalty: number; highPenalty: number; mediumPenalty: number; finalScore: number };
export function calculateSecurityScore(findings: DekoCleanFinding[]): SecurityScoreExplanation {
  const current = selectSecurityFindings(findings);
  const criticalPenalty = current.filter((f) => f.severity === "critical").length * 35;
  const highPenalty = current.filter((f) => f.severity === "high").length * 15;
  const mediumPenalty = current.filter((f) => f.severity === "medium").length * 6;
  return { baseScore: 100, criticalPenalty, highPenalty, mediumPenalty, finalScore: Math.max(0, 100 - criticalPenalty - highPenalty - mediumPenalty) };
}

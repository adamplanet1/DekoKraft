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

export function canonicalStatus(finding: DekoCleanFinding): string {
  return finding.lifecycle?.status ?? (finding.status === "resolved" ? "RESOLVED" : finding.status === "ignored" ? "IGNORED" : finding.status === "failed" ? "FAILED" : "OPEN");
}

function increment(target: Record<string, number>, key: string): void { target[key || "unknown"] = (target[key || "unknown"] ?? 0) + 1; }

export function selectNeedsReviewFindings(findings: DekoCleanFinding[]): { findings: DekoCleanFinding[]; breakdown: NeedsReviewCountBreakdown } {
  const resolvedRecordsExcluded = findings.filter((finding) => ["RESOLVED", "IGNORED"].includes(canonicalStatus(finding))).length;
  const lifecycleActive = findings.filter((finding) => ["OPEN", "FAILED"].includes(canonicalStatus(finding)));
  const actionable = (finding: DekoCleanFinding) => finding.severity !== "info" || finding.recommendedActions.some((action) => ["repair", "restore", "recreate", "quarantine"].includes(action));
  const active = lifecycleActive.filter(actionable);
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

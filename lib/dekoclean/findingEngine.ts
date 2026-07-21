import { createHash } from "node:crypto";

import type {
  DekoCleanAction,
  DekoCleanFinding,
  DekoCleanFindingCategory,
  DekoCleanFindingType,
  DekoCleanSeverity,
} from "./types.ts";

export type DekoCleanFindingInput = Omit<
  DekoCleanFinding,
  | "category"
  | "description"
  | "affectedFiles"
  | "count"
  | "dependencies"
  | "relatedFindingIds"
  | "source"
  | "recommendedAction"
  | "repairAvailable"
  | "canRollback"
  | "canValidate"
> & Partial<Pick<DekoCleanFinding,
  | "category"
  | "description"
  | "affectedFiles"
  | "count"
  | "dependencies"
  | "relatedFindingIds"
  | "source"
  | "recommendedAction"
  | "repairAvailable"
  | "canRollback"
  | "canValidate"
>>;

const severityRank: Record<DekoCleanSeverity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const actionRank: Record<DekoCleanAction, number> = {
  repair: 8,
  restore: 7,
  recreate: 6,
  quarantine: 5,
  validate: 4,
  rollback: 3,
  ignore: 2,
  scan: 1,
};

export function categoryForFinding(type: DekoCleanFindingType): DekoCleanFindingCategory {
  if (["integrity-mismatch", "unexpected-file-change"].includes(type)) return "integrity-issues";
  if (type === "ownership-inconsistency") return "ownership-issues";
  if (["missing-file", "broken-asset-reference"].includes(type)) return "missing-references";
  if (type === "duplicate-file") return "duplicate-components";
  if (type === "unused-file") return "unused-files";
  if (type === "broken-route") return "unused-routes";
  if (type === "broken-import") return "broken-imports";
  if (["security-alert", "suspicious-file"].includes(type)) return "security-issues";
  return "general";
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
function normalizedEvidence(evidence: string[]): string { return unique(evidence).map((value) => value.trim().replace(/\\/g, "/").replace(/\s+/g, " ")).join("|"); }
function stableFingerprint(input: { detectedBy: string; type: string; affectedPaths: string[]; recommendedAction?: string }): string {
  const normalize = (value: string) => value.trim().replace(/\\/g, "/").replace(/\/+/g, "/").toLowerCase();
  return createHash("sha256").update([input.detectedBy, input.type, unique(input.affectedPaths).map(normalize).join("|"), normalize(input.recommendedAction ?? "")].join("\n")).digest("hex");
}

function dependenciesFromEvidence(evidence: string[]): string[] {
  return unique(evidence.filter((item) => /^(?:Import|Asset|Route|Duplicate of|Dependency):/i.test(item)));
}

export function enrichFinding(input: DekoCleanFindingInput): DekoCleanFinding {
  const affectedFiles = unique(input.affectedFiles ?? input.affectedPaths ?? []);
  const deterministicRepairType = ["broken-import", "broken-asset-reference"].includes(input.type);
  const recommendedActions = unique(input.recommendedActions.filter((action) => action !== "repair" || deterministicRepairType)) as DekoCleanAction[];
  recommendedActions.sort((a, b) => actionRank[b] - actionRank[a]);
  const recommendedAction = input.recommendedAction ?? recommendedActions[0] ?? "validate";
  const repairAvailable = input.repairAvailable ?? recommendedActions.some((action) => ["repair", "restore", "recreate", "quarantine"].includes(action));
  const fingerprint = input.fingerprint ?? stableFingerprint({ detectedBy: input.detectedBy, type: input.type, affectedPaths: affectedFiles, recommendedAction: input.recommendedAction });
  const now = input.lastSeenAt ?? input.detectedAt ?? new Date().toISOString();
  const findingId = input.findingId ?? `finding-${fingerprint.slice(0, 16)}`;
  return {
    ...input,
    id: findingId,
    findingId,
    fingerprint,
    detector: input.detectedBy,
    scope: input.category ?? categoryForFinding(input.type),
    normalizedTarget: affectedFiles.join("|") || input.type,
    evidenceKey: normalizedEvidence(input.evidence),
    firstSeenAt: input.firstSeenAt ?? now,
    lastSeenAt: now,
    occurrenceCount: input.occurrenceCount ?? 1,
    scanIds: [...new Set(input.scanIds ?? [])],
    currentEvidence: input.currentEvidence ?? input.evidence,
    evidenceHistory: input.evidenceHistory ?? [],
    timeline: input.timeline ?? [],
    schemaVersion: 1,
    category: input.category ?? categoryForFinding(input.type),
    description: input.description ?? input.explanation,
    affectedFiles,
    affectedPaths: affectedFiles,
    count: affectedFiles.length || Math.max(1, input.count ?? 1),
    evidence: unique(input.evidence),
    dependencies: unique(input.dependencies ?? dependenciesFromEvidence(input.evidence)),
    relatedFindingIds: unique(input.relatedFindingIds ?? []),
    source: input.source ?? input.detectedBy,
    recommendedAction,
    recommendedActions,
    repairAvailable,
    canRollback: input.canRollback ?? (repairAvailable && affectedFiles.length > 0),
    canValidate: input.canValidate ?? affectedFiles.length > 0,
  };
}

function rootCauseKey(finding: DekoCleanFinding): string {
  return finding.fingerprint ?? stableFingerprint({ detectedBy: finding.detectedBy, type: finding.type, affectedPaths: finding.affectedPaths, recommendedAction: finding.recommendedAction });
}

function groupedId(key: string): string {
  return `finding-group-${createHash("sha256").update(key).digest("hex").slice(0, 16)}`;
}

function latestStatus(findings: DekoCleanFinding[]): DekoCleanFinding["status"] {
  const active = findings.find((finding) => !["resolved", "ignored"].includes(finding.status));
  return active?.status ?? findings[0]?.status ?? "new";
}

export function organizeFindings(inputs: DekoCleanFindingInput[]): DekoCleanFinding[] {
  const groups = new Map<string, DekoCleanFinding[]>();
  for (const input of inputs) {
    const finding = enrichFinding(input);
    const key = rootCauseKey(finding);
    const group = groups.get(key) ?? [];
    group.push(finding);
    groups.set(key, group);
  }

  const organized = [...groups.entries()].map(([key, group]) => {
    const strongest = [...group].sort((a, b) => severityRank[b.severity] - severityRank[a.severity])[0];
    const affectedFiles = unique(group.flatMap((finding) => finding.affectedFiles));
    const evidence = unique(group.flatMap((finding) => finding.evidence));
    const dependencies = unique(group.flatMap((finding) => finding.dependencies));
    const actions = unique(group.flatMap((finding) => finding.recommendedActions)) as DekoCleanAction[];
    actions.sort((a, b) => actionRank[b] - actionRank[a]);
    return enrichFinding({
      ...strongest,
      id: groupedId(key),
      affectedFiles,
      affectedPaths: affectedFiles,
      count: affectedFiles.length || group.reduce((total, finding) => total + finding.count, 0),
      evidence,
      dependencies,
      recommendedActions: actions,
      status: latestStatus(group),
      detectedAt: group.map((finding) => finding.detectedAt).sort().at(-1) ?? strongest.detectedAt,
    });
  });

  const idsByCategory = new Map<DekoCleanFindingCategory, string[]>();
  for (const finding of organized) {
    const ids = idsByCategory.get(finding.category) ?? [];
    ids.push(finding.id);
    idsByCategory.set(finding.category, ids);
  }

  return organized
    .map((finding) => ({
      ...finding,
      relatedFindingIds: (idsByCategory.get(finding.category) ?? []).filter((id) => id !== finding.id),
    }))
    .sort((a, b) => severityRank[b.severity] - severityRank[a.severity] || b.count - a.count || a.title.localeCompare(b.title));
}

export function isIgnoredFindingPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/");
  const segments = normalized.split("/");
  const ignoredDirectories = new Set([".next", "out", "dist", "build", "coverage", "node_modules", ".git", ".vercel", ".cache", "tmp", "temp"]);
  if (segments.some((segment) => ignoredDirectories.has(segment))) return true;
  const name = segments.at(-1) ?? normalized;
  return /(?:\.map|\.log|\.tmp|\.cache)$/i.test(name) || name === ".DS_Store" || /^Thumbs\.db$/i.test(name);
}

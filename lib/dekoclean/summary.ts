import fs from "node:fs";
import path from "node:path";

import { readFindings } from "./findingStore.ts";
import { readLatestReport } from "./report.ts";
import type { DekoCleanReport, DekoCleanSummary } from "./types.ts";
import { selectNeedsReviewFindings, selectSecurityFindings } from "./findingSelectors.ts";

export type DekoCleanManifestSummary = { id: string; status: string; createdAt: string; entries: number };

export function listDekoCleanManifests(projectRoot = process.cwd()): DekoCleanManifestSummary[] {
  const directory = path.join(projectRoot, ".dekoclean", "manifests");
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((entry) => entry.endsWith(".json")).flatMap((name) => {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8")) as { id?: string; status?: string; createdAt?: string; entries?: unknown[] };
      if (!manifest.id || !manifest.status || !manifest.createdAt) return [];
      return [{ id: manifest.id, status: manifest.status, createdAt: manifest.createdAt, entries: manifest.entries?.length ?? 0 }];
    } catch { return []; }
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function safeReport(projectRoot: string): DekoCleanReport | null {
  try { return readLatestReport(projectRoot); } catch { return null; }
}

export function getDekoCleanSummary(projectRoot = process.cwd()): DekoCleanSummary {
  const all = readFindings(projectRoot);
  const canonical = (f: typeof all[number]) => f.lifecycle?.status ?? (f.status === "resolved" ? "RESOLVED" : f.status === "ignored" ? "IGNORED" : f.status === "failed" ? "FAILED" : "OPEN");
  const unique = selectNeedsReviewFindings(all).findings;
  const resolvedFindings = all.filter((f) => canonical(f) === "RESOLVED").length;
  const failedFindings = all.filter((f) => canonical(f) === "FAILED").length;
  const report = safeReport(projectRoot);
  const quarantinedFiles = listDekoCleanManifests(projectRoot)
    .filter((manifest) => manifest.status !== "restored")
    .reduce((total, manifest) => total + manifest.entries, 0);
  const criticalAlerts = unique.filter((finding) => finding.severity === "critical").length;
  const highAlerts = unique.filter((finding) => finding.severity === "high").length;
  const radarAlerts = selectSecurityFindings(all).length;
  const scanned = report?.scannedFiles ?? 0;
  const affected = new Set(unique.flatMap((f) => f.affectedFiles));
  return {
    status: criticalAlerts > 0 ? "danger" : highAlerts > 0 ? "warning" : unique.length > 0 ? "review" : "stable",
    radarAlerts,
    reviewItems: unique.filter((f) => ["OPEN", "FAILED"].includes(canonical(f))).length,
    quarantinedFiles,
    protectedFiles: report?.protectedFiles ?? 0,
    criticalAlerts,
    lastScanAt: report?.createdAt,
    healthyFiles: Math.max(0, scanned - affected.size),
    pendingDecision: unique.filter((f) => canonical(f) === "OPEN" && f.recommendedAction !== "validate").length,
    resolvedFindings,
    failedFindings,
  };
}

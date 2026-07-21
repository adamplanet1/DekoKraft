import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createDekoCleanConfig } from "./config.ts";
import { checksumFile } from "./duplicateDetector.ts";
import { readFindings, writeFindings, findingLifecycleStatus } from "./findingStore.ts";
import { scanProject } from "./scanner.ts";
import type { DekoCleanFinding, ProtectedFileChangeClassification } from "./types.ts";

export type SecurityReconciliationReport = { beforeTotal: number; beforeActive: number; legacyCount: number; duplicateCount: number; migratedCount: number; mergedCount: number; resolvedCount: number; afterActive: number; eligibleForApproval: number; eligibleForRestore: number };
type Baseline = { checksums?: Record<string, string> };
const normalizePath = (value: string) => value.trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
const identity = (finding: DekoCleanFinding) => createHash("sha256").update([normalizePath(finding.affectedFiles[0] ?? ""), finding.detector ?? finding.detectedBy, finding.type, finding.fileHashSha256 ?? ""].join("::")).digest("hex");
const active = (finding: DekoCleanFinding) => !["RESOLVED", "IGNORED"].includes(findingLifecycleStatus(finding));

function workingTreeChange(root: string, filePath: string): boolean {
  try { return execFileSync("git", ["status", "--porcelain", "--", filePath], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().length > 0; } catch { return false; }
}
function classify(root: string, filePath: string, currentHash: string | undefined, previousHash: string | undefined): ProtectedFileChangeClassification {
  const absolute = path.resolve(root, filePath);
  if (!fs.existsSync(absolute)) return "integrity-failure";
  try { fs.accessSync(absolute, fs.constants.R_OK); } catch { return "integrity-failure"; }
  if (!currentHash || !previousHash) return "unverified-change";
  return workingTreeChange(root, filePath) ? "authorized-project-change" : currentHash === previousHash ? "authorized-project-change" : "unexpected-change";
}

export function reconcilePersistedSecurityFindings(projectRoot = process.cwd()): SecurityReconciliationReport {
  const before = readFindings(projectRoot);
  const security = before.filter((finding) => finding.type === "integrity-mismatch");
  const beforeActive = security.filter(active).length;
  const baselinePath = path.join(projectRoot, ".dekoclean", "state", "protected-integrity.json");
  const baseline = (() => { try { return JSON.parse(fs.readFileSync(baselinePath, "utf8")) as Baseline; } catch { return {}; } })();
  const scannedProtected = new Map(scanProject(createDekoCleanConfig(projectRoot)).files.filter((file) => file.protected && !file.symbolicLink).map((file) => [normalizePath(file.path), file]));
  const groups = new Map<string, DekoCleanFinding[]>();
  const nonSecurity = before.filter((finding) => finding.type !== "integrity-mismatch");
  let legacyCount = 0;
  for (const finding of security) {
    const filePath = normalizePath(finding.affectedFiles[0] ?? "");
    const scanned = scannedProtected.get(filePath);
    const currentHash = scanned ? checksumFile(scanned.absolutePath) : finding.fileHashSha256;
    const normalized = { ...finding, affectedFiles: filePath ? [filePath] : [], affectedPaths: filePath ? [filePath] : [], fileHashSha256: currentHash };
    const key = identity(normalized);
    const group = groups.get(key) ?? [];
    group.push(normalized); groups.set(key, group);
    if (!finding.migrationVersion) legacyCount++;
  }
  const migrated: DekoCleanFinding[] = [];
  let mergedCount = 0; let resolvedCount = 0;
  const now = new Date().toISOString();
  for (const group of groups.values()) {
    group.sort((a, b) => (a.firstSeenAt ?? a.detectedAt).localeCompare(b.firstSeenAt ?? b.detectedAt));
    const canonical = group[0];
    const filePath = normalizePath(canonical.affectedFiles[0] ?? "");
    const present = Boolean(scannedProtected.get(filePath));
    const previousHash = baseline.checksums?.[filePath] ?? canonical.previousFileHashSha256;
    const classification = classify(projectRoot, filePath, canonical.fileHashSha256, previousHash);
    const severity = classification === "integrity-failure" ? "critical" : classification === "unexpected-change" ? "high" : classification === "unverified-change" ? "medium" : "info";
    const isResolved = !present || canonical.fileHashSha256 === previousHash;
    if (isResolved && active(canonical)) resolvedCount++;
    migrated.push({ ...canonical, fingerprint: identity(canonical), findingId: canonical.id, title: classification === "authorized-project-change" ? "تغيير مشروع معروف" : classification === "unverified-change" ? "تغيير يحتاج تحقق" : classification === "unexpected-change" ? "تغيير غير متوقع" : "فشل سلامة الملف", severity, protectedChangeClassification: classification, baselineApprovalStatus: isResolved ? "baseline-approved" : "pending-baseline-approval", previousFileHashSha256: previousHash, firstSeenAt: group[0].firstSeenAt ?? group[0].detectedAt, lastSeenAt: group.at(-1)?.lastSeenAt ?? group.at(-1)?.detectedAt ?? now, occurrenceCount: group.reduce((sum, finding) => sum + (finding.occurrenceCount ?? 1), 0), scanIds: [...new Set(group.flatMap((finding) => finding.scanIds ?? []))], migratedFromLegacy: true, migrationVersion: 1, migrationReason: "Canonical protected-file reconciliation against current files and trusted baseline.", lifecycle: { status: isResolved ? "RESOLVED" : "OPEN", updatedAt: now, resolvedAt: isResolved ? now : undefined }, status: isResolved ? "resolved" : "new", recommendedActions: classification === "unexpected-change" || classification === "integrity-failure" ? ["validate", "restore", "ignore"] : ["validate", "ignore"], recommendedAction: classification === "unexpected-change" || classification === "integrity-failure" ? "restore" : "validate", repairAvailable: false });
    for (const alias of group.slice(1)) { mergedCount++; migrated.push({ ...alias, migratedFromLegacy: true, migrationVersion: 1, migrationReason: `Superseded by ${canonical.id}.`, lifecycle: { status: "RESOLVED", updatedAt: now, resolvedAt: now }, status: "resolved" }); }
  }
  writeFindings([...nonSecurity, ...migrated], projectRoot);
  const after = migrated.filter(active);
  return { beforeTotal: security.length, beforeActive, legacyCount, duplicateCount: mergedCount, migratedCount: security.length, mergedCount, resolvedCount, afterActive: after.length, eligibleForApproval: after.filter((f) => ["authorized-project-change", "unverified-change"].includes(f.protectedChangeClassification ?? "")).length, eligibleForRestore: after.filter((f) => ["unexpected-change", "integrity-failure"].includes(f.protectedChangeClassification ?? "") && Boolean(f.previousFileHashSha256)).length };
}

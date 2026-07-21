import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { createDekoCleanConfig } from "./config.ts";
import { checksumFile } from "./duplicateDetector.ts";
import { findingLifecycleStatus, readFindings, updateFindingLifecycle, writeFindings } from "./findingStore.ts";
import { scanProject } from "./scanner.ts";

export interface MemoryIntegrityDiagnostics {
  scannedSourceFiles: number;
  healthyFiles: number;
  changedExpectedFiles: number;
  unexpectedChangedFiles: number;
  missingFiles: number;
  staleRecordsRemoved: number;
  duplicateRecordsRemoved: number;
  unresolvedIntegrityFindings: number;
  ignoredGeneratedDirectories: string[];
  score: number | null;
  calculatedAt: string;
  formula: string;
}

type ProtectedBaseline = {
  createdAt: string;
  updatedAt?: string;
  checksums: Record<string, string>;
  approvals?: unknown[];
  refreshHistory?: Array<{
    refreshedAt: string;
    reason: string;
    previousRecords: number;
    currentRecords: number;
    staleRecordsRemoved: number;
    duplicateRecordsRemoved: number;
  }>;
};

type IntegrityClassification = {
  diagnostics: MemoryIntegrityDiagnostics;
  checksums: Record<string, string>;
};

const GENERATED_DIRECTORIES = [
  ".next", "out", "dist", "build", "coverage", "node_modules", ".git", ".vercel", ".cache", ".turbo", ".parcel-cache", "tmp", "temp", ".dekoclean", "github-pages/public",
];

function normalizePath(value: string): string {
  return value.trim().replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\.\//, "");
}

function baselinePath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "protected-integrity.json");
}

function readBaseline(projectRoot: string): ProtectedBaseline | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(baselinePath(projectRoot), "utf8")) as Partial<ProtectedBaseline>;
    return parsed.checksums && typeof parsed.checksums === "object"
      ? { createdAt: parsed.createdAt ?? new Date(0).toISOString(), ...parsed, checksums: parsed.checksums }
      : null;
  } catch {
    return null;
  }
}

function headFiles(projectRoot: string): Set<string> {
  try {
    return new Set(execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD"], { cwd: projectRoot, encoding: "utf8" })
      .split("\n").map(normalizePath).filter(Boolean));
  } catch {
    return new Set();
  }
}

function headHash(projectRoot: string, filePath: string): string | null {
  try {
    const content = execFileSync("git", ["show", `HEAD:${filePath}`], { cwd: projectRoot, encoding: null, stdio: ["ignore", "pipe", "ignore"] });
    return createHash("sha256").update(content).digest("hex");
  } catch {
    return null;
  }
}

function classify(projectRoot: string): IntegrityClassification {
  const baseline = readBaseline(projectRoot);
  const rawEntries = Object.entries(baseline?.checksums ?? {});
  const normalizedBaseline = new Map<string, string>();
  let duplicateRecordsRemoved = 0;
  for (const [filePath, hash] of rawEntries) {
    const normalized = normalizePath(filePath);
    if (normalizedBaseline.has(normalized)) duplicateRecordsRemoved += 1;
    normalizedBaseline.set(normalized, hash);
  }

  const tracked = headFiles(projectRoot);
  const scanned = scanProject(createDekoCleanConfig(projectRoot)).files
    .filter((file) => file.protected && !file.symbolicLink)
    .map((file) => ({ ...file, path: normalizePath(file.path) }));
  const current = new Map(scanned.map((file) => [file.path, file]));
  let healthyFiles = 0;
  let changedExpectedFiles = 0;
  let unexpectedChangedFiles = 0;
  let missingFiles = 0;
  let staleRecordsRemoved = 0;
  const checksums: Record<string, string> = {};

  for (const file of scanned) {
    const currentHash = checksumFile(file.absolutePath);
    const previousHash = normalizedBaseline.get(file.path);
    const committedHash = headHash(projectRoot, file.path);
    if (previousHash || tracked.has(file.path)) checksums[file.path] = currentHash;
    if (previousHash === currentHash) healthyFiles += 1;
    else if (committedHash === currentHash) changedExpectedFiles += 1;
    else unexpectedChangedFiles += 1;
  }

  for (const filePath of normalizedBaseline.keys()) {
    if (current.has(filePath)) continue;
    if (tracked.has(filePath)) missingFiles += 1;
    else staleRecordsRemoved += 1;
  }

  const unresolvedIntegrityFindings = readFindings(projectRoot).filter((finding) =>
    finding.type === "integrity-mismatch" &&
    !["RESOLVED", "IGNORED"].includes(findingLifecycleStatus(finding)) &&
    !["resolved", "ignored"].includes(finding.status) &&
    finding.protectedChangeClassification !== "authorized-project-change"
  ).length;
  const scannedSourceFiles = healthyFiles + changedExpectedFiles + unexpectedChangedFiles + missingFiles;
  const healthyOrExpected = healthyFiles + changedExpectedFiles;
  const score = scannedSourceFiles > 0 ? Math.round((healthyOrExpected / scannedSourceFiles) * 100) : null;
  const calculatedAt = new Date().toISOString();

  return { checksums, diagnostics: {
    scannedSourceFiles, healthyFiles, changedExpectedFiles, unexpectedChangedFiles, missingFiles,
    staleRecordsRemoved, duplicateRecordsRemoved, unresolvedIntegrityFindings,
    ignoredGeneratedDirectories: GENERATED_DIRECTORIES,
    score, calculatedAt,
    formula: "round(100 × (healthyFiles + changedExpectedFiles) ÷ scannedSourceFiles)",
  } };
}

export function calculateMemoryIntegrity(projectRoot = process.cwd()): MemoryIntegrityDiagnostics {
  return classify(projectRoot).diagnostics;
}

export function regenerateMemoryIntegrityBaseline(reason: string, projectRoot = process.cwd()): MemoryIntegrityDiagnostics {
  const previous = readBaseline(projectRoot);
  const result = classify(projectRoot);
  if (result.diagnostics.unexpectedChangedFiles > 0 || result.diagnostics.missingFiles > 0) {
    throw new Error("MEMORY_INTEGRITY_BASELINE_UNSAFE");
  }
  const now = new Date().toISOString();
  const next: ProtectedBaseline = {
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    checksums: result.checksums,
    approvals: previous?.approvals ?? [],
    refreshHistory: [...(previous?.refreshHistory ?? []), {
      refreshedAt: now, reason,
      previousRecords: Object.keys(previous?.checksums ?? {}).length,
      currentRecords: Object.keys(result.checksums).length,
      staleRecordsRemoved: result.diagnostics.staleRecordsRemoved,
      duplicateRecordsRemoved: result.diagnostics.duplicateRecordsRemoved,
    }].slice(-1000),
  };
  const target = baselinePath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(next, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporary, target);

  const eligible = readFindings(projectRoot).filter((finding) =>
    finding.type === "integrity-mismatch" &&
    finding.protectedChangeClassification === "authorized-project-change" &&
    !["RESOLVED", "IGNORED"].includes(findingLifecycleStatus(finding))
  );
  for (const finding of eligible) {
    updateFindingLifecycle(finding.id, {
      status: "RESOLVED", action: "validate", success: true,
      message: "Current checksum was verified against Git HEAD and recorded in the refreshed protected baseline.",
    }, projectRoot);
  }
  writeFindings(readFindings(projectRoot).map((finding) => eligible.some((entry) => entry.id === finding.id)
    ? { ...finding, baselineApprovalStatus: "baseline-approved", lastResult: "resolved" }
    : finding), projectRoot);
  return calculateMemoryIntegrity(projectRoot);
}

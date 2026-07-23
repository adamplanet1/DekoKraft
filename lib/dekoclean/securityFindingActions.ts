import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";

import { recordTemporarilyIgnoredFinding } from "./actionStorage.ts";
import { appendDekoCleanAudit } from "./auditLog.ts";
import { checksumFile } from "./duplicateDetector.ts";
import { readFindings, updateFindingLifecycle, writeFindings } from "./findingStore.ts";
import type { DekoCleanFinding, SecurityFindingReviewClassification, SecurityFindingVerification } from "./types.ts";

type ProtectedBaseline = {
  checksums: Record<string, string>;
  approvals?: Array<Record<string, unknown>>;
};

export interface SecurityFindingInspection extends SecurityFindingVerification {
  findingId: string;
  baselineValid: boolean;
  currentMatchesStoredFinding: boolean;
  currentMatchesGitHead: boolean;
  workingTreeChanged: boolean;
  latestCommitAt?: string;
  latestCommitSubject?: string;
  gitDiff: string;
  changedLines: string[];
  dangerousLines: string[];
  canApprove: boolean;
  canRestore: boolean;
}

const SHA256 = /^[a-f\d]{64}$/i;
const normalizePath = (value: string) => value.trim().replace(/\\/g, "/").replace(/^\.\/+/, "");
const hash = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");

function projectFile(projectRoot: string, relativePath: string): string {
  const root = path.resolve(projectRoot);
  const absolute = path.resolve(root, normalizePath(relativePath));
  if (!absolute.startsWith(`${root}${path.sep}`)) throw new Error("SECURITY_FINDING_PATH_UNSAFE");
  return absolute;
}

function runGit(projectRoot: string, args: string[]): string {
  try {
    return execFileSync("git", args, { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 2_000_000 }).trim();
  } catch {
    return "";
  }
}

function readBaseline(projectRoot: string): { target: string; baseline: ProtectedBaseline } {
  const target = path.join(path.resolve(projectRoot), ".dekoclean", "state", "protected-integrity.json");
  const parsed = JSON.parse(fs.readFileSync(target, "utf8")) as ProtectedBaseline;
  return { target, baseline: { ...parsed, checksums: parsed.checksums ?? {} } };
}

function writeJsonAtomic(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, target);
}

function findFinding(findingId: string, projectRoot: string): DekoCleanFinding {
  const finding = readFindings(projectRoot).find((entry) => entry.id === findingId || entry.findingId === findingId);
  if (!finding || finding.type !== "integrity-mismatch") throw new Error("SECURITY_FINDING_NOT_FOUND");
  if (finding.affectedFiles.length !== 1) throw new Error("SECURITY_FINDING_TARGET_INVALID");
  return finding;
}

function latestCommit(projectRoot: string, filePath: string): { hash?: string; date?: string; subject?: string } {
  const value = runGit(projectRoot, ["log", "-1", "--format=%H%n%aI%n%s", "--", filePath]).split("\n");
  return value[0] ? { hash: value[0], date: value[1], subject: value.slice(2).join("\n") } : {};
}

function gitContent(projectRoot: string, revision: string, filePath: string): Buffer | null {
  try {
    return execFileSync("git", ["show", `${revision}:${filePath}`], { cwd: projectRoot, encoding: null, stdio: ["ignore", "pipe", "ignore"], maxBuffer: 4_000_000 });
  } catch {
    return null;
  }
}

function trustedBaselineContent(projectRoot: string, filePath: string, expectedHash: string): Buffer | null {
  const revisions = runGit(projectRoot, ["rev-list", "--all", "--", filePath]).split("\n").filter(Boolean);
  for (const revision of revisions) {
    const content = gitContent(projectRoot, revision, filePath);
    if (content && hash(content) === expectedHash) return content;
  }
  const recoveryRoot = path.join(projectRoot, ".dekoclean", "recovery");
  const pointsRoot = path.join(recoveryRoot, "points");
  if (!fs.existsSync(pointsRoot)) return null;
  for (const point of fs.readdirSync(pointsRoot)) {
    const manifestPath = path.join(pointsRoot, point, "manifest.json");
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as { entries?: Array<{ path?: string; checksum?: string; contentObjectReference?: string; contentEncoding?: string; restoreEligible?: boolean }> };
      const entry = manifest.entries?.find((candidate) => normalizePath(candidate.path ?? "") === filePath && candidate.checksum === expectedHash && candidate.restoreEligible !== false);
      if (!entry?.contentObjectReference || entry.contentEncoding !== "gzip") continue;
      const objectPath = projectFile(recoveryRoot, entry.contentObjectReference);
      const content = gunzipSync(fs.readFileSync(objectPath));
      if (hash(content) === expectedHash) return content;
    } catch {
      // An unreadable recovery point is not a trusted restore source.
    }
  }
  return null;
}

function dangerousAddedLines(diff: string): string[] {
  const patterns = [
    /\b(?:preinstall|postinstall|prepare)\b/i,
    /\b(?:eval|Function)\s*\(/,
    /\bchild_process\b|\bexec(?:File|Sync)?\s*\(/,
    /\b(?:api[_-]?key|secret|password|token)\b\s*[:=]/i,
    /https?:\/\/(?!cdn\.sheetjs\.com\b)/i,
    /\b(?:rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED|dangerouslyAllow)/i,
  ];
  return diff.split("\n").filter((line) => line.startsWith("+") && !line.startsWith("+++")).filter((line) => patterns.some((pattern) => pattern.test(line)));
}

function classify(input: {
  exists: boolean;
  baselineValid: boolean;
  matchesBaseline: boolean;
  matchesGitHead: boolean;
  gitTracked: boolean;
  workingTreeChanged: boolean;
  dangerousLines: string[];
  storedClassification?: string;
}): SecurityFindingReviewClassification {
  if (!input.exists) return "missing_file";
  if (!input.baselineValid) return "invalid_baseline";
  if (input.matchesBaseline) return "stale_finding";
  if (input.dangerousLines.length) return "suspicious_change";
  if (input.gitTracked && input.matchesGitHead) return "expected_project_change";
  if (input.workingTreeChanged && input.storedClassification === "authorized-project-change") return "expected_project_change";
  return "unexpected_safe_change";
}

export function inspectSecurityFinding(findingId: string, projectRoot = process.cwd()): SecurityFindingInspection {
  const finding = findFinding(findingId, projectRoot);
  const filePath = normalizePath(finding.affectedFiles[0]);
  const absolute = projectFile(projectRoot, filePath);
  const exists = fs.existsSync(absolute) && !fs.lstatSync(absolute).isSymbolicLink();
  const { baseline } = readBaseline(projectRoot);
  const previousHash = baseline.checksums[filePath] ?? finding.previousFileHashSha256;
  const baselineValid = typeof previousHash === "string" && SHA256.test(previousHash);
  const currentHash = exists ? checksumFile(absolute) : undefined;
  const gitTracked = Boolean(runGit(projectRoot, ["ls-files", "--error-unmatch", "--", filePath]));
  const workingTreeChanged = Boolean(runGit(projectRoot, ["status", "--porcelain", "--", filePath]));
  const headContent = gitTracked ? gitContent(projectRoot, "HEAD", filePath) : null;
  const currentMatchesGitHead = Boolean(currentHash && headContent && hash(headContent) === currentHash);
  const currentMatchesStoredFinding = Boolean(currentHash && currentHash === finding.fileHashSha256);
  const commit = latestCommit(projectRoot, filePath);
  const gitDiff = (workingTreeChanged
    ? runGit(projectRoot, ["diff", "--", filePath])
    : commit.hash ? runGit(projectRoot, ["show", "--format=", "--find-renames", commit.hash, "--", filePath]) : "").slice(0, 80_000);
  const changedLines = gitDiff.split("\n").filter((line) => /^[+-](?![+-])/.test(line)).slice(0, 500);
  const unsafe = dangerousAddedLines(gitDiff);
  const classification = classify({
    exists,
    baselineValid,
    matchesBaseline: Boolean(currentHash && previousHash && currentHash === previousHash),
    matchesGitHead: currentMatchesGitHead,
    gitTracked,
    workingTreeChanged,
    dangerousLines: unsafe,
    storedClassification: finding.protectedChangeClassification,
  });
  const verifiedAt = new Date().toISOString();
  const reason = ({
    expected_project_change: currentMatchesGitHead
      ? "Current SHA-256 matches the tracked Git HEAD content and the reviewed commit diff contains no unsafe additions."
      : "The reviewed working-tree change is already classified as an authorized project change and contains no unsafe additions.",
    unexpected_safe_change: "The change contains no detected unsafe additions, but it is not the current tracked Git HEAD and requires explicit administrator approval.",
    suspicious_change: "The diff contains security-sensitive added lines and remains open for manual review.",
    stale_finding: "The current SHA-256 already matches the protected baseline.",
    missing_file: "The protected file is missing or is a symbolic link.",
    invalid_baseline: "The protected baseline does not contain a valid SHA-256 value.",
  } satisfies Record<SecurityFindingReviewClassification, string>)[classification];
  return {
    findingId: finding.id,
    classification,
    verifiedAt,
    filePath,
    previousHash,
    currentHash,
    gitTracked,
    latestCommit: commit.hash,
    latestCommitAt: commit.date,
    latestCommitSubject: commit.subject,
    reason,
    baselineValid,
    currentMatchesStoredFinding,
    currentMatchesGitHead,
    workingTreeChanged,
    gitDiff,
    changedLines,
    dangerousLines: unsafe,
    canApprove: ["expected_project_change", "unexpected_safe_change"].includes(classification) && Boolean(currentHash) && currentMatchesStoredFinding,
    canRestore: baselineValid && Boolean(trustedBaselineContent(projectRoot, filePath, previousHash!)),
  };
}

function persistVerification(inspection: SecurityFindingInspection, projectRoot: string): void {
  const findings = readFindings(projectRoot);
  const index = findings.findIndex((entry) => entry.id === inspection.findingId);
  if (index < 0) throw new Error("SECURITY_FINDING_NOT_FOUND");
  const verification: SecurityFindingVerification = {
    classification: inspection.classification,
    verifiedAt: inspection.verifiedAt,
    filePath: inspection.filePath,
    previousHash: inspection.previousHash,
    currentHash: inspection.currentHash,
    gitTracked: inspection.gitTracked,
    latestCommit: inspection.latestCommit,
    reason: inspection.reason,
  };
  findings[index] = { ...findings[index], securityVerification: verification, fileHashSha256: inspection.currentHash ?? findings[index].fileHashSha256 };
  writeFindings(findings, projectRoot);
}

export function validateSecurityFinding(findingId: string, adminReference: string, projectRoot = process.cwd()): SecurityFindingInspection {
  const inspection = inspectSecurityFinding(findingId, projectRoot);
  persistVerification(inspection, projectRoot);
  if (inspection.classification === "stale_finding") {
    updateFindingLifecycle(findingId, { status: "RESOLVED", action: "validate", success: true, message: inspection.reason }, projectRoot);
    appendDekoCleanAudit({
      operationId: randomUUID(), findingId, action: "validate", adminReference, affectedPaths: [inspection.filePath],
      beforeChecksums: inspection.previousHash ? { [inspection.filePath]: inspection.previousHash } : {},
      afterChecksums: inspection.currentHash ? { [inspection.filePath]: inspection.currentHash } : {},
      rollbackStatus: "not-required", status: "completed", createdAt: inspection.verifiedAt,
      metadata: { classification: inspection.classification, reason: inspection.reason, verifiedAt: inspection.verifiedAt },
    }, projectRoot);
  }
  return inspection;
}

export function approveSecurityFinding(findingId: string, confirmed: boolean, reason: string, adminReference: string, projectRoot = process.cwd()): SecurityFindingInspection {
  if (!confirmed) throw new Error("SECURITY_APPROVAL_CONFIRMATION_REQUIRED");
  const inspection = inspectSecurityFinding(findingId, projectRoot);
  if (!inspection.canApprove || !inspection.currentHash || !inspection.previousHash) throw new Error("SECURITY_FINDING_NOT_APPROVABLE");
  if (inspection.classification === "suspicious_change") throw new Error("SUSPICIOUS_CHANGE_CANNOT_BE_APPROVED");
  const { target, baseline } = readBaseline(projectRoot);
  baseline.checksums[inspection.filePath] = inspection.currentHash;
  baseline.approvals = [...(baseline.approvals ?? []), {
    filePath: inspection.filePath,
    previousHash: inspection.previousHash,
    approvedHash: inspection.currentHash,
    approvedAt: inspection.verifiedAt,
    approvedBy: "local-admin",
    findingId,
    reason: reason.slice(0, 500),
    classification: inspection.classification,
  }].slice(-1000);
  writeJsonAtomic(target, baseline);
  persistVerification(inspection, projectRoot);
  const findings = readFindings(projectRoot);
  writeFindings(findings.map((finding) => finding.id === findingId ? {
    ...finding,
    status: "approved",
    protectedChangeClassification: "authorized-project-change",
    baselineApprovalStatus: "baseline-approved",
  } : finding), projectRoot);
  updateFindingLifecycle(findingId, { status: "RESOLVED", action: "validate", success: true, message: `Approved project change: ${reason}` }, projectRoot);
  appendDekoCleanAudit({
    operationId: randomUUID(), findingId, action: "validate", adminReference, affectedPaths: [inspection.filePath],
    beforeChecksums: { [inspection.filePath]: inspection.previousHash },
    afterChecksums: { [inspection.filePath]: inspection.currentHash },
    rollbackStatus: "not-required", status: "completed", createdAt: inspection.verifiedAt,
    metadata: { decision: "approved project change", classification: inspection.classification, reason, verifiedAt: inspection.verifiedAt, previousHash: inspection.previousHash, newHash: inspection.currentHash },
  }, projectRoot);
  return inspection;
}

export function restoreSecurityFinding(findingId: string, confirmed: boolean, adminReference: string, projectRoot = process.cwd()): SecurityFindingInspection {
  if (!confirmed) throw new Error("SECURITY_RESTORE_CONFIRMATION_REQUIRED");
  const before = inspectSecurityFinding(findingId, projectRoot);
  if (!before.baselineValid || !before.previousHash || !before.currentHash) throw new Error("VERIFIED_BASELINE_REQUIRED");
  const trusted = trustedBaselineContent(projectRoot, before.filePath, before.previousHash);
  if (!trusted || hash(trusted) !== before.previousHash) throw new Error("VERIFIED_RESTORE_SOURCE_NOT_FOUND");
  const absolute = projectFile(projectRoot, before.filePath);
  const snapshot = path.join(projectRoot, ".dekoclean", "snapshots", `security-restore-${Date.now()}-${path.basename(before.filePath)}`);
  fs.mkdirSync(path.dirname(snapshot), { recursive: true, mode: 0o700 });
  fs.copyFileSync(absolute, snapshot, fs.constants.COPYFILE_EXCL);
  fs.chmodSync(snapshot, 0o600);
  const temporary = `${absolute}.${process.pid}.security-restore.tmp`;
  fs.writeFileSync(temporary, trusted, { mode: fs.statSync(absolute).mode });
  if (checksumFile(temporary) !== before.previousHash) { fs.unlinkSync(temporary); throw new Error("RESTORE_HASH_VALIDATION_FAILED"); }
  fs.renameSync(temporary, absolute);
  const after = inspectSecurityFinding(findingId, projectRoot);
  if (after.currentHash !== before.previousHash) throw new Error("RESTORE_POST_VALIDATION_FAILED");
  persistVerification(after, projectRoot);
  updateFindingLifecycle(findingId, { status: "RESOLVED", action: "restore", success: true, message: "Restored from a verified baseline source and revalidated." }, projectRoot);
  appendDekoCleanAudit({
    operationId: randomUUID(), findingId, action: "restore", adminReference, affectedPaths: [before.filePath],
    beforeChecksums: { [before.filePath]: before.currentHash }, afterChecksums: { [before.filePath]: after.currentHash! },
    snapshotManifestId: path.relative(projectRoot, snapshot), rollbackStatus: "available", status: "completed", createdAt: new Date().toISOString(),
    metadata: { source: "verified-baseline", previousHash: before.currentHash, restoredHash: after.currentHash },
  }, projectRoot);
  return after;
}

export function temporarilyIgnoreSecurityFinding(findingId: string, expiresAt: string, reason: string, adminReference: string, projectRoot = process.cwd()): SecurityFindingInspection {
  const inspection = inspectSecurityFinding(findingId, projectRoot);
  recordTemporarilyIgnoredFinding(findingId, adminReference, expiresAt, reason, projectRoot);
  const findings = readFindings(projectRoot);
  writeFindings(findings.map((finding) => finding.id === findingId ? { ...finding, temporaryIgnoreUntil: new Date(expiresAt).toISOString(), securityVerification: inspection } : finding), projectRoot);
  appendDekoCleanAudit({
    operationId: randomUUID(), findingId, action: "ignore", adminReference, affectedPaths: [inspection.filePath],
    beforeChecksums: inspection.previousHash ? { [inspection.filePath]: inspection.previousHash } : {},
    afterChecksums: inspection.currentHash ? { [inspection.filePath]: inspection.currentHash } : {},
    rollbackStatus: "not-required", status: "completed", createdAt: new Date().toISOString(),
    metadata: { temporary: true, expiresAt: new Date(expiresAt).toISOString(), reason, scoreDeductionRemains: true },
  }, projectRoot);
  return inspection;
}

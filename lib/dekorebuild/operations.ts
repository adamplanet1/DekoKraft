import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { appendDekoCleanAudit } from "../dekoclean/auditLog.ts";
import { checksumPath } from "../dekoclean/quarantine.ts";
import { resolveInsideProject, toPosixPath } from "../dekoclean/pathSafety.ts";
import { appendTimelineEntry } from "../dekoclean/timeline.ts";
import type { DekoCleanAuditEntry } from "../dekoclean/types.ts";
import { appendRecoveryMemory } from "./memory.ts";
import { createRecoveryPoint, failureSignature, validateHealthyState, type RecoveryValidator } from "./recoveryPoints.ts";
import { readContentObject, readRecoveryManifest, readRecoveryPoint, recoveryRoot, validRecoveryId } from "./storage.ts";
import type { RecoveryManifestEntry, RecoveryOperation, RecoveryPreview, RecoveryScope, RecoveryScopeLevel, RecoveryValidation } from "./types.ts";

type ProfileRunner = (profile: "quick" | "security" | "translations" | "assets" | "participants" | "performance") => Promise<boolean>;

function operationsPath(projectRoot: string): string { return path.join(recoveryRoot(projectRoot), "operations.json"); }
function previewsPath(projectRoot: string): string { return path.join(recoveryRoot(projectRoot), "previews.json"); }

function readArray<T>(target: string): T[] { try { const parsed: unknown = JSON.parse(fs.readFileSync(target, "utf8")); return Array.isArray(parsed) ? parsed as T[] : []; } catch { return []; } }
function writeArray<T>(target: string, values: T[]): void { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, `${JSON.stringify(values.slice(-1000), null, 2)}\n`, { encoding: "utf8", mode: 0o600 }); }

export function readRecoveryOperations(projectRoot = process.cwd()): RecoveryOperation[] { return readArray<RecoveryOperation>(operationsPath(projectRoot)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
export function readRecoveryOperation(operationId: string, projectRoot = process.cwd()): RecoveryOperation | null { return readRecoveryOperations(projectRoot).find((operation) => operation.operationId === operationId) ?? null; }
function saveOperation(operation: RecoveryOperation, projectRoot: string): RecoveryOperation { const operations = readRecoveryOperations(projectRoot); const index = operations.findIndex((entry) => entry.operationId === operation.operationId); if (index >= 0) operations[index] = operation; else operations.push(operation); writeArray(operationsPath(projectRoot), operations); return operation; }
function patchOperation(operationId: string, patch: Partial<RecoveryOperation>, projectRoot: string): RecoveryOperation { const current = readRecoveryOperation(operationId, projectRoot); if (!current) throw new Error("Recovery operation not found."); return saveOperation({ ...current, ...patch, operationId: current.operationId, updatedAt: new Date().toISOString() }, projectRoot); }

function normalizeSelectedPath(projectRoot: string, selectedPath: string): string {
  const absolute = resolveInsideProject(projectRoot, selectedPath);
  return toPosixPath(path.relative(projectRoot, absolute));
}

function scopeForEntry(entry: RecoveryManifestEntry, level: RecoveryScopeLevel = "file"): RecoveryScope {
  const relatedFiles = [...new Set([...entry.dependencies, ...entry.dependents])].slice(0, 500);
  return { scopeId: `scope-${createHash("sha256").update(`${level}:${entry.path}`).digest("hex").slice(0, 16)}`, level, affectedFiles: [entry.path], relatedFiles, excludedFiles: relatedFiles.filter((file) => file.startsWith(".dekoclean/") || file.startsWith("node_modules/")), reason: entry.deleted ? "استعادة حالة حذف موثقة" : "استعادة النسخة الموثقة للملف المتأثر فقط", confidence: entry.protected ? .9 : .95, estimatedRisk: entry.protected ? "high" : relatedFiles.length > 20 ? "medium" : "low" };
}

export function createRecoveryPreview(input: { recoveryPointId: string; selectedPath: string; detectedProblem?: string; operationId?: string; projectRoot?: string; createdBy: string; level?: RecoveryScopeLevel }): RecoveryPreview {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  if (!validRecoveryId(input.recoveryPointId)) throw new Error("Invalid recovery point id.");
  const point = readRecoveryPoint(input.recoveryPointId, projectRoot);
  if (point.status !== "verified") throw new Error("Only a verified recovery point can be used for restore.");
  const selectedPath = normalizeSelectedPath(projectRoot, input.selectedPath);
  const manifest = readRecoveryManifest(point.manifestReference, projectRoot);
  const entry = manifest.entries.find((item) => item.path === selectedPath);
  if (!entry || !entry.restoreEligible) throw new Error("Selected file is not eligible for recovery.");
  const existing = readRecoveryOperation(input.operationId ?? "", projectRoot);
  if (existing) return existing.preview;
  const operationId = input.operationId && validRecoveryId(input.operationId) ? input.operationId : `recovery-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const current = resolveInsideProject(projectRoot, selectedPath);
  if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error("Symbolic links cannot be restored by DekoRebuild.");
  const currentExists = fs.existsSync(current);
  const currentChecksum = currentExists ? checksumPath(current) : undefined;
  const unchanged = !entry.deleted && currentChecksum === entry.checksum;
  const scope = scopeForEntry(entry, input.level ?? "file");
  const preview: RecoveryPreview = {
    operationId, recoveryPointId: point.recoveryPointId, createdAt: new Date().toISOString(), detectedProblem: (input.detectedProblem ?? "ملف متأثر يحتاج استعادة موثقة").slice(0, 500), scope,
    currentVersions: [{ path: selectedPath, checksum: currentChecksum, size: currentExists ? fs.statSync(current).size : undefined, exists: currentExists }],
    recoveryVersions: [{ path: selectedPath, checksum: entry.deleted ? undefined : entry.checksum, size: entry.deleted ? undefined : entry.size, deleted: entry.deleted }],
    filesToRestore: !entry.deleted && !unchanged ? [selectedPath] : [], filesToDelete: entry.deleted && currentExists ? [selectedPath] : [], filesUnchanged: unchanged || (entry.deleted && !currentExists) ? [selectedPath] : [],
    diffSummary: unchanged ? "الملف الحالي مطابق لنقطة الاستعادة." : entry.deleted ? "سيُنقل الملف الحالي إلى حجر الاسترجاع وتُستعاد حالة الحذف." : `سيُستبدل ملف واحد بنسخته الموثقة. ${scope.relatedFiles.length} تبعية للعرض فقط ولن تتغير.`, recoveryPointDate: point.createdAt,
    validationStatus: point.status, confidence: scope.confidence, risk: scope.estimatedRisk, estimatedDuration: "يعتمد على مدة lint وbuild", rollbackAvailable: true,
    protectedFiles: entry.protected ? [entry.path] : [], requiresProtectedConfirmation: entry.protected, requiresSecondConfirmation: scope.level === "project",
  };
  const operation: RecoveryOperation = { operationId, recoveryPointId: point.recoveryPointId, status: "previewed", scope, preview, restoredFiles: [], removedFiles: [], createdAt: preview.createdAt, updatedAt: preview.createdAt, createdBy: input.createdBy.slice(0, 160), rollbackAvailable: false };
  saveOperation(operation, projectRoot);
  const previews = readArray<RecoveryPreview>(previewsPath(projectRoot)).filter((item) => item.operationId !== operationId);
  writeArray(previewsPath(projectRoot), [...previews, preview]);
  return preview;
}

function quarantineCurrent(projectRoot: string, operationId: string, filePath: string): string | undefined {
  const current = resolveInsideProject(projectRoot, filePath);
  if (!fs.existsSync(current)) return undefined;
  const targetRelative = toPosixPath(path.join("quarantine", operationId, "original", filePath));
  const target = path.join(recoveryRoot(projectRoot), targetRelative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.renameSync(current, target);
  return targetRelative;
}

function writeQuarantineManifest(projectRoot: string, operationId: string, filePath: string, reference?: string): string {
  const manifestReference = toPosixPath(path.join("quarantine", operationId, "manifest.json"));
  const target = path.join(recoveryRoot(projectRoot), manifestReference);
  const data = { operationId, createdAt: new Date().toISOString(), entries: [{ originalPath: filePath, quarantineReference: reference, checksum: reference ? checksumPath(path.join(recoveryRoot(projectRoot), reference)) : undefined }] };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return manifestReference;
}

function validationPassed(validation: RecoveryValidation): boolean { return validation.lintPassed && validation.buildPassed && validation.diffCheckPassed && validation.radarPassed && validation.protectedIntegrityPassed && validation.manifestsValid && validation.snapshotCompleted; }

function profileForPath(filePath: string): "quick" | "security" | "translations" | "assets" | "participants" {
  if (filePath.startsWith("locales/")) return "translations";
  if (filePath.startsWith("public/") || /\.(?:png|jpe?g|webp|svg|mp4|webm)$/i.test(filePath)) return "assets";
  if (/participant|seller|inventory|finance/i.test(filePath)) return "participants";
  if (/security|auth|\.env/i.test(filePath)) return "security";
  return "quick";
}

export async function executeFileRecovery(input: { operationId: string; confirmed: boolean; protectedConfirmation?: boolean; secondConfirmation?: boolean; projectRoot?: string; validator?: RecoveryValidator; profileRunner?: ProfileRunner }): Promise<RecoveryOperation> {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  const existing = readRecoveryOperation(input.operationId, projectRoot);
  if (!existing) throw new Error("Create a recovery preview first.");
  if (existing.status !== "previewed") return existing;
  if (!input.confirmed) return existing;
  if (existing.preview.requiresSecondConfirmation && !input.secondConfirmation) throw new Error("Full-project recovery requires a second explicit confirmation.");
  if (existing.scope.level !== "file") throw new Error("DekoRebuild v1 executes file-level recovery only.");
  if (existing.preview.requiresProtectedConfirmation && !input.protectedConfirmation) throw new Error("Protected files require stronger explicit confirmation.");
  patchOperation(existing.operationId, { status: "running" }, projectRoot);
  const filePath = existing.scope.affectedFiles[0];
  const point = readRecoveryPoint(existing.recoveryPointId, projectRoot);
  const manifest = readRecoveryManifest(point.manifestReference, projectRoot);
  const entry = manifest.entries.find((item) => item.path === filePath);
  if (!entry) throw new Error("Recovery manifest entry no longer exists.");
  const emergency = await createRecoveryPoint({ type: "emergency", createdBy: existing.createdBy, operationId: `emergency-${existing.operationId}`, projectRoot, provisional: true });
  let quarantineReference: string | undefined;
  try {
    quarantineReference = quarantineCurrent(projectRoot, existing.operationId, filePath);
    const quarantineManifestReference = writeQuarantineManifest(projectRoot, existing.operationId, filePath, quarantineReference);
    if (!entry.deleted) {
      const destination = resolveInsideProject(projectRoot, filePath);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      const temporary = `${destination}.dekorebuild-${existing.operationId}.tmp`;
      fs.writeFileSync(temporary, readContentObject(projectRoot, entry), { mode: entry.protected ? 0o600 : 0o644 });
      fs.renameSync(temporary, destination);
      if (checksumPath(destination) !== entry.checksum) throw new Error("Restored file checksum validation failed.");
    }
    const base = await (input.validator ?? validateHealthyState)(projectRoot);
    let profilePassed = true;
    if (input.profileRunner) profilePassed = await input.profileRunner(profileForPath(filePath));
    else if (!input.validator) {
      const { runDekoScanNow } = await import("../dekoclean/scan/orchestrator.ts");
      const scan = await runDekoScanNow({ profileId: profileForPath(filePath), adminReference: existing.createdBy });
      profilePassed = ["completed", "partially-completed"].includes(scan.status);
    }
    const validation: RecoveryValidation = { ...base, radarPassed: base.radarPassed && profilePassed, snapshotCompleted: true };
    const passed = validationPassed(validation);
    const operation = patchOperation(existing.operationId, { status: passed ? "awaiting-acceptance" : "failed", emergencyRecoveryPointId: emergency.recoveryPointId, quarantineManifestReference, restoredFiles: entry.deleted ? [] : [filePath], removedFiles: entry.deleted ? [filePath] : [], validation, rollbackAvailable: true, error: passed ? undefined : "Recovery validation failed. Immediate rollback is available." }, projectRoot);
    recordAudit(operation, projectRoot);
    return operation;
  } catch (error) {
    const operation = patchOperation(existing.operationId, { status: "failed", emergencyRecoveryPointId: emergency.recoveryPointId, quarantineManifestReference: writeQuarantineManifest(projectRoot, existing.operationId, filePath, quarantineReference), rollbackAvailable: true, error: error instanceof Error ? error.message.slice(0, 500) : "Recovery failed." }, projectRoot);
    recordAudit(operation, projectRoot);
    return operation;
  }
}

function recordAudit(operation: RecoveryOperation, projectRoot: string): void {
  const filePath = operation.scope.affectedFiles[0];
  const active = resolveInsideProject(projectRoot, filePath);
  const audit: DekoCleanAuditEntry = { operationId: operation.operationId, action: "restore", adminReference: operation.createdBy, affectedPaths: operation.scope.affectedFiles, beforeChecksums: Object.fromEntries(operation.preview.currentVersions.flatMap((entry) => entry.checksum ? [[entry.path, entry.checksum]] : [])), afterChecksums: fs.existsSync(active) ? { [filePath]: checksumPath(active) } : {}, snapshotManifestId: operation.emergencyRecoveryPointId, rollbackStatus: operation.rollbackAvailable ? operation.status === "failed" ? "recommended" : "available" : "not-required", status: operation.status === "awaiting-acceptance" ? "completed" : "failed", createdAt: operation.updatedAt };
  appendDekoCleanAudit(audit, projectRoot);
  appendTimelineEntry({ id: operation.operationId, time: operation.updatedAt, operation: "restore", actor: operation.createdBy, source: "DekoRebuild", result: operation.status === "awaiting-acceptance" ? "successful" : "failed", affectedFiles: operation.scope.affectedFiles, healthScoreBefore: 0, healthScoreAfter: 0, detail: `${operation.scope.level} recovery · ${operation.status}` }, projectRoot);
}

export async function rollbackRecovery(input: { operationId: string; confirmed: boolean; projectRoot?: string; validator?: RecoveryValidator }): Promise<RecoveryOperation> {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  const operation = readRecoveryOperation(input.operationId, projectRoot);
  if (!operation) throw new Error("Recovery operation not found.");
  if (!input.confirmed) return operation;
  if (!operation.rollbackAvailable || !operation.quarantineManifestReference) throw new Error("Rollback is not available for this operation.");
  if (operation.status === "rolled-back") return operation;
  const manifestPath = path.join(recoveryRoot(projectRoot), operation.quarantineManifestReference);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as { entries: Array<{ originalPath: string; quarantineReference?: string; checksum?: string }> };
  for (const entry of manifest.entries) {
    const active = resolveInsideProject(projectRoot, entry.originalPath);
    if (fs.existsSync(active)) {
      const failedReference = path.join(recoveryRoot(projectRoot), "quarantine", operation.operationId, "recovered-version", entry.originalPath);
      fs.mkdirSync(path.dirname(failedReference), { recursive: true });
      fs.renameSync(active, failedReference);
    }
    if (entry.quarantineReference) {
      const source = path.join(recoveryRoot(projectRoot), entry.quarantineReference);
      if (!fs.existsSync(source) || (entry.checksum && checksumPath(source) !== entry.checksum)) throw new Error("Rollback quarantine checksum mismatch.");
      fs.mkdirSync(path.dirname(active), { recursive: true });
      fs.renameSync(source, active);
    }
  }
  const base = await (input.validator ?? validateHealthyState)(projectRoot);
  const validation: RecoveryValidation = { ...base, snapshotCompleted: true };
  const rolledBack = patchOperation(operation.operationId, { status: "rolled-back", validation, rollbackAvailable: false, error: validationPassed(validation) ? undefined : "Rollback completed but validation needs review." }, projectRoot);
  appendTimelineEntry({ id: `${operation.operationId}:rollback`, time: rolledBack.updatedAt, operation: "rollback", actor: operation.createdBy, source: "DekoRebuild", result: validationPassed(validation) ? "successful" : "failed", affectedFiles: operation.scope.affectedFiles, healthScoreBefore: 0, healthScoreAfter: 0, detail: "Emergency recovery rollback" }, projectRoot);
  appendRecoveryMemory({ id: `${operation.operationId}:memory`, failureSignature: failureSignature(operation.scope.affectedFiles, operation.preview.detectedProblem), scopeLevel: operation.scope.level, affectedFileCount: operation.scope.affectedFiles.length, recoveryPointId: operation.recoveryPointId, restoredFiles: operation.restoredFiles, validationPassed: Boolean(operation.validation && validationPassed(operation.validation)), rollbackResult: validationPassed(validation) ? "successful" : "failed", successfulPattern: false, createdAt: rolledBack.updatedAt }, projectRoot);
  return rolledBack;
}

export async function acceptRecovery(input: { operationId: string; confirmed: boolean; projectRoot?: string }): Promise<RecoveryOperation> {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  const operation = readRecoveryOperation(input.operationId, projectRoot);
  if (!operation) throw new Error("Recovery operation not found.");
  if (!input.confirmed) return operation;
  if (operation.status !== "awaiting-acceptance" || !operation.validation || !validationPassed(operation.validation)) throw new Error("Only a successfully validated recovery can be accepted.");
  const accepted = patchOperation(operation.operationId, { status: "accepted" }, projectRoot);
  appendTimelineEntry({ id: `${operation.operationId}:accepted`, time: accepted.updatedAt, operation: "restore", actor: operation.createdBy, source: "DekoRebuild", result: "successful", affectedFiles: operation.scope.affectedFiles, healthScoreBefore: 0, healthScoreAfter: 0, detail: "Restored state accepted by admin" }, projectRoot);
  appendRecoveryMemory({ id: `${operation.operationId}:memory`, failureSignature: failureSignature(operation.scope.affectedFiles, operation.preview.detectedProblem), scopeLevel: operation.scope.level, affectedFileCount: operation.scope.affectedFiles.length, recoveryPointId: operation.recoveryPointId, restoredFiles: operation.restoredFiles, validationPassed: true, rollbackResult: "not-required", successfulPattern: true, createdAt: accepted.updatedAt }, projectRoot);
  await createRecoveryPoint({ type: "after-repair", createdBy: operation.createdBy, operationId: `accepted-${operation.operationId}`, projectRoot, validatedState: operation.validation });
  return accepted;
}

export function cancelRecoveryOperation(input: { operationId: string; projectRoot?: string }): RecoveryOperation {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  const operation = readRecoveryOperation(input.operationId, projectRoot);
  if (!operation) throw new Error("Recovery operation not found.");
  if (operation.status !== "previewed") throw new Error("Only a previewed recovery can be cancelled without changing files.");
  return patchOperation(operation.operationId, { status: "cancelled" }, projectRoot);
}

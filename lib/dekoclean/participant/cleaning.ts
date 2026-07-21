import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { appendDekoCleanAudit } from "../auditLog.ts";
import type { DekoCleanAuditEntry } from "../types.ts";
import { getParticipantCleanProfile, PARTICIPANT_CLEAN_PROFILES } from "./profiles.ts";
import { assertParticipantMaintenanceRateLimit } from "./rateLimit.ts";
import { participantStorageRoot, readParticipantMaintenanceState, writeParticipantMaintenanceState } from "./store.ts";
import type { ParticipantCleanCandidate, ParticipantCleanPreview, ParticipantCleanProfileId, ParticipantMaintenanceOperation, ParticipantRecoveryManifest } from "./types.ts";

const PREVIEW_TTL = 30 * 60_000;
function sha256(content: Buffer | string): string { return createHash("sha256").update(content).digest("hex"); }
function now(): string { return new Date().toISOString(); }

export type SafeParticipantCleanPreview = Omit<ParticipantCleanPreview, "participantId" | "candidates"> & {
  candidates: Array<Omit<ParticipantCleanCandidate, "participantId" | "storageReference">>;
};

export function sanitizeParticipantCleanPreview(preview: ParticipantCleanPreview): SafeParticipantCleanPreview {
  return {
    previewId: preview.previewId,
    profileId: preview.profileId,
    estimatedBytes: preview.estimatedBytes,
    createdAt: preview.createdAt,
    expiresAt: preview.expiresAt,
    executable: preview.executable,
    recoveryRequired: preview.recoveryRequired,
    candidates: preview.candidates.map((candidate) => ({
      id: candidate.id,
      resourceId: candidate.resourceId,
      title: candidate.title,
      category: candidate.category,
      sizeBytes: candidate.sizeBytes,
      reason: candidate.reason,
      lastUsed: candidate.lastUsed,
      referenceCount: candidate.referenceCount,
      restoreAvailable: candidate.restoreAvailable,
      risk: candidate.risk,
      recommendedAction: candidate.recommendedAction,
      protected: candidate.protected,
    })),
  };
}

function safeTemporaryCandidates(participantId: string, projectRoot: string): ParticipantCleanCandidate[] {
  const root = path.join(participantStorageRoot(participantId, projectRoot), "temporary");
  if (!fs.existsSync(root)) return [];
  const candidates: ParticipantCleanCandidate[] = [];
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(target);
      else if (entry.isFile()) {
        const relative = path.relative(root, target);
        const stat = fs.statSync(target);
        candidates.push({ id: `clean-${sha256(relative).slice(0, 20)}`, participantId, resourceId: `temporary:${sha256(relative).slice(0, 20)}`, title: entry.name, category: "ملف مؤقت قابل لإعادة الإنشاء", sizeBytes: stat.size, reason: "ملف مؤقت داخل مساحة المعالجة الخاصة بحسابك.", lastUsed: stat.mtime.toISOString(), referenceCount: 0, restoreAvailable: true, risk: "low", recommendedAction: "نقله إلى سلة الاسترجاع", protected: false, storageReference: path.relative(participantStorageRoot(participantId, projectRoot), target) });
      }
    }
  };
  walk(root);
  return candidates;
}

export function createParticipantCleanPreview(input: { participantId: string; profileId: ParticipantCleanProfileId; projectRoot?: string }): ParticipantCleanPreview {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  const profile = getParticipantCleanProfile(input.profileId);
  assertParticipantMaintenanceRateLimit(input.participantId, "clean-preview", 20);
  const state = readParticipantMaintenanceState(input.participantId, projectRoot);
  const safeTemporary = safeTemporaryCandidates(input.participantId, projectRoot);
  const candidates = profile.id === "quick-clean" ? safeTemporary : [
    ...safeTemporary,
    ...state.quarantine.filter((item) => item.status === "released").map((item): ParticipantCleanCandidate => ({ id: `deep-${item.id}`, participantId: input.participantId, resourceId: item.resourceId, title: item.displayName, category: "مورد مؤرشف يحتاج مراجعة", sizeBytes: item.sizeBytes, reason: "مورد استقبال قديم محرر من الحجر؛ يحتاج مراجعة المراجع قبل أي إجراء.", lastUsed: item.updatedAt, referenceCount: 0, restoreAvailable: true, risk: "medium", recommendedAction: "مراجعة يدوية فقط في v1", protected: false })),
  ];
  const createdAt = now();
  const preview: ParticipantCleanPreview = { previewId: randomUUID(), participantId: input.participantId, profileId: profile.id, candidates: candidates.filter((item) => !item.protected), estimatedBytes: candidates.filter((item) => !item.protected).reduce((sum, item) => sum + item.sizeBytes, 0), createdAt, expiresAt: new Date(Date.now() + PREVIEW_TTL).toISOString(), executable: profile.executable, recoveryRequired: candidates.length > 0 };
  const operation: ParticipantMaintenanceOperation = { operationId: preview.previewId, participantId: input.participantId, type: "clean-preview", status: "awaiting-confirmation", summary: `معاينة ${profile.titleAr}: ${preview.candidates.length} عنصر. لم يتغير أي مورد.`, affectedResourceCount: preview.candidates.length, createdAt };
  const recoveryManifest: ParticipantRecoveryManifest | null = profile.id === "deep-clean" && preview.candidates.length > 0 ? {
    operationId: `participant-deep-preview-${preview.previewId}`,
    participantId: input.participantId,
    createdAt,
    entries: preview.candidates.map((candidate) => ({
      resourceId: candidate.resourceId,
      checksum: state.quarantine.find((record) => record.resourceId === candidate.resourceId)?.checksum ?? sha256(`${candidate.resourceId}:${candidate.sizeBytes}`),
      ownership: input.participantId,
      references: candidate.referenceCount,
    })),
  } : null;
  writeParticipantMaintenanceState({
    ...state,
    cleanPreviews: [...state.cleanPreviews, preview],
    recoveryManifests: recoveryManifest ? [...state.recoveryManifests, recoveryManifest] : state.recoveryManifests,
    operations: [...state.operations, operation],
  }, projectRoot);
  return preview;
}

export function executeParticipantQuickClean(input: { participantId: string; previewId: string; confirmed: boolean; candidateIds: string[]; projectRoot?: string }): { operation: ParticipantMaintenanceOperation; reclaimedBytes: number; manifest: ParticipantRecoveryManifest } {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  if (!input.confirmed) throw new Error("يلزم تأكيد التنظيف صراحة.");
  assertParticipantMaintenanceRateLimit(input.participantId, "clean-execute", 10);
  const state = readParticipantMaintenanceState(input.participantId, projectRoot);
  const preview = state.cleanPreviews.find((item) => item.previewId === input.previewId && item.participantId === input.participantId);
  if (!preview || preview.profileId !== "quick-clean" || !preview.executable) throw new Error("معاينة التنظيف غير صالحة للتنفيذ.");
  if (new Date(preview.expiresAt).getTime() < Date.now()) throw new Error("انتهت صلاحية معاينة التنظيف. أنشئ معاينة جديدة.");
  const requested = new Set(input.candidateIds.slice(0, 250));
  const candidates = preview.candidates.filter((item) => requested.has(item.id));
  if (candidates.length !== requested.size || candidates.some((item) => item.participantId !== input.participantId || item.protected || item.risk !== "low" || !item.storageReference)) throw new Error("تحتوي العملية على مورد غير مسموح بتنظيفه.");
  const operationId = `participant-clean-${randomUUID()}`;
  const root = participantStorageRoot(input.participantId, projectRoot);
  const recycleRoot = path.join(root, "recycle", operationId);
  const entries: ParticipantRecoveryManifest["entries"] = [];
  let reclaimedBytes = 0;
  for (const candidate of candidates) {
    const source = path.resolve(root, candidate.storageReference!);
    const relative = path.relative(root, source);
    if (relative.startsWith("..") || path.isAbsolute(relative) || !source.startsWith(path.join(root, "temporary")) || !fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error("تعذر التحقق من مورد التنظيف المؤقت.");
    const content = fs.readFileSync(source);
    const recycleReference = path.join("recycle", operationId, candidate.storageReference!);
    const target = path.join(root, recycleReference);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.renameSync(source, target);
    reclaimedBytes += content.length;
    entries.push({ resourceId: candidate.resourceId, checksum: sha256(content), ownership: input.participantId, references: candidate.referenceCount, recycleReference });
  }
  const manifest: ParticipantRecoveryManifest = { operationId, participantId: input.participantId, createdAt: now(), entries };
  fs.mkdirSync(recycleRoot, { recursive: true });
  fs.writeFileSync(path.join(recycleRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  const operation: ParticipantMaintenanceOperation = { operationId, participantId: input.participantId, type: "clean-execute", status: "completed", summary: `اكتمل التنظيف الآمن ونُقلت ${entries.length} عناصر إلى سلة الاسترجاع.`, affectedResourceCount: entries.length, createdAt: now() };
  writeParticipantMaintenanceState({ ...state, recoveryManifests: [...state.recoveryManifests, manifest], operations: [...state.operations, operation] }, projectRoot);
  const audit: DekoCleanAuditEntry = { operationId, action: "quarantine", adminReference: `participant:${input.participantId}`, affectedPaths: entries.map((item) => item.resourceId), beforeChecksums: Object.fromEntries(entries.map((item) => [item.resourceId, item.checksum])), afterChecksums: {}, snapshotManifestId: operationId, rollbackStatus: "available", status: "completed", createdAt: operation.createdAt };
  appendDekoCleanAudit(audit, projectRoot);
  return { operation, reclaimedBytes, manifest };
}

export function getParticipantCleaningOverview(participantId: string, projectRoot = process.cwd()) {
  const state = readParticipantMaintenanceState(participantId, projectRoot);
  const latestPreview = state.cleanPreviews.at(-1);
  return { profiles: PARTICIPANT_CLEAN_PROFILES, latestPreview: latestPreview ? sanitizeParticipantCleanPreview(latestPreview) : null };
}

/** Test/dev integration point for processors to register only regenerable temporary output. */
export function registerParticipantTemporaryFile(participantId: string, name: string, content: Buffer, projectRoot = process.cwd()): string {
  const safeName = path.basename(name).replace(/[^a-zA-Z0-9._-]/g, "-") || `${randomUUID()}.tmp`;
  const target = path.join(participantStorageRoot(participantId, projectRoot), "temporary", `${randomUUID()}-${safeName}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, { mode: 0o600 });
  return target;
}

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { getParticipantProfile } from "../../participants/registry.ts";
import { executeParticipantScanRun, startParticipantScan } from "./orchestrator.ts";
import { assertParticipantMaintenanceRateLimit } from "./rateLimit.ts";
import { appendAdminEscalation, participantStorageRoot, readParticipantMaintenanceState, writeParticipantMaintenanceState } from "./store.ts";
import type { ParticipantAdminEscalation, ParticipantMaintenanceOperation, ParticipantQuarantineRecord } from "./types.ts";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const BLOCKED_EXTENSIONS = new Set([".exe", ".com", ".bat", ".cmd", ".scr", ".ps1", ".sh", ".js", ".mjs", ".jar", ".msi", ".vbs"]);
const MIME_EXTENSIONS: Record<string, string[]> = { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"], "application/pdf": [".pdf"], "text/plain": [".txt"] };

function sha256(content: Buffer): string { return createHash("sha256").update(content).digest("hex"); }

function classify(filename: string, mimeType: string): { classification: ParticipantQuarantineRecord["classification"]; severity: ParticipantQuarantineRecord["severity"]; status: ParticipantQuarantineRecord["status"]; reason: string } {
  const normalized = filename.toLowerCase();
  const extension = path.extname(normalized);
  const doubleExtension = /\.(?:pdf|png|jpe?g|webp|docx?|xlsx?)\.(?:exe|com|bat|cmd|scr|js|vbs)$/i.test(normalized);
  if (BLOCKED_EXTENSIONS.has(extension) || doubleExtension) return { classification: "blocked-type", severity: "critical", status: "blocked", reason: "نوع الملف أو امتداده المركب غير مسموح. لم يتم تشغيل الملف." };
  const expected = MIME_EXTENSIONS[mimeType];
  if (!expected || !expected.includes(extension)) return { classification: "requires-review", severity: "high", status: "admin-review", reason: "نوع الملف المعلن لا يطابق امتداده أو غير مدعوم. بقي الملف في الحجر." };
  return { classification: "requires-review", severity: "info", status: "released", reason: "اكتمل فحص بيانات الملف الأساسية دون تشغيله. لا يتوفر موصل مكافحة برمجيات ضارة موثوق حاليًا." };
}

type SafeParticipantQuarantine = Omit<ParticipantQuarantineRecord, "participantId" | "storageReference" | "checksum">;

function sanitizeQuarantineRecord(record: ParticipantQuarantineRecord): SafeParticipantQuarantine {
  return {
    id: record.id,
    resourceId: record.resourceId,
    displayName: record.displayName,
    safeReason: record.safeReason,
    classification: record.classification,
    severity: record.severity,
    status: record.status,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    scanId: record.scanId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    reviewRequestedAt: record.reviewRequestedAt,
  };
}

export async function intakeParticipantUpload(input: { participantId: string; filename: string; mimeType: string; content: Buffer; projectRoot?: string }): Promise<{ quarantine: SafeParticipantQuarantine; scanId: string }> {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  assertParticipantMaintenanceRateLimit(input.participantId, "intake", 20);
  if (!input.content.length || input.content.length > MAX_UPLOAD_BYTES) throw new Error("حجم الملف غير مسموح لمرحلة الاستقبال.");
  const classification = classify(path.basename(input.filename), input.mimeType);
  const timestamp = new Date().toISOString();
  const recordId = randomUUID();
  const safeName = path.basename(input.filename).replace(/[^a-zA-Z0-9._-]/g, "-") || "upload.bin";
  const storageReference = path.join("intake", recordId, safeName);
  const target = path.join(participantStorageRoot(input.participantId, projectRoot), storageReference);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, input.content, { mode: 0o600 });
  const record: ParticipantQuarantineRecord = { id: recordId, participantId: input.participantId, resourceId: `upload:${recordId}`, displayName: path.basename(input.filename).slice(0, 160), safeReason: classification.reason, classification: classification.classification, severity: classification.severity, status: classification.status, checksum: sha256(input.content), storageReference, mimeType: input.mimeType.slice(0, 120), sizeBytes: input.content.length, createdAt: timestamp, updatedAt: timestamp };
  let state = readParticipantMaintenanceState(input.participantId, projectRoot);
  const containment = classification.severity === "critical" ? { active: true, participantId: input.participantId, reason: "رفع ملف محظور يحتاج مراجعة المدير.", affectedResourceCount: 1, startedAt: timestamp, adminReviewStatus: "pending" as const } : state.containment;
  const intakeOperation: ParticipantMaintenanceOperation = { operationId: `intake-${recordId}`, participantId: input.participantId, type: "intake-validation", status: "completed", summary: classification.reason, affectedResourceCount: 1, createdAt: timestamp };
  state = writeParticipantMaintenanceState({ ...state, quarantine: [...state.quarantine, record], containment, operations: [...state.operations, intakeOperation, ...(containment.active && !state.containment.active ? [{ operationId: `containment-${recordId}`, participantId: input.participantId, type: "containment" as const, status: "awaiting-confirmation" as const, summary: containment.reason ?? "وضع الاحتواء", affectedResourceCount: 1, createdAt: timestamp }] : [])] }, projectRoot);
  if (["high", "critical"].includes(classification.severity)) {
    const participant = getParticipantProfile(input.participantId);
    const escalation: ParticipantAdminEscalation = { id: `escalation-${randomUUID()}`, participantId: input.participantId, participantDisplayName: participant?.name ?? "مشارك", resourceIds: [record.resourceId], classification: record.classification, checksums: [record.checksum], safeSummary: record.safeReason, quarantineStatus: record.status, containmentActive: containment.active, status: "new", createdAt: timestamp };
    appendAdminEscalation(escalation, projectRoot);
  }
  const scan = startParticipantScan({ participantId: input.participantId, profileId: "security", projectRoot, defer: false });
  const completed = await executeParticipantScanRun(scan.scanId, input.participantId, projectRoot);
  const refreshed = readParticipantMaintenanceState(input.participantId, projectRoot);
  writeParticipantMaintenanceState({ ...refreshed, quarantine: refreshed.quarantine.map((item) => item.id === record.id ? { ...item, scanId: completed.scanId, updatedAt: new Date().toISOString() } : item) }, projectRoot);
  return { quarantine: sanitizeQuarantineRecord(record), scanId: completed.scanId };
}

export function requestParticipantQuarantineReview(input: { participantId: string; quarantineId: string; projectRoot?: string }): SafeParticipantQuarantine {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  assertParticipantMaintenanceRateLimit(input.participantId, "review", 20);
  const state = readParticipantMaintenanceState(input.participantId, projectRoot);
  const current = state.quarantine.find((item) => item.id === input.quarantineId && item.participantId === input.participantId);
  if (!current) throw new Error("لم يتم العثور على ملف الحجر.");
  const timestamp = new Date().toISOString();
  const updated: ParticipantQuarantineRecord = { ...current, status: current.status === "blocked" ? "blocked" : "admin-review", reviewRequestedAt: timestamp, updatedAt: timestamp };
  const operation: ParticipantMaintenanceOperation = { operationId: `review-${randomUUID()}`, participantId: input.participantId, type: "quarantine-review", status: "awaiting-confirmation", summary: "تم إرسال طلب مراجعة آمن إلى المدير.", affectedResourceCount: 1, createdAt: timestamp };
  writeParticipantMaintenanceState({ ...state, quarantine: state.quarantine.map((item) => item.id === current.id ? updated : item), operations: [...state.operations, operation] }, projectRoot);
  const participant = getParticipantProfile(input.participantId);
  appendAdminEscalation({ id: `escalation-${randomUUID()}`, participantId: input.participantId, participantDisplayName: participant?.name ?? "مشارك", resourceIds: [current.resourceId], classification: current.classification, checksums: [current.checksum], safeSummary: "طلب المشارك مراجعة ملف محجور.", scanId: current.scanId, quarantineStatus: updated.status, containmentActive: state.containment.active, status: "new", createdAt: timestamp }, projectRoot);
  return sanitizeQuarantineRecord(updated);
}

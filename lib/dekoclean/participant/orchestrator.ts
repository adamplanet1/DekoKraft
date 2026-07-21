import { createHash, randomUUID } from "node:crypto";
import path from "node:path";

import { appendDekoCleanAudit } from "../auditLog.ts";
import type { DekoCleanAuditEntry } from "../types.ts";
import { getParticipantProfile } from "../../participants/registry.ts";
import { getParticipantScanProfile, PARTICIPANT_SCAN_PROFILES } from "./profiles.ts";
import { assertParticipantMaintenanceRateLimit } from "./rateLimit.ts";
import { collectParticipantResources } from "./scope.ts";
import { appendAdminEscalation, readParticipantMaintenanceState, writeParticipantMaintenanceState } from "./store.ts";
import type { ParticipantFinding, ParticipantMaintenanceOperation, ParticipantMaintenanceSummary, ParticipantResource, ParticipantScanProfileId, ParticipantScanRun } from "./types.ts";

function id(value: string): string { return createHash("sha256").update(value).digest("hex").slice(0, 24); }
function now(): string { return new Date().toISOString(); }

function finding(input: Omit<ParticipantFinding, "id" | "createdAt">): ParticipantFinding {
  return { ...input, id: `pmf-${id(`${input.participantId}:${input.scanId}:${input.category}:${input.title}:${input.affectedResourceIds.slice().sort().join("|")}`)}`, createdAt: now() };
}

function assetFindings(participantId: string, scanId: string, resources: ParticipantResource[]): ParticipantFinding[] {
  const results: ParticipantFinding[] = [];
  const images = resources.filter((resource) => resource.category === "image" || resource.category === "store-asset");
  const missing = images.filter((resource) => resource.reference && resource.sizeBytes === undefined);
  if (missing.length) results.push(finding({ participantId, scanId, category: "assets", severity: "medium", title: "صور أو موارد غير متاحة", reason: "تعذر الوصول إلى مرجع واحد أو أكثر من موارد حسابك.", affectedResourceIds: missing.map((item) => item.resourceId), affectedResourceNames: missing.map((item) => item.displayName), recommendedAction: "راجع الصورة أو أعد رفعها من صفحة المنتج." }));
  const unsupported = images.filter((resource) => resource.reference && !/\.(?:png|jpe?g|webp|gif|svg)$/i.test(resource.reference));
  if (unsupported.length) results.push(finding({ participantId, scanId, category: "assets", severity: "low", title: "صيغة صورة تحتاج مراجعة", reason: "بعض موارد الصور لا تستخدم صيغة صور مدعومة بوضوح.", affectedResourceIds: unsupported.map((item) => item.resourceId), affectedResourceNames: unsupported.map((item) => item.displayName), recommendedAction: "استخدم PNG أو JPEG أو WebP عند الإمكان." }));
  const byChecksum = new Map<string, ParticipantResource[]>();
  for (const image of images) byChecksum.set(image.checksum, [...(byChecksum.get(image.checksum) ?? []), image]);
  const duplicates = [...byChecksum.values()].filter((group) => group.length > 1).flat();
  if (duplicates.length) results.push(finding({ participantId, scanId, category: "assets", severity: "low", title: "صور متطابقة", reason: "عُثر على موارد صور متطابقة بالبصمة داخل حسابك.", affectedResourceIds: duplicates.map((item) => item.resourceId), affectedResourceNames: duplicates.map((item) => item.displayName), recommendedAction: "راجع النسخ المتطابقة؛ لن تُحذف تلقائيًا." }));
  const products = resources.filter((resource) => resource.category === "product");
  const withoutImages = products.filter((product) => !images.some((image) => image.resourceId.startsWith(`product-image:${product.resourceId.slice(8)}:`)));
  if (withoutImages.length) results.push(finding({ participantId, scanId, category: "assets", severity: "medium", title: "منتجات بلا صورة رئيسية", reason: "يوجد منتج لا يملك صورة مرتبطة في بيانات حسابك.", affectedResourceIds: withoutImages.map((item) => item.resourceId), affectedResourceNames: withoutImages.map((item) => item.displayName), recommendedAction: "أضف صورة رئيسية من إدارة المنتج." }));
  return results;
}

function securityFindings(participantId: string, scanId: string, resources: ParticipantResource[]): ParticipantFinding[] {
  const risky = resources.filter((resource) => resource.category === "document");
  if (!risky.length) return [];
  return [finding({ participantId, scanId, category: "quarantine", severity: "high", title: "ملفات في الحجر تحتاج مراجعة", reason: "وجد الفحص ملفات مرفوعة ما زالت محجورة أو محظورة. لم يتم تشغيل محتواها.", affectedResourceIds: risky.map((item) => item.resourceId), affectedResourceNames: risky.map((item) => item.displayName), recommendedAction: "راجع السبب الآمن أو اطلب مراجعة المدير." })];
}

function performanceFindings(participantId: string, scanId: string, resources: ParticipantResource[]): ParticipantFinding[] {
  const oversized = resources.filter((resource) => resource.category === "image" && (resource.sizeBytes ?? 0) > 3 * 1024 * 1024);
  const results = oversized.length ? [finding({ participantId, scanId, category: "performance", severity: "medium", title: "صور كبيرة الحجم", reason: "قد تؤثر بعض صور حسابك في سرعة التحميل.", affectedResourceIds: oversized.map((item) => item.resourceId), affectedResourceNames: oversized.map((item) => item.displayName), recommendedAction: "أنشئ نسخة محسنة للعرض مع إبقاء الأصل محفوظًا." })] : [];
  results.push(finding({ participantId, scanId, category: "performance", severity: "info", title: "قياسات المتصفح غير متاحة", reason: "لا يوجد Performance Monitor فعلي يقدم Page Load أو API Timing لهذا الحساب حاليًا.", affectedResourceIds: [], affectedResourceNames: [], recommendedAction: "تبقى القيمة غير متاحة حتى تسجيل قياس فعلي." }));
  return results;
}

function saveEscalations(participantId: string, findings: ParticipantFinding[], projectRoot: string): void {
  const profile = getParticipantProfile(participantId);
  for (const item of findings.filter((entry) => ["high", "critical"].includes(entry.severity))) {
    appendAdminEscalation({ id: `escalation-${randomUUID()}`, participantId, participantDisplayName: profile?.name ?? "مشارك", resourceIds: item.affectedResourceIds.slice(0, 100), classification: item.category, checksums: [], safeSummary: item.reason, scanId: item.scanId, quarantineStatus: item.category === "quarantine" ? "admin-review" : undefined, containmentActive: item.severity === "critical", status: "new", createdAt: now() }, projectRoot);
  }
}

export function startParticipantScan(input: { participantId: string; profileId: ParticipantScanProfileId; projectRoot?: string; defer?: boolean }): ParticipantScanRun {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  getParticipantScanProfile(input.profileId);
  assertParticipantMaintenanceRateLimit(input.participantId, "scan", 10);
  const state = readParticipantMaintenanceState(input.participantId, projectRoot);
  const active = state.scans.find((run) => ["queued", "running"].includes(run.status));
  if (active) throw new Error("يوجد فحص جارٍ بالفعل داخل حسابك.");
  const timestamp = now();
  const run: ParticipantScanRun = { scanId: randomUUID(), participantId: input.participantId, profileId: input.profileId, status: "queued", phase: "تمت جدولة الفحص", progress: 0, startedAt: timestamp, updatedAt: timestamp, scannedResources: 0, skippedResources: 0, findingIds: [] };
  writeParticipantMaintenanceState({ ...state, scans: [...state.scans, run] }, projectRoot);
  if (input.defer !== false) setTimeout(() => { void executeParticipantScanRun(run.scanId, input.participantId, projectRoot); }, 0);
  return run;
}

export async function executeParticipantScanRun(scanId: string, participantId: string, projectRoot = process.cwd()): Promise<ParticipantScanRun> {
  let state = readParticipantMaintenanceState(participantId, projectRoot);
  const current = state.scans.find((run) => run.scanId === scanId && run.participantId === participantId);
  if (!current) throw new Error("لم يتم العثور على الفحص.");
  if (!current || !["queued", "running"].includes(current.status)) return current;
  const patch = (updates: Partial<ParticipantScanRun>) => {
    const updated = { ...current, ...updates, updatedAt: now() };
    state = writeParticipantMaintenanceState({ ...state, scans: state.scans.map((run) => run.scanId === scanId ? updated : run) }, projectRoot);
    return updated;
  };
  try {
    patch({ status: "running", phase: "جمع موارد حساب المشارك", progress: 15 });
    state = readParticipantMaintenanceState(participantId, projectRoot);
    if (state.scans.find((run) => run.scanId === scanId)?.cancellationRequested) return patch({ status: "cancelled", phase: "أُلغي الفحص بأمان", progress: 0, completedAt: now() });
    const all = collectParticipantResources(participantId, projectRoot);
    const profile = getParticipantScanProfile(current.profileId);
    const eligible = profile.incremental && Object.keys(state.resourceHashes).length ? all.filter((resource) => state.resourceHashes[resource.resourceId] !== resource.checksum) : all;
    patch({ phase: "تشغيل الكواشف المقيدة بحسابك", progress: 55, scannedResources: eligible.length, skippedResources: all.length - eligible.length });
    let findings: ParticipantFinding[] = [];
    if (["quick", "full", "assets"].includes(profile.id)) findings.push(...assetFindings(participantId, scanId, eligible));
    if (["full", "security"].includes(profile.id)) findings.push(...securityFindings(participantId, scanId, eligible));
    if (profile.id === "performance") findings.push(...performanceFindings(participantId, scanId, eligible));
    findings = [...new Map(findings.map((item) => [item.id, item])).values()];
    saveEscalations(participantId, findings, projectRoot);
    const completedAt = now();
    const done: ParticipantScanRun = { ...current, status: "completed", phase: "اكتمل الفحص", progress: 100, updatedAt: completedAt, completedAt, scannedResources: eligible.length, skippedResources: all.length - eligible.length, findingIds: findings.map((item) => item.id), summary: `اكتمل الفحص داخل حسابك فقط: ${findings.length} نتيجة مجمعة.` };
    const operation: ParticipantMaintenanceOperation = { operationId: scanId, participantId, type: "scan", status: "completed", summary: done.summary ?? "اكتمل الفحص.", affectedResourceCount: eligible.length, createdAt: completedAt };
    const hashes = Object.fromEntries(all.map((resource) => [resource.resourceId, resource.checksum]));
    writeParticipantMaintenanceState({ ...state, scans: state.scans.map((run) => run.scanId === scanId ? done : run), findings: [...state.findings.filter((item) => item.scanId !== scanId), ...findings], resourceHashes: hashes, operations: [...state.operations, operation] }, projectRoot);
    const audit: DekoCleanAuditEntry = { operationId: scanId, action: "validate", adminReference: `participant:${participantId}`, affectedPaths: eligible.map((item) => item.resourceId).slice(0, 200), beforeChecksums: {}, afterChecksums: Object.fromEntries(eligible.slice(0, 200).map((item) => [item.resourceId, item.checksum])), rollbackStatus: "not-required", status: "completed", createdAt: completedAt };
    appendDekoCleanAudit(audit, projectRoot);
    return done;
  } catch (error) {
    const failed = patch({ status: "failed", phase: "فشل الفحص", error: error instanceof Error ? error.message.slice(0, 240) : "تعذر إكمال الفحص.", completedAt: now() });
    return failed;
  }
}

export function cancelParticipantScan(scanId: string, participantId: string, projectRoot = process.cwd()): ParticipantScanRun {
  const state = readParticipantMaintenanceState(participantId, projectRoot);
  const current = state.scans.find((run) => run.scanId === scanId && run.participantId === participantId);
  if (!current) throw new Error("لم يتم العثور على الفحص.");
  const updated: ParticipantScanRun = current.status === "queued" ? { ...current, status: "cancelled", phase: "أُلغي الفحص بأمان", progress: 0, cancellationRequested: true, updatedAt: now(), completedAt: now() } : { ...current, cancellationRequested: true, updatedAt: now() };
  writeParticipantMaintenanceState({ ...state, scans: state.scans.map((run) => run.scanId === scanId ? updated : run) }, projectRoot);
  return updated;
}

export function getParticipantMaintenanceSummary(participantId: string, projectRoot = process.cwd()): ParticipantMaintenanceSummary {
  const state = readParticipantMaintenanceState(participantId, projectRoot);
  const latest = [...state.scans].sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  const activeScan = state.scans.find((run) => ["queued", "running"].includes(run.status)) ?? null;
  const activeFindings = state.findings.filter((item) => !item.affectedResourceIds.every((id) => state.quarantine.some((record) => record.resourceId === id && record.status === "released")));
  const cleanableBytes = state.cleanPreviews.at(-1)?.estimatedBytes ?? 0;
  return { participantId, lastScanAt: latest?.completedAt ?? latest?.startedAt, status: state.containment.active ? "containment" : activeScan ? "scanning" : activeFindings.some((item) => ["high", "critical"].includes(item.severity)) ? "review" : "stable", reviewCount: activeFindings.length, quarantineCount: state.quarantine.filter((item) => !["released", "deleted-by-admin"].includes(item.status)).length, cleanableBytes, activeScan, containment: state.containment };
}

export function getParticipantMaintenanceOverview(participantId: string, projectRoot = process.cwd()) {
  const state = readParticipantMaintenanceState(participantId, projectRoot);
  return {
    summary: getParticipantMaintenanceSummary(participantId, projectRoot),
    profiles: PARTICIPANT_SCAN_PROFILES,
    scans: state.scans.slice(-30).reverse(),
    findings: state.findings.slice(-100).reverse(),
    quarantine: state.quarantine.filter((item) => item.status !== "deleted-by-admin").map((item) => ({
      id: item.id,
      resourceId: item.resourceId,
      displayName: item.displayName,
      safeReason: item.safeReason,
      classification: item.classification,
      severity: item.severity,
      status: item.status,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      scanId: item.scanId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      reviewRequestedAt: item.reviewRequestedAt,
    })),
    operations: state.operations.slice(-100).reverse(),
  };
}

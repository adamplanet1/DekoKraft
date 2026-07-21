import { randomUUID } from "node:crypto";
import path from "node:path";

import { organizeFindings } from "../findingEngine.ts";
import { replaceDetectedFindings, saveDetectedFindings } from "../findingStore.ts";
import { recordHealthScore } from "../healthScore.ts";
import { recordDekoIndexSnapshot } from "../missionControl.ts";
import { createDekoCleanConfig } from "../config.ts";
import { scanProject } from "../scanner.ts";
import { appendTimelineEntry } from "../timeline.ts";
import type { DekoCleanFinding } from "../types.ts";
import { DEKO_SCAN_DETECTORS, type DekoScanDetectorContext } from "./detectors.ts";
import { compareFileState, readFileState, writeFileState } from "./fileState.ts";
import { DEKO_SCAN_PROFILES, getDekoScanProfile } from "./profiles.ts";
import { activeScanRun, latestScanRun, patchScanRun, readScanRun, readScanRuns, writeScanRun } from "./runStore.ts";
import type { DekoScanDetectorId, DekoScanOverview, DekoScanProfileId, DekoScanRun } from "./types.ts";

const MAX_DETECTOR_CONCURRENCY = 2;

function safeError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown detector error.";
  return message.replace(/(?:sk-[A-Za-z0-9_-]{12,}|OPENAI_API_KEY\s*=\s*\S+)/gi, "[redacted]").slice(0, 300);
}

function projectRoot(): string {
  return path.resolve(process.cwd());
}

function cancelled(scanId: string, root: string): boolean {
  return Boolean(readScanRun(scanId, root)?.cancellationRequested);
}

function progressFor(completed: number, total: number): number {
  return Math.min(92, 20 + Math.round((completed / Math.max(1, total)) * 68));
}

function recordTerminalTimeline(run: DekoScanRun, adminReference: string, projectRoot: string, result: "successful" | "failed", detail: string): void {
  const health = recordHealthScore(projectRoot).value;
  appendTimelineEntry({ id: run.scanId, time: run.completedAt ?? new Date().toISOString(), operation: run.profileId === "security" ? "security-scan" : "scan", actor: adminReference, source: `DekoClean Smart Scan:${run.profileId}`, result, affectedFiles: [], healthScoreBefore: run.healthBefore ?? health, healthScoreAfter: run.healthAfter ?? health, detail }, projectRoot);
}

function profileSummary(profileId: DekoScanProfileId, findings: DekoCleanFinding[], failures: number, securityAvailable?: boolean, performanceAvailable?: boolean): string {
  if (profileId === "security" && securityAvailable === false) return `لم يتم العثور على أداة حماية متصلة. اكتمل فحص سلامة المشروع ووجد ${findings.length} سببًا جذريًا.`;
  if (profileId === "performance" && performanceAvailable === false) return "لا توجد قياسات أداء فعلية متاحة؛ بقيت القيم غير متاحة ولم تُنشأ snapshot وهمية.";
  return `اكتمل ${failures ? "جزئيًا" : "بنجاح"}: ${findings.length} نتيجة مجمعة، وتشمل ${findings.reduce((sum, finding) => sum + finding.count, 0)} مرجع ملف داخل النتائج.`;
}

async function executeDetectors(
  scanId: string,
  detectorIds: DekoScanDetectorId[],
  context: DekoScanDetectorContext,
): Promise<{ findings: DekoCleanFinding[]; failures: DekoScanRun["detectorFailures"]; scannedFiles: number; skippedFiles: number; securityAvailable?: boolean; performanceAvailable?: boolean }> {
  const findings: DekoCleanFinding[] = [];
  const failures: DekoScanRun["detectorFailures"] = [];
  let scannedFiles = 0;
  let skippedFiles = 0;
  let securityAvailable: boolean | undefined;
  let performanceAvailable: boolean | undefined;
  let cursor = 0;
  let completed = 0;

  async function worker(): Promise<void> {
    while (cursor < detectorIds.length && !cancelled(scanId, context.projectRoot)) {
      const detectorId = detectorIds[cursor++];
      patchScanRun(scanId, { phase: `تشغيل الكاشف: ${detectorId}`, progress: progressFor(completed, detectorIds.length) }, context.projectRoot);
      try {
        const result = await DEKO_SCAN_DETECTORS[detectorId](context);
        findings.push(...result.findings);
        scannedFiles += result.scannedFiles ?? 0;
        skippedFiles += result.skippedFiles ?? 0;
        if (result.securityConnectorAvailable !== undefined) securityAvailable = result.securityConnectorAvailable;
        if (result.performanceMeasurementsAvailable !== undefined) performanceAvailable = result.performanceMeasurementsAvailable;
      } catch (error) {
        failures.push({ detectorId, error: safeError(error) });
      }
      completed += 1;
      const grouped = organizeFindings(findings);
      patchScanRun(scanId, { progress: progressFor(completed, detectorIds.length), scannedFiles, skippedFiles, findingsFound: findings.reduce((sum, finding) => sum + finding.count, 0), groupedFindings: grouped.length, detectorFailures: failures }, context.projectRoot);
    }
  }

  await Promise.all(Array.from({ length: Math.min(MAX_DETECTOR_CONCURRENCY, detectorIds.length) }, () => worker()));
  return { findings, failures, scannedFiles, skippedFiles, securityAvailable, performanceAvailable };
}

export async function executeDekoScanRun(scanId: string, adminReference: string): Promise<DekoScanRun> {
  const root = projectRoot();
  const initial = readScanRun(scanId, root);
  if (!initial) throw new Error("DekoClean scan run not found.");
  if (!['queued', 'running'].includes(initial.status)) return initial;
  const started = Date.now();
  try {
    patchScanRun(scanId, { status: "running", phase: "تحضير الفحص", progress: 5 }, root);
    if (cancelled(scanId, root)) {
      const stopped = patchScanRun(scanId, { status: "cancelled", phase: "أُلغي الفحص قبل تشغيل الكواشف", progress: 0, completedAt: new Date().toISOString(), durationMs: Date.now() - started }, root);
      recordTerminalTimeline(stopped, adminReference, root, "failed", "Scan cancelled safely before detector execution; last successful report preserved.");
      return stopped;
    }
    const profile = getDekoScanProfile(initial.profileId);
    const config = createDekoCleanConfig(root);
    patchScanRun(scanId, { phase: "اكتشاف الملفات وتصفية المسارات المولدة", progress: 10 }, root);
    const scan = scanProject(config);
    const comparison = compareFileState(scan, readFileState(root));
    const forceFull = Boolean(initial.forceFull) || (initial.profileId === "quick" && !comparison.hasBaseline);
    patchScanRun(scanId, { phase: "حساب بصمات الملفات", progress: 16, changedFiles: comparison.changed.size, deletedFiles: comparison.deleted.length }, root);
    const healthBefore = recordHealthScore(root).value;
    patchScanRun(scanId, { healthBefore }, root);
    const result = await executeDetectors(scanId, [...profile.detectorIds], { projectRoot: root, config, scan, profileId: profile.id, changedFiles: comparison.changed, deletedFiles: comparison.deleted, forceFull });
    if (cancelled(scanId, root)) {
      const stopped = patchScanRun(scanId, { status: "cancelled", phase: "أُلغي الفحص بأمان؛ بقي آخر تقرير ناجح دون تغيير", progress: 0, completedAt: new Date().toISOString(), durationMs: Date.now() - started, detectorFailures: result.failures }, root);
      recordTerminalTimeline(stopped, adminReference, root, "failed", `Scan cancelled safely after ${result.scannedFiles} detector checks; last successful report preserved.`);
      return stopped;
    }
    patchScanRun(scanId, { phase: "تجميع النتائج حسب السبب الجذري", progress: 94 }, root);
    const grouped = organizeFindings(result.findings);
    patchScanRun(scanId, { phase: "حفظ التقرير وتحديث العدادات", progress: 97 }, root);
    const saved = profile.id === "full" ? replaceDetectedFindings(grouped, root) : saveDetectedFindings(grouped, root);
    const runFindingFingerprints = new Set(grouped.map((finding) => finding.fingerprint || finding.id));
    const savedForRun = saved.filter((finding) => runFindingFingerprints.has(finding.fingerprint || finding.id));
    if (profile.id === "quick" || profile.id === "full") writeFileState(root, scan);
    const healthAfter = recordHealthScore(root).value;
    const completedAt = new Date().toISOString();
    const status = result.failures.length ? "partially-completed" : "completed";
    const summary = profileSummary(profile.id, savedForRun, result.failures.length, result.securityAvailable, result.performanceAvailable);
    const completed = patchScanRun(scanId, { status, phase: "اكتمل الفحص", progress: 100, completedAt, durationMs: Date.now() - started, scannedFiles: result.scannedFiles || scan.files.length, skippedFiles: result.skippedFiles, findingsFound: grouped.reduce((sum, finding) => sum + finding.count, 0), groupedFindings: grouped.length, detectorFailures: result.failures, findingIds: savedForRun.map((finding) => finding.id), securityConnectorAvailable: result.securityAvailable, performanceMeasurementsAvailable: result.performanceAvailable, healthAfter, summary }, root);
    appendTimelineEntry({ id: scanId, time: completedAt, operation: profile.id === "security" ? "security-scan" : "scan", actor: adminReference, source: `DekoClean Smart Scan:${profile.id}`, result: status === "completed" ? "successful" : "failed", affectedFiles: savedForRun.flatMap((finding) => finding.affectedFiles), healthScoreBefore: healthBefore, healthScoreAfter: healthAfter, detail: `${profile.titleEn} · raw ${completed.findingsFound} · grouped ${completed.groupedFindings} · detector failures ${result.failures.length}` }, root);
    if (profile.id !== "performance" || result.performanceAvailable) {
      await recordDekoIndexSnapshot({ operationId: scanId, trigger: profile.id === "performance" ? "performance-measurement" : "scan" }, root).catch((error) => console.error("[DekoClean] DekoBrain summary snapshot failed.", safeError(error)));
    }
    return completed;
  } catch (error) {
    const failed = patchScanRun(scanId, { status: "failed", phase: "فشل الفحص", error: safeError(error), completedAt: new Date().toISOString(), durationMs: Date.now() - started }, root);
    recordTerminalTimeline(failed, adminReference, root, "failed", `Scan failed: ${failed.error}`);
    return failed;
  }
}

export function startDekoScan(input: { profileId: DekoScanProfileId; forceFull?: boolean; adminReference: string }): DekoScanRun {
  const root = projectRoot();
  const existing = activeScanRun(root);
  if (existing) throw new Error(`يوجد فحص قيد التشغيل بالفعل: ${existing.scanId}`);
  const profile = getDekoScanProfile(input.profileId);
  const timestamp = new Date().toISOString();
  const run: DekoScanRun = { scanId: randomUUID(), profileId: profile.id, status: "queued", phase: input.forceFull ? "تمت جدولة فحص كامل" : "تمت جدولة الفحص", progress: 0, startedAt: timestamp, updatedAt: timestamp, scannedFiles: 0, skippedFiles: 0, findingsFound: 0, groupedFindings: 0, detectorFailures: [], findingIds: [], changedFiles: 0, deletedFiles: 0, forceFull: Boolean(input.forceFull) };
  writeScanRun(run, root);
  setTimeout(() => { void executeDekoScanRun(run.scanId, input.adminReference); }, 0);
  return run;
}

export async function runDekoScanNow(input: { profileId: DekoScanProfileId; adminReference?: string }): Promise<DekoScanRun> {
  const run = startDekoScan({ profileId: input.profileId, adminReference: input.adminReference ?? "dekoclean-test" });
  return executeDekoScanRun(run.scanId, input.adminReference ?? "dekoclean-test");
}

export function getDekoScanOverview(): DekoScanOverview {
  const root = projectRoot();
  const runs = readScanRuns(root);
  return { profiles: [...DEKO_SCAN_PROFILES], runs: runs.slice(0, 40), latestRun: latestScanRun(undefined, root), activeRun: activeScanRun(root) };
}

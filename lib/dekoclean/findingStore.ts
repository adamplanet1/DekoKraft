import fs from "node:fs";
import path from "node:path";

import { randomUUID } from "node:crypto";
import type { DekoCleanFinding, FindingLifecycle, FindingLifecycleAction, FindingLifecycleEvent, FindingStatus } from "./types.ts";
import { mergeFindings } from "../dekoradar/finding.ts";
import { isIgnoredFindingPath, organizeFindings, type DekoCleanFindingInput } from "./findingEngine.ts";

function storePath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "findings.json");
}
function lifecyclePath(projectRoot: string): string { return path.join(projectRoot, ".dekoclean", "state", "finding-lifecycle.json"); }
export function findingLifecycleStatus(finding: DekoCleanFinding): FindingStatus {
  if (finding.lifecycle?.status) return finding.lifecycle.status;
  if (finding.status === "resolved") return "RESOLVED";
  if (finding.status === "ignored") return "IGNORED";
  if (finding.status === "failed") return "FAILED";
  return "OPEN";
}
function withLifecycle(finding: DekoCleanFinding): DekoCleanFinding {
  if (finding.lifecycle) return finding;
  return { ...finding, lifecycle: { status: findingLifecycleStatus(finding), updatedAt: new Date().toISOString() } };
}

export function readFindings(projectRoot = process.cwd()): DekoCleanFinding[] {
  const target = storePath(projectRoot);
  if (!fs.existsSync(target)) return [];
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(target, "utf8"));
    return Array.isArray(parsed)
      ? organizeFindings(parsed as DekoCleanFindingInput[]).map(withLifecycle)
        .filter((finding) => finding.affectedFiles.every((file) => !isIgnoredFindingPath(file)))
      : [];
  } catch { return []; }
}

export function readFindingLifecycleEvents(projectRoot = process.cwd()): FindingLifecycleEvent[] {
  try { const parsed: unknown = JSON.parse(fs.readFileSync(lifecyclePath(projectRoot), "utf8")); return Array.isArray(parsed) ? parsed as FindingLifecycleEvent[] : []; } catch { return []; }
}
function writeLifecycleEvents(events: FindingLifecycleEvent[], projectRoot: string): void {
  fs.mkdirSync(path.dirname(lifecyclePath(projectRoot)), { recursive: true });
  fs.writeFileSync(lifecyclePath(projectRoot), `${JSON.stringify(events.slice(-2000), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}
export function updateFindingLifecycle(id: string, patch: { status: FindingStatus; action?: FindingLifecycleAction; reason?: string; message?: string; success: boolean; executionLogId?: string }, projectRoot = process.cwd()): DekoCleanFinding {
  const findings = readFindings(projectRoot);
  const index = findings.findIndex((finding) => finding.id === id);
  if (index < 0) throw new Error("DekoClean finding not found.");
  const current = findings[index];
  const previousStatus = findingLifecycleStatus(current);
  if ((patch.status === "IN_PROGRESS" || patch.status === "VALIDATING") && (previousStatus === "IN_PROGRESS" || previousStatus === "VALIDATING")) throw new Error("Finding action already in progress.");
  const now = new Date().toISOString();
  const lifecycle: FindingLifecycle = { status: patch.status, lastAction: patch.action, updatedAt: now, resolvedAt: patch.status === "RESOLVED" ? now : undefined, failureReason: patch.reason };
  findings[index] = { ...current, lifecycle, status: patch.status === "RESOLVED" ? "resolved" : patch.status === "FAILED" ? "failed" : current.status };
  writeFindings(findings, projectRoot);
  if (patch.action) writeLifecycleEvents([...readFindingLifecycleEvents(projectRoot), { id: randomUUID(), findingId: id, action: patch.action, previousStatus, nextStatus: patch.status, startedAt: now, completedAt: now, success: patch.success, message: patch.message ?? patch.reason, executionLogId: patch.executionLogId }], projectRoot);
  return findings[index];
}

export function writeFindings(findings: DekoCleanFinding[], projectRoot = process.cwd()): void {
  const target = storePath(projectRoot);
  const organized = organizeFindings(findings)
    .filter((finding) => finding.affectedFiles.every((file) => !isIgnoredFindingPath(file)));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(organized, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

export function saveDetectedFindings(findings: DekoCleanFinding[], projectRoot = process.cwd()): DekoCleanFinding[] {
  const previous = readFindings(projectRoot);
  const incoming = organizeFindings(findings);
  const incomingFingerprints = new Set(incoming.map((finding) => finding.fingerprint));
  const recurring = new Map(previous.map((finding) => [finding.fingerprint, finding]));
  const reconciledIncoming = incoming.map((finding) => { const old = recurring.get(finding.fingerprint); return old ? { ...finding, id: old.id, findingId: old.findingId ?? old.id } : finding; });
  const merged = organizeFindings(mergeFindings(previous, reconciledIncoming)).map((finding) => {
    const old = previous.find((entry) => entry.fingerprint === finding.fingerprint);
    if (old && !incomingFingerprints.has(finding.fingerprint)) return old;
    const seen = new Date().toISOString();
    const evidenceHash = JSON.stringify(finding.currentEvidence ?? finding.evidence);
    const priorEvidenceHash = old ? JSON.stringify(old.currentEvidence ?? old.evidence) : undefined;
    const changed = priorEvidenceHash !== undefined && priorEvidenceHash !== evidenceHash;
    const reopened = old?.lifecycle?.status === "RESOLVED";
    const eventType = !old ? "detected" : reopened ? "reopened" : changed ? "evidence-changed" : "seen-again";
    const timeline = [...(old?.timeline ?? finding.timeline ?? [])];
    const last = timeline.at(-1);
    if (last?.type === eventType && !changed) timeline[timeline.length - 1] = { ...last, repeatCount: (last.repeatCount ?? 1) + 1, lastRepeatedAt: seen };
    else timeline.push({ id: randomUUID(), findingId: finding.id, type: eventType, startedAt: seen, completedAt: seen, evidenceHash, statusBefore: old?.lifecycle?.status, statusAfter: finding.lifecycle?.status ?? "OPEN" });
    const evidenceHistory = [...(old?.evidenceHistory ?? finding.evidenceHistory ?? [])];
    if (!old || changed) evidenceHistory.push({ id: randomUUID(), findingId: finding.id, capturedAt: seen, evidenceHash, evidence: finding.currentEvidence ?? finding.evidence, changedFromPrevious: Boolean(old) });
    return { ...finding, lifecycle: reopened ? { status: "OPEN" as const, updatedAt: seen, lastAction: undefined, resolvedAt: undefined } : finding.lifecycle, status: reopened ? "new" : finding.status, firstSeenAt: old?.firstSeenAt ?? finding.firstSeenAt ?? seen, lastSeenAt: seen, occurrenceCount: (old?.occurrenceCount ?? 0) + 1, timeline, evidenceHistory, currentEvidence: finding.currentEvidence ?? finding.evidence, schemaVersion: 1 as const };
  });
  writeFindings(merged, projectRoot);
  return merged;
}

export function replaceDetectedFindings(findings: DekoCleanFinding[], projectRoot = process.cwd()): DekoCleanFinding[] {
  const retained = readFindings(projectRoot).filter((finding) => ["ignored", "resolved"].includes(finding.status));
  const merged = organizeFindings(mergeFindings(retained, organizeFindings(findings)));
  writeFindings(merged, projectRoot);
  return merged;
}

export function updateFindingStatus(id: string, status: DekoCleanFinding["status"], projectRoot = process.cwd()): DekoCleanFinding {
  const findings = readFindings(projectRoot);
  const index = findings.findIndex((finding) => finding.id === id);
  if (index < 0) throw new Error("DekoClean finding not found.");
  const lifecycleStatus = status === "resolved" ? "RESOLVED" : status === "ignored" ? "IGNORED" : status === "failed" ? "FAILED" : "OPEN";
  findings[index] = { ...findings[index], status, lifecycle: { ...findings[index].lifecycle, status: lifecycleStatus, updatedAt: new Date().toISOString(), resolvedAt: lifecycleStatus === "RESOLVED" ? new Date().toISOString() : undefined } };
  writeFindings(findings, projectRoot);
  return findings[index];
}

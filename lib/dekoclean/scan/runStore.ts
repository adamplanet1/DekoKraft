import fs from "node:fs";
import path from "node:path";

import type { DekoScanProfileId, DekoScanRun } from "./types.ts";

const MAX_RUNS = 200;

function storePath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "scan-runs.json");
}

export function readScanRuns(projectRoot = process.cwd()): DekoScanRun[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(storePath(projectRoot), "utf8"));
    return Array.isArray(parsed) ? (parsed as DekoScanRun[]).sort((a, b) => b.startedAt.localeCompare(a.startedAt)) : [];
  } catch {
    return [];
  }
}

export function readScanRun(scanId: string, projectRoot = process.cwd()): DekoScanRun | null {
  return readScanRuns(projectRoot).find((run) => run.scanId === scanId) ?? null;
}

export function latestScanRun(profileId?: DekoScanProfileId, projectRoot = process.cwd()): DekoScanRun | null {
  return readScanRuns(projectRoot).find((run) => !profileId || run.profileId === profileId) ?? null;
}

export function activeScanRun(projectRoot = process.cwd()): DekoScanRun | null {
  return readScanRuns(projectRoot).find((run) => run.status === "queued" || run.status === "running") ?? null;
}

export function writeScanRun(run: DekoScanRun, projectRoot = process.cwd()): DekoScanRun {
  const runs = readScanRuns(projectRoot);
  const index = runs.findIndex((entry) => entry.scanId === run.scanId);
  if (index >= 0) runs[index] = run;
  else runs.unshift(run);
  const target = storePath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(runs.sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, MAX_RUNS), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return run;
}

export function patchScanRun(scanId: string, patch: Partial<DekoScanRun>, projectRoot = process.cwd()): DekoScanRun {
  const current = readScanRun(scanId, projectRoot);
  if (!current) throw new Error("DekoClean scan run not found.");
  return writeScanRun({ ...current, ...patch, scanId: current.scanId, updatedAt: new Date().toISOString() }, projectRoot);
}

export function requestScanCancellation(scanId: string, projectRoot = process.cwd()): DekoScanRun {
  const current = readScanRun(scanId, projectRoot);
  if (!current) throw new Error("DekoClean scan run not found.");
  if (!['queued', 'running'].includes(current.status)) return current;
  return patchScanRun(scanId, { cancellationRequested: true, phase: "جارٍ إيقاف الفحص بأمان" }, projectRoot);
}

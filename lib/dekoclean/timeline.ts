import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { DekoCleanAuditEntry, TimelineEntry } from "./types.ts";

function timelinePath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "maintenance-timeline.json");
}

export function readMaintenanceTimeline(projectRoot = process.cwd()): TimelineEntry[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(timelinePath(projectRoot), "utf8"));
    return Array.isArray(parsed) ? (parsed as TimelineEntry[]).sort((a, b) => b.time.localeCompare(a.time)) : [];
  } catch { return []; }
}

export function appendTimelineEntry(entry: Omit<TimelineEntry, "id"> & { id?: string }, projectRoot = process.cwd()): TimelineEntry {
  const entries = readMaintenanceTimeline(projectRoot);
  if (entry.id) {
    const existing = entries.find((item) => item.id === entry.id);
    if (existing) return existing;
  }
  const completed: TimelineEntry = { ...entry, id: entry.id ?? randomUUID() };
  entries.push(completed);
  const target = timelinePath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(entries.sort((a, b) => a.time.localeCompare(b.time)).slice(-2000), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return completed;
}

export function appendAuditTimeline(entry: DekoCleanAuditEntry, before: number, after: number, projectRoot = process.cwd()): void {
  appendTimelineEntry({
    time: entry.createdAt, operation: entry.action, actor: entry.adminReference, source: "DekoClean",
    result: entry.status === "completed" ? "successful" : "failed", affectedFiles: entry.affectedPaths,
    healthScoreBefore: before, healthScoreAfter: after,
    detail: entry.validationResult ? `Validation: ${entry.validationResult.integrityPassed ? "passed" : "failed"}` : undefined,
  }, projectRoot);
  for (const command of entry.validationResult?.commands ?? []) {
    const operation = command.command.includes("lint") ? "lint" : command.command.includes("build") ? "build" : null;
    if (operation) appendTimelineEntry({
      time: entry.validationResult?.createdAt ?? entry.createdAt, operation, actor: entry.adminReference,
      source: "Validation", result: command.success ? "successful" : "failed", affectedFiles: entry.affectedPaths,
      healthScoreBefore: before, healthScoreAfter: after, detail: command.command,
    }, projectRoot);
  }
}

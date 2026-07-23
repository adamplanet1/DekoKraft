import fs from "node:fs";
import path from "node:path";

import type { PerformanceSnapshot } from "./performance.ts";

export interface IgnoredFindingRecord {
  findingId: string;
  ignoredAt: string;
  ignoredBy: string;
  expiresAt?: string;
  reason?: string;
}

function stateRoot(projectRoot: string): string {
  return path.join(path.resolve(projectRoot), ".dekoclean", "state");
}

function jsonPath(projectRoot: string, name: "ignore.json" | "performance-history.json"): string {
  return path.join(stateRoot(projectRoot), name);
}

function atomicJsonWrite(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, target);
}

function readArray<T>(target: string): T[] {
  if (!fs.existsSync(target)) {
    atomicJsonWrite(target, []);
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(target, "utf8"));
    if (Array.isArray(parsed)) return parsed as T[];
  } catch { /* replace an unreadable action-history file with a safe empty store */ }
  atomicJsonWrite(target, []);
  return [];
}

export function ensureDekoCleanActionStorage(projectRoot = process.cwd()): void {
  readArray<IgnoredFindingRecord>(jsonPath(projectRoot, "ignore.json"));
  readArray<PerformanceSnapshot>(jsonPath(projectRoot, "performance-history.json"));
  fs.mkdirSync(path.join(path.resolve(projectRoot), ".dekoclean", "snapshots"), { recursive: true, mode: 0o700 });
  fs.mkdirSync(path.join(path.resolve(projectRoot), ".dekoclean", "manifests"), { recursive: true, mode: 0o700 });
  fs.mkdirSync(path.join(path.resolve(projectRoot), ".dekoclean", "repair", "backups"), { recursive: true, mode: 0o700 });
}

export function recordIgnoredFindings(findingIds: string[], ignoredBy: string, projectRoot = process.cwd()): IgnoredFindingRecord[] {
  const target = jsonPath(projectRoot, "ignore.json");
  const previous = readArray<IgnoredFindingRecord>(target);
  const ignoredAt = new Date().toISOString();
  const additions = findingIds.map((findingId) => ({ findingId, ignoredAt, ignoredBy: ignoredBy.slice(0, 160) }));
  const ids = new Set(additions.map((entry) => entry.findingId));
  const next = [...previous.filter((entry) => !ids.has(entry.findingId)), ...additions].slice(-2000);
  atomicJsonWrite(target, next);
  return next;
}

export function recordTemporarilyIgnoredFinding(
  findingId: string,
  ignoredBy: string,
  expiresAt: string,
  reason: string,
  projectRoot = process.cwd(),
): IgnoredFindingRecord[] {
  const expiration = new Date(expiresAt);
  if (!Number.isFinite(expiration.getTime()) || expiration.getTime() <= Date.now()) throw new Error("Temporary ignore expiration must be in the future.");
  const target = jsonPath(projectRoot, "ignore.json");
  const previous = readArray<IgnoredFindingRecord>(target);
  const record: IgnoredFindingRecord = {
    findingId,
    ignoredAt: new Date().toISOString(),
    ignoredBy: ignoredBy.slice(0, 160),
    expiresAt: expiration.toISOString(),
    reason: reason.slice(0, 500),
  };
  atomicJsonWrite(target, [...previous.filter((entry) => entry.findingId !== findingId), record].slice(-2000));
  return readArray<IgnoredFindingRecord>(target);
}

export function readPerformanceHistory(projectRoot = process.cwd()): PerformanceSnapshot[] {
  return readArray<PerformanceSnapshot>(jsonPath(projectRoot, "performance-history.json"));
}

export function writePerformanceHistory(snapshots: PerformanceSnapshot[], projectRoot = process.cwd()): PerformanceSnapshot[] {
  const target = jsonPath(projectRoot, "performance-history.json");
  const valid = snapshots
    .filter((entry) => entry && typeof entry.id === "string" && typeof entry.timestamp === "string" && (entry.source === "browser" || entry.source === "build"))
    .filter((entry, index, all) => all.findIndex((candidate) => candidate.id === entry.id) === index)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 30);
  atomicJsonWrite(target, valid);
  return valid;
}

export function clearPerformanceHistory(projectRoot = process.cwd()): void {
  atomicJsonWrite(jsonPath(projectRoot, "performance-history.json"), []);
}

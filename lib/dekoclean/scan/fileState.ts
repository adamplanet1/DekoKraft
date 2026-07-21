import fs from "node:fs";
import path from "node:path";

import type { DekoCleanScanResult } from "../types.ts";

type FileState = Record<string, string>;

function statePath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "scan-file-state.json");
}

function signature(sizeBytes: number, lastModifiedAt: string): string {
  return `${sizeBytes}:${lastModifiedAt}`;
}

export function currentFileState(scan: DekoCleanScanResult): FileState {
  return Object.fromEntries(scan.files.map((file) => [file.path, signature(file.sizeBytes, file.lastModifiedAt)]));
}

export function readFileState(projectRoot: string): FileState | null {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(statePath(projectRoot), "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as FileState : null;
  } catch {
    return null;
  }
}

export function compareFileState(scan: DekoCleanScanResult, previous: FileState | null): { changed: Set<string>; deleted: string[]; hasBaseline: boolean } {
  const current = currentFileState(scan);
  if (!previous) return { changed: new Set(Object.keys(current)), deleted: [], hasBaseline: false };
  const changed = new Set(Object.entries(current).filter(([file, value]) => previous[file] !== value).map(([file]) => file));
  const deleted = Object.keys(previous).filter((file) => !(file in current));
  return { changed, deleted, hasBaseline: true };
}

export function writeFileState(projectRoot: string, scan: DekoCleanScanResult): void {
  const target = statePath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(currentFileState(scan), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

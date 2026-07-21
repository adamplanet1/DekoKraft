import fs from "node:fs";
import path from "node:path";

import type { RecoveryMemoryEntry } from "./types.ts";

function memoryPath(projectRoot: string): string { return path.join(projectRoot, ".dekoclean", "recovery", "recovery-memory.json"); }

export function readRecoveryMemory(projectRoot = process.cwd()): RecoveryMemoryEntry[] {
  try { const parsed: unknown = JSON.parse(fs.readFileSync(memoryPath(projectRoot), "utf8")); return Array.isArray(parsed) ? parsed as RecoveryMemoryEntry[] : []; }
  catch { return []; }
}

export function appendRecoveryMemory(entry: RecoveryMemoryEntry, projectRoot = process.cwd()): RecoveryMemoryEntry {
  const entries = readRecoveryMemory(projectRoot);
  const existing = entries.find((item) => item.id === entry.id);
  if (existing) return existing;
  const safe: RecoveryMemoryEntry = { ...entry, restoredFiles: entry.restoredFiles.slice(0, 1000) };
  const target = memoryPath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify([...entries, safe].slice(-1000), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return safe;
}

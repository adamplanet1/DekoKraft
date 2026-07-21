import fs from "node:fs";
import path from "node:path";

import type { SecurityMemoryEntry } from "./types.ts";

function memoryPath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "security-memory.json");
}

export function readSecurityMemory(projectRoot = process.cwd()): SecurityMemoryEntry[] {
  const target = memoryPath(projectRoot);
  if (!fs.existsSync(target)) return [];
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(target, "utf8"));
    return Array.isArray(parsed) ? parsed as SecurityMemoryEntry[] : [];
  } catch { return []; }
}

export function saveSecurityMemoryEntry(entry: SecurityMemoryEntry, projectRoot = process.cwd()): SecurityMemoryEntry {
  if (!entry.confirmedByAdmin || !entry.confirmedAt) throw new Error("Security Memory requires explicit admin confirmation.");
  if (entry.result === "failed" || (entry.result === "successful" && !entry.validationPassed)) {
    throw new Error("Failed or unvalidated treatment cannot become an approved Security Memory recipe.");
  }
  if (entry.fileHashSha256 && !/^[a-f\d]{64}$/i.test(entry.fileHashSha256)) throw new Error("Invalid SHA-256 fingerprint.");
  const safeEntry: SecurityMemoryEntry = {
    ...entry,
    treatmentRecipe: {
      description: entry.treatmentRecipe.description.slice(0, 500),
      allowedActions: entry.treatmentRecipe.allowedActions,
      validationCommands: entry.treatmentRecipe.validationCommands,
      protectedPathsChecked: entry.treatmentRecipe.protectedPathsChecked,
    },
  };
  const entries = readSecurityMemory(projectRoot).filter((candidate) => candidate.id !== safeEntry.id);
  entries.push(safeEntry);
  const target = memoryPath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(entries, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return safeEntry;
}

export function disableSecurityMemoryEntry(id: string, projectRoot = process.cwd()): SecurityMemoryEntry {
  const entries = readSecurityMemory(projectRoot);
  const index = entries.findIndex((entry) => entry.id === id);
  if (index < 0) throw new Error("Security Memory entry not found.");
  entries[index] = { ...entries[index], enabled: false };
  const target = memoryPath(projectRoot);
  fs.writeFileSync(target, `${JSON.stringify(entries, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return entries[index];
}

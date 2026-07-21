import fs from "node:fs";
import path from "node:path";

import type { DekoCleanAuditEntry } from "./types.ts";

function auditPath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "audit-log.json");
}

export function readDekoCleanAudit(projectRoot = process.cwd()): DekoCleanAuditEntry[] {
  const target = auditPath(projectRoot);
  if (!fs.existsSync(target)) return [];
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(target, "utf8"));
    return Array.isArray(parsed) ? parsed as DekoCleanAuditEntry[] : [];
  } catch { return []; }
}

export function appendDekoCleanAudit(entry: DekoCleanAuditEntry, projectRoot = process.cwd()): void {
  const entries = readDekoCleanAudit(projectRoot);
  entries.push(entry);
  const target = auditPath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(entries.slice(-1000), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

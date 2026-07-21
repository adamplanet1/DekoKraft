import { createHash } from "node:crypto";

import type { DekoCleanFinding, DekoCleanFindingType } from "../dekoclean/types.ts";

export function findingId(type: DekoCleanFindingType, paths: string[], evidenceKey = ""): string {
  return `finding-${createHash("sha256").update(`${type}:${[...paths].sort().join("|")}:${evidenceKey}`).digest("hex").slice(0, 16)}`;
}

export function sanitizeEvidence(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").slice(0, 400);
}

export function mergeFindings(existing: DekoCleanFinding[], incoming: DekoCleanFinding[]): DekoCleanFinding[] {
  const byId = new Map(existing.map((finding) => [finding.id, finding]));
  for (const finding of incoming) {
    const previous = byId.get(finding.id);
    byId.set(finding.id, previous && ["ignored", "resolved"].includes(previous.status)
      ? { ...finding, status: previous.status }
      : finding);
  }
  return [...byId.values()].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
}

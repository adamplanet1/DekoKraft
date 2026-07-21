import { createHash } from "node:crypto";
import fs from "node:fs";

import type { ScannedFile } from "./types.ts";

export interface DuplicateMatch {
  path: string;
  duplicateOf: string;
  checksum: string;
}

export function checksumFile(absolutePath: string): string {
  return createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex");
}

function canonicalScore(file: ScannedFile): number {
  const suspicious = /(?:^|[-_.\s])(copy|old|backup|final-final)(?:[-_.\s]|$)/i.test(file.path);
  return (file.protected ? 10_000 : 0) + (suspicious ? -1_000 : 0) - file.path.length;
}

export function detectExactDuplicates(files: ScannedFile[]): DuplicateMatch[] {
  const bySize = new Map<number, ScannedFile[]>();
  for (const file of files) {
    if (file.sizeBytes === 0 || file.symbolicLink) continue;
    const group = bySize.get(file.sizeBytes) ?? [];
    group.push(file);
    bySize.set(file.sizeBytes, group);
  }

  const duplicates: DuplicateMatch[] = [];
  for (const sameSize of bySize.values()) {
    if (sameSize.length < 2) continue;
    const byHash = new Map<string, ScannedFile[]>();
    for (const file of sameSize) {
      const checksum = checksumFile(file.absolutePath);
      const group = byHash.get(checksum) ?? [];
      group.push(file);
      byHash.set(checksum, group);
    }

    for (const [checksum, matches] of byHash) {
      if (matches.length < 2) continue;
      const ordered = [...matches].sort((a, b) => canonicalScore(b) - canonicalScore(a));
      const canonical = ordered[0];
      for (const duplicate of ordered.slice(1)) {
        duplicates.push({ path: duplicate.path, duplicateOf: canonical.path, checksum });
      }
    }
  }

  return duplicates;
}

import path from "node:path";

import type { DuplicateMatch } from "./duplicateDetector.ts";
import { isFrameworkEntry, type UnusedFinding } from "./unusedDetector.ts";
import type {
  DekoCleanCandidate, DekoCleanConfig, DekoCleanScanResult, DekoCleanUsageGraph, ScannedFile,
} from "./types.ts";

function isTemporary(filePath: string): boolean {
  const name = path.posix.basename(filePath);
  return name === ".DS_Store" || /\.(?:tmp|temp|swp|swo|bak)$/i.test(name) ||
    /^\.#/.test(name) || /~$/.test(name);
}

function isLog(file: ScannedFile): boolean {
  return file.extension === ".log" || /(?:^|\/)logs?\//i.test(file.path);
}

function isBackupCopy(filePath: string): boolean {
  const name = path.posix.basename(filePath, path.posix.extname(filePath));
  return /(?:^|[-_.\s])(copy|old|backup|final-final)(?:[-_.\s]|$)/i.test(name);
}

function duplicateNeedsReview(file: ScannedFile, config: DekoCleanConfig): boolean {
  const name = path.posix.basename(file.path);
  const isSemanticPlaceholder = /^(?:readme(?:\.[^.]+)?|\.keep|\.gitkeep)$/i.test(name);
  const isExpectedImageVariant = /(?:[-_.](?:600|1200|\d+x\d+|thumb|small|large))\.[^.]+$/i.test(name);
  const isSource = config.sourceExtensions.includes(file.extension);

  return isFrameworkEntry(file.path) || isSemanticPlaceholder || isExpectedImageVariant ||
    (isSource && !isBackupCopy(file.path));
}

export function classifyCandidates(
  scan: DekoCleanScanResult,
  graph: DekoCleanUsageGraph,
  duplicates: DuplicateMatch[],
  unused: UnusedFinding[],
  config: DekoCleanConfig,
): DekoCleanCandidate[] {
  const candidates = new Map<string, DekoCleanCandidate>();
  const duplicateByPath = new Map(duplicates.map((match) => [match.path, match]));
  const unusedByPath = new Map(unused.map((finding) => [finding.path, finding]));

  for (const directory of scan.directoryCandidates) {
    candidates.set(directory.path, {
      path: directory.path, kind: "directory", sizeBytes: directory.sizeBytes, extension: "",
      risk: "safe", reasons: [directory.reason], referencedBy: [], recommendation: "quarantine",
    });
  }

  for (const file of scan.files) {
    const referencedBy = graph[file.path]?.referencedBy ?? [];
    const duplicate = duplicateByPath.get(file.path);
    const unusedFinding = unusedByPath.get(file.path);

    if (file.protected) {
      candidates.set(file.path, {
        path: file.path, kind: "file", sizeBytes: file.sizeBytes, extension: file.extension,
        risk: "protected", reasons: ["protected-business-data"], referencedBy,
        lastModifiedAt: file.lastModifiedAt, recommendation: "keep",
      });
      continue;
    }

    if (isTemporary(file.path) || isLog(file)) {
      candidates.set(file.path, {
        path: file.path, kind: "file", sizeBytes: file.sizeBytes, extension: file.extension,
        risk: "safe",
        reasons: [isLog(file) && file.sizeBytes >= config.largeLogThresholdBytes ? "large-log" : "temporary-file"],
        referencedBy, lastModifiedAt: file.lastModifiedAt, recommendation: "quarantine",
      });
      continue;
    }

    if (duplicate) {
      const safe = referencedBy.length === 0 && !duplicateNeedsReview(file, config);
      candidates.set(file.path, {
        path: file.path, kind: "file", sizeBytes: file.sizeBytes, extension: file.extension,
        risk: safe ? "safe" : "review", reasons: ["duplicate-content"], referencedBy,
        duplicateOf: duplicate.duplicateOf, checksum: duplicate.checksum,
        lastModifiedAt: file.lastModifiedAt, recommendation: safe ? "quarantine" : "review",
      });
      continue;
    }

    if (isBackupCopy(file.path) && referencedBy.length === 0) {
      candidates.set(file.path, {
        path: file.path, kind: "file", sizeBytes: file.sizeBytes, extension: file.extension,
        risk: "safe", reasons: ["backup-copy"], referencedBy,
        lastModifiedAt: file.lastModifiedAt, recommendation: "quarantine",
      });
      continue;
    }

    if (unusedFinding) {
      candidates.set(file.path, {
        path: file.path, kind: "file", sizeBytes: file.sizeBytes, extension: file.extension,
        risk: "review", reasons: [unusedFinding.reason], referencedBy,
        lastModifiedAt: file.lastModifiedAt, recommendation: "review",
      });
    }
  }

  const riskOrder = { safe: 0, review: 1, protected: 2, unknown: 3 } as const;
  return [...candidates.values()].sort((a, b) =>
    riskOrder[a.risk] - riskOrder[b.risk] || b.sizeBytes - a.sizeBytes || a.path.localeCompare(b.path));
}

import { classifyCandidates } from "./classifier.ts";
import { createDekoCleanConfig } from "./config.ts";
import { detectExactDuplicates } from "./duplicateDetector.ts";
import { writeReport } from "./report.ts";
import { scanProject } from "./scanner.ts";
import type { DekoCleanConfig, DekoCleanReport, DekoCleanScanResult } from "./types.ts";
import { detectLikelyUnused } from "./unusedDetector.ts";
import { buildUsageGraph } from "./usageGraph.ts";

export function buildDekoCleanReport(scan: DekoCleanScanResult, config: DekoCleanConfig): DekoCleanReport {
  const usageGraph = buildUsageGraph(scan.files, config);
  const duplicates = detectExactDuplicates(scan.files);
  const unused = detectLikelyUnused(scan.files, usageGraph, config);
  const candidates = classifyCandidates(scan, usageGraph, duplicates, unused, config);
  const safeCandidates = candidates.filter((candidate) => candidate.risk === "safe");

  const report: DekoCleanReport = {
    scannedFiles: scan.files.length,
    totalSizeBytes: scan.totalSizeBytes,
    safeCandidates: safeCandidates.length,
    reviewCandidates: candidates.filter((candidate) => candidate.risk === "review").length,
    protectedFiles: candidates.filter((candidate) => candidate.risk === "protected").length,
    duplicateFiles: candidates.filter((candidate) => candidate.reasons.includes("duplicate-content")).length,
    estimatedRecoverableBytes: safeCandidates.reduce((total, candidate) => total + candidate.sizeBytes, 0),
    regenerableDependenciesBytes: scan.regenerableDependenciesBytes,
    candidates,
    largestFiles: [...scan.files]
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
      .slice(0, 20)
      .map((file) => ({ path: file.path, sizeBytes: file.sizeBytes })),
    createdAt: new Date().toISOString(),
  };

  writeReport(config.projectRoot, report);
  return report;
}

export function runDekoCleanScan(config: DekoCleanConfig = createDekoCleanConfig()): DekoCleanReport {
  return buildDekoCleanReport(scanProject(config), config);
}

export * from "./config.ts";
export * from "./types.ts";

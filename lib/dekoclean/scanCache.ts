import fs from "node:fs";
import path from "node:path";

import { isIgnoredFindingPath, organizeFindings } from "./findingEngine.ts";
import type { DekoCleanFinding, DekoCleanReport } from "./types.ts";

const CACHE_VERSION = 1;

interface DekoCleanScanCache {
  version: number;
  fingerprint: string;
  findings: DekoCleanFinding[];
  report: DekoCleanReport;
  createdAt: string;
}

function cachePath(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "state", "smart-scan-cache.json");
}

export function readScanCache(projectRoot: string, fingerprint: string): DekoCleanScanCache | null {
  const target = cachePath(projectRoot);
  if (!fs.existsSync(target)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(target, "utf8")) as DekoCleanScanCache;
    if (parsed.version !== CACHE_VERSION || parsed.fingerprint !== fingerprint || !Array.isArray(parsed.findings)) return null;
    const findings = organizeFindings(parsed.findings).filter((finding) => finding.affectedFiles.every((file) => !isIgnoredFindingPath(file)));
    return { ...parsed, findings };
  } catch {
    return null;
  }
}

export function writeScanCache(projectRoot: string, fingerprint: string, findings: DekoCleanFinding[], report: DekoCleanReport): void {
  const target = cachePath(projectRoot);
  const cache: DekoCleanScanCache = {
    version: CACHE_VERSION,
    fingerprint,
    findings: organizeFindings(findings),
    report,
    createdAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(cache, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

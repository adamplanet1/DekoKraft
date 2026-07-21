import fs from "node:fs";
import path from "node:path";

import type { SecurityConnector, SecurityScanFinding } from "./types.ts";

function isSeverity(value: unknown): value is SecurityScanFinding["severity"] {
  return ["info", "low", "medium", "high", "critical"].includes(String(value));
}

function parseStructuredReport(value: unknown, source: string): SecurityScanFinding[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (!isSeverity(record.severity) || typeof record.detectedAt !== "string") return [];
    return [{
      source: typeof record.source === "string" ? record.source : source,
      severity: record.severity,
      detectedAt: record.detectedAt,
      engineVersion: typeof record.engineVersion === "string" ? record.engineVersion : undefined,
      signatureVersion: typeof record.signatureVersion === "string" ? record.signatureVersion : undefined,
      threatName: typeof record.threatName === "string" ? record.threatName : undefined,
      threatFamily: typeof record.threatFamily === "string" ? record.threatFamily : undefined,
      category: typeof record.category === "string" ? record.category as SecurityScanFinding["category"] : undefined,
      filePath: typeof record.filePath === "string" ? record.filePath : undefined,
      fileHashSha256: typeof record.fileHashSha256 === "string" && /^[a-f\d]{64}$/i.test(record.fileHashSha256) ? record.fileHashSha256 : undefined,
      detectionId: typeof record.detectionId === "string" ? record.detectionId : undefined,
      recommendedAction: typeof record.recommendedAction === "string" ? record.recommendedAction : undefined,
      rawReportReference: typeof record.rawReportReference === "string" ? record.rawReportReference : undefined,
    }];
  });
}

export function createLocalStructuredReportConnector(projectRoot = process.cwd()): SecurityConnector {
  const reportDirectory = path.join(projectRoot, ".dekoclean", "security-reports");
  const available = fs.existsSync(reportDirectory) && fs.readdirSync(reportDirectory).some((name) => name.endsWith(".json"));
  return {
    id: "local-structured-reports",
    label: "Structured local security reports",
    available,
    async getStatus() { return { available }; },
    async scanProject() {
      if (!available) return [];
      const findings: SecurityScanFinding[] = [];
      for (const name of fs.readdirSync(reportDirectory).filter((entry) => entry.endsWith(".json"))) {
        try {
          const parsed: unknown = JSON.parse(fs.readFileSync(path.join(reportDirectory, name), "utf8"));
          findings.push(...parseStructuredReport(parsed, name));
        } catch {
          // Invalid connector reports are ignored and never executed.
        }
      }
      return findings;
    },
  };
}

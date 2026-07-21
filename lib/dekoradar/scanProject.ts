import { createHash } from "node:crypto";

import { createDekoCleanConfig } from "../dekoclean/config.ts";
import { enrichFinding, isIgnoredFindingPath, organizeFindings } from "../dekoclean/findingEngine.ts";
import { readFindings, replaceDetectedFindings } from "../dekoclean/findingStore.ts";
import { buildDekoCleanReport } from "../dekoclean/index.ts";
import { readScanCache, writeScanCache } from "../dekoclean/scanCache.ts";
import { scanProject } from "../dekoclean/scanner.ts";
import type { DekoCleanConfig, DekoCleanFinding, DekoCleanScanResult } from "../dekoclean/types.ts";
import { findingId } from "./finding.ts";
import { monitorProtectedIntegrity } from "./integrityMonitor.ts";
import { detectReferenceFindings } from "./referenceMonitor.ts";
import { detectBrokenRoutes } from "./routeMonitor.ts";
import { createLocalStructuredReportConnector } from "./securityAlertAdapter.ts";
import type { DekoRadarScanResult, SecurityScanFinding } from "./types.ts";

function reportFindings(scan: DekoCleanScanResult, config: DekoCleanConfig): { findings: DekoCleanFinding[]; report: ReturnType<typeof buildDekoCleanReport> } {
  const report = buildDekoCleanReport(scan, config);
  const findings = report.candidates.filter((candidate) => candidate.risk !== "protected").map((candidate) => enrichFinding({
    id: findingId(candidate.reasons.includes("duplicate-content") ? "duplicate-file" : "unused-file", [candidate.path], candidate.checksum ?? candidate.reasons.join(",")),
    type: candidate.reasons.includes("duplicate-content") ? "duplicate-file" : "unused-file",
    severity: candidate.risk === "safe" ? "low" : "info",
    title: candidate.reasons.includes("duplicate-content") ? "ملف مطابق مكرر" : "ملف يحتاج مراجعة الاستخدام",
    explanation: candidate.risk === "safe" ? "مرشح آمن للمعاينة والحجر بعد تأكيد المدير." : "المرجع غير مؤكد بسبب احتمال الاستخدام الديناميكي.",
    affectedPaths: [candidate.path], evidence: candidate.duplicateOf ? [`Duplicate of: ${candidate.duplicateOf}`] : candidate.reasons,
    detectedBy: "dekoclean", detectedAt: report.createdAt,
    recommendedActions: candidate.risk === "safe" ? ["quarantine", "ignore"] : ["ignore", "validate"],
    requiresAdminConfirmation: true, status: "new",
  }));
  return { findings, report };
}

export function securityFindingsToDekoClean(findings: SecurityScanFinding[]): DekoCleanFinding[] {
  return findings.map((finding) => {
    const affectedPaths = finding.filePath ? [finding.filePath] : [];
    return enrichFinding({
      id: findingId("security-alert", affectedPaths, finding.detectionId ?? finding.fileHashSha256 ?? finding.threatName ?? finding.source),
      type: finding.filePath ? "suspicious-file" : "security-alert", severity: finding.severity,
      title: finding.threatName ?? "تنبيه أمني من أداة موثوقة",
      explanation: "تم استيراد هذا التنبيه من تقرير منظم محلي. لم ينفذ DekoRadar الملف ولم يصنفه بنفسه.",
      affectedPaths, evidence: [`Source: ${finding.source}`, finding.detectionId ? `Detection: ${finding.detectionId}` : "Structured report"],
      detectedBy: "security-connector", detectedAt: finding.detectedAt,
      recommendedActions: ["quarantine", "validate", "ignore"], requiresAdminConfirmation: true, status: "new",
      fileHashSha256: finding.fileHashSha256, sourceReference: finding.rawReportReference,
    });
  });
}

export async function runDekoRadarScan(
  projectRoot = process.cwd(),
  includeSecurity = true,
  options: { persist?: boolean; scan?: DekoCleanScanResult } = {},
): Promise<DekoRadarScanResult> {
  const config = createDekoCleanConfig(projectRoot);
  const scan = options.scan ?? scanProject(config);
  const cached = readScanCache(projectRoot, scan.fingerprint);
  let findings: DekoCleanFinding[];
  if (cached) {
    findings = cached.findings;
  } else {
    const reportResult = reportFindings(scan, config);
    findings = organizeFindings([
      ...reportResult.findings,
      ...detectReferenceFindings(scan.files, config),
      ...detectBrokenRoutes(scan.files, config),
      ...monitorProtectedIntegrity(scan.files, config),
    ]).filter((finding) => finding.affectedFiles.every((file) => !isIgnoredFindingPath(file)));
    writeScanCache(projectRoot, scan.fingerprint, findings, reportResult.report);
  }

  let inconsistent: Array<[string, unknown]> = [];
  try {
    const { auditParticipantOwnership } = await import("../participants/ownershipAudit.ts");
    const ownership = await auditParticipantOwnership();
    inconsistent = Object.entries(ownership).filter(([key, value]) => key !== "localOnlyStores" && Array.isArray(value) && value.length > 0);
  } catch {
    // The standalone CLI may not provide Next's server-only module condition.
    // Ownership remains available through the server runtime and is never guessed.
  }
  if (inconsistent.length > 0) {
    const evidence = inconsistent.map(([key, value]) => `${key}: ${(value as string[]).length}`);
    findings.push(enrichFinding({
      id: findingId("ownership-inconsistency", [], evidence.join("|")), type: "ownership-inconsistency", severity: "high",
      title: "عدم اتساق ملكية participantId", explanation: "عُثر على سجلات تحتاج ربطًا بالمالك. لا يتم تعديل الملكية تلقائيًا.",
      affectedPaths: [], evidence, detectedBy: "dekoradar", detectedAt: new Date().toISOString(),
      recommendedActions: ["repair", "ignore"], requiresAdminConfirmation: true, status: "new",
    }));
  }

  if (includeSecurity) {
    const connector = createLocalStructuredReportConnector(projectRoot);
    findings.push(...securityFindingsToDekoClean(await connector.scanProject()));
  }

  const organized = organizeFindings(findings)
    .filter((finding) => finding.affectedFiles.every((file) => !isIgnoredFindingPath(file)));
  if (options.persist !== false) {
    replaceDetectedFindings(organized, projectRoot);
  }
  return { findings: options.persist === false ? organized : readFindings(projectRoot), scannedAt: new Date().toISOString(), scannedFiles: scan.files.length, cacheHit: Boolean(cached) };
}

export function createSafeSyntheticHash(label: string): string {
  return createHash("sha256").update(label).digest("hex");
}

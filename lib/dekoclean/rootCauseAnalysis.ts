import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { readDekoCleanAudit } from "./auditLog.ts";
import { readFindings } from "./findingStore.ts";
import { inspectSecurityFinding } from "./securityFindingActions.ts";

export type RootCauseAnalysis = {
  findingId: string;
  filePath: string;
  classification:
    | "expected-development-change"
    | "dependency-change"
    | "configuration-change"
    | "generated-file-change"
    | "suspicious-change"
    | "unknown";
  confidence: "low" | "medium" | "high";
  evidence: string[];
  recommendation: "approve" | "compare" | "verify" | "restore" | "manual-review";
  analyzedAt: string;
};

const GENERATED_PATH = /^(?:\.next|out|coverage|\.dekoclean\/(?:tmp|temp|reports\/cache))(?:\/|$)/;
const STUDIO_PATH = /^(?:app|components)\/(?:echo|studio)(?:\/|$)/;

export function analyzeSecurityFindingRootCause(
  findingId: string,
  projectRoot = process.cwd(),
): RootCauseAnalysis {
  const finding = readFindings(projectRoot).find((entry) => entry.id === findingId || entry.findingId === findingId);
  if (!finding) throw new Error("SECURITY_FINDING_NOT_FOUND");
  const integrityInspection = finding.type === "integrity-mismatch" ? inspectSecurityFinding(findingId, projectRoot) : null;
  const filePath = (integrityInspection?.filePath ?? finding.affectedFiles[0] ?? "").replace(/\\/g, "/");
  if (!filePath || path.isAbsolute(filePath) || filePath.split("/").includes("..")) throw new Error("SECURITY_FINDING_TARGET_INVALID");
  const absolute = path.resolve(projectRoot, filePath);
  const git = (args: string[]) => {
    try { return execFileSync("git", args, { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
    catch { return ""; }
  };
  const gitTracked = integrityInspection?.gitTracked ?? Boolean(git(["ls-files", "--error-unmatch", "--", filePath]));
  const workingTreeChanged = integrityInspection?.workingTreeChanged ?? Boolean(git(["status", "--porcelain", "--", filePath]));
  const gitDiff = integrityInspection?.gitDiff ?? git(["diff", "--", filePath]).slice(0, 80_000);
  const currentHash = integrityInspection?.currentHash ?? finding.fileHashSha256;
  const previousHash = integrityInspection?.previousHash ?? finding.previousFileHashSha256;
  const evidence = [
    `SHA-256 الحالي: ${currentHash ?? "غير متاح"}`,
    `SHA-256 لخط الأساس: ${previousHash ?? "غير متاح"}`,
    gitTracked ? "الملف متعقب في Git." : "الملف غير متعقب في Git.",
    workingTreeChanged ? "يوجد تغيير حالي في Git working tree." : "لا يوجد تغيير حالي في Git working tree.",
  ];
  if (integrityInspection?.latestCommit) evidence.push(`آخر commit: ${integrityInspection.latestCommit.slice(0, 12)} — ${integrityInspection.latestCommitSubject ?? ""}`.trim());
  if (fs.existsSync(absolute)) {
    evidence.push(`وقت تعديل الملف: ${fs.statSync(absolute).mtime.toISOString()}`);
  }
  const relatedAudit = readDekoCleanAudit(projectRoot)
    .filter((entry) => entry.affectedPaths.includes(filePath))
    .slice(-3);
  if (relatedAudit.length) evidence.push(`سجل التدقيق المرتبط: ${relatedAudit.length} عملية حديثة.`);

  let classification: RootCauseAnalysis["classification"] = "unknown";
  let confidence: RootCauseAnalysis["confidence"] = "medium";
  let recommendation: RootCauseAnalysis["recommendation"] = "compare";

  if (integrityInspection?.classification === "suspicious_change" || integrityInspection?.dangerousLines.length || finding.type === "suspicious-file") {
    classification = "suspicious-change";
    confidence = "high";
    recommendation = integrityInspection?.canRestore ? "restore" : "manual-review";
    evidence.push(...(integrityInspection?.dangerousLines ?? []).slice(0, 10).map((line) => `سطر حساس: ${line}`));
  } else if (GENERATED_PATH.test(filePath)) {
    classification = "generated-file-change";
    confidence = "high";
    recommendation = "verify";
    evidence.push("المسار داخل مخرجات مولدة أو ذاكرة مؤقتة معروفة.");
  } else if (filePath === "package.json" || filePath.endsWith("package-lock.json")) {
    const companion = filePath === "package.json" ? "package-lock.json" : "package.json";
    const companionChanged = gitDiff.includes(companion)
      || fs.existsSync(path.join(projectRoot, companion));
    classification = "dependency-change";
    confidence = companionChanged ? "high" : "medium";
    recommendation = "verify";
    evidence.push(companionChanged ? "ملفا الحزم والقفل موجودان للمقارنة والتحقق." : "لم يتوفر ملف الحزم المرافق.");
  } else if (/^(?:next\.config\.(?:js|mjs|ts)|tsconfig\.json|eslint\.config\.)/.test(filePath)) {
    classification = "configuration-change";
    confidence = gitTracked ? "high" : "medium";
    recommendation = integrityInspection?.canApprove ? "approve" : "verify";
    evidence.push("الملف إعداد مشروع معروف ويجب اعتماد تغييره بعد التحقق.");
  } else if (STUDIO_PATH.test(filePath) && (workingTreeChanged || integrityInspection?.currentMatchesGitHead)) {
    classification = "expected-development-change";
    confidence = "high";
    recommendation = integrityInspection?.canApprove ? "approve" : "verify";
    evidence.push("الملف من عمل Studio الحالي وتدعمه حالة Git.");
  } else if (integrityInspection?.classification === "expected_project_change") {
    classification = "expected-development-change";
    confidence = "high";
    recommendation = integrityInspection.canApprove ? "approve" : "verify";
  } else if (!gitTracked || (integrityInspection && !integrityInspection.baselineValid)) {
    classification = "unknown";
    confidence = "low";
    recommendation = "manual-review";
  }
  if (gitDiff) evidence.push(`Git diff متاح (${gitDiff.split("\n").length} سطرًا).`);

  return { findingId: finding.id, filePath, classification, confidence, evidence, recommendation, analyzedAt: new Date().toISOString() };
}

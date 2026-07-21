import fs from "node:fs";
import path from "node:path";

import type { DekoCleanCandidate, DekoCleanReport } from "./types.ts";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[index]}`;
}

function table(candidates: DekoCleanCandidate[]): string {
  if (candidates.length === 0) return "لا توجد عناصر.\n";
  return [
    "| المسار | الحجم | الأسباب | التوصية |",
    "| --- | ---: | --- | --- |",
    ...candidates.map((candidate) =>
      `| \`${candidate.path.replace(/\|/g, "\\|")}\` | ${formatBytes(candidate.sizeBytes)} | ${candidate.reasons.join(", ")} | ${candidate.recommendation} |`),
    "",
  ].join("\n");
}

export function renderMarkdownReport(report: DekoCleanReport): string {
  const safe = report.candidates.filter((candidate) => candidate.risk === "safe");
  const review = report.candidates.filter((candidate) => candidate.risk === "review");
  const protectedFiles = report.candidates.filter((candidate) => candidate.risk === "protected");
  const duplicates = report.candidates.filter((candidate) => candidate.reasons.includes("duplicate-content"));
  const orphanAssets = report.candidates.filter((candidate) =>
    candidate.reasons.includes("unused-image") || candidate.reasons.includes("orphan-json"));

  return [
    "# تقرير DekoClean",
    "",
    `تاريخ الفحص: ${report.createdAt}`,
    "",
    "## الملخص",
    "",
    `- الملفات المفحوصة: ${report.scannedFiles}`,
    `- الحجم المفحوص: ${formatBytes(report.totalSizeBytes)}`,
    `- المرشحات الآمنة: ${report.safeCandidates}`,
    `- عناصر المراجعة: ${report.reviewCandidates}`,
    `- الملفات المحمية: ${report.protectedFiles}`,
    `- النسخ المتطابقة: ${report.duplicateFiles}`,
    `- المساحة المتوقعة القابلة للاستعادة: ${formatBytes(report.estimatedRecoverableBytes)}`,
    `- node_modules (قابل لإعادة الإنشاء، غير مرشح): ${formatBytes(report.regenerableDependenciesBytes)}`,
    "",
    "## المرشحات الآمنة",
    "",
    table(safe),
    "## عناصر تحتاج مراجعة",
    "",
    table(review),
    "## الملفات المحمية",
    "",
    table(protectedFiles),
    "## النسخ المتطابقة",
    "",
    table(duplicates),
    "## أكبر الملفات",
    "",
    report.largestFiles.length === 0
      ? "لا توجد ملفات.\n"
      : report.largestFiles.map((file) => `- \`${file.path}\` — ${formatBytes(file.sizeBytes)}`).join("\n") + "\n",
    "",
    "## الأصول اليتيمة المحتملة",
    "",
    table(orphanAssets),
    "## المساحة المتوقعة",
    "",
    `${formatBytes(report.estimatedRecoverableBytes)} قبل التحقق النهائي. لا يحذف DekoClean v1 أي ملف نهائيًا.`,
    "",
  ].join("\n");
}

export function writeReport(projectRoot: string, report: DekoCleanReport): void {
  const reportDirectory = path.join(projectRoot, ".dekoclean", "reports");
  fs.mkdirSync(reportDirectory, { recursive: true });
  fs.writeFileSync(path.join(reportDirectory, "latest.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(reportDirectory, "latest.md"), renderMarkdownReport(report), "utf8");
}

export function readLatestReport(projectRoot: string): DekoCleanReport {
  const reportPath = path.join(projectRoot, ".dekoclean", "reports", "latest.json");
  const parsed: unknown = JSON.parse(fs.readFileSync(reportPath, "utf8"));
  if (!parsed || typeof parsed !== "object" || !("candidates" in parsed) || !Array.isArray(parsed.candidates)) {
    throw new Error("Invalid DekoClean report. Run dekoclean:scan again.");
  }
  return parsed as DekoCleanReport;
}

import fs from "node:fs";
import path from "node:path";

import { findingId, sanitizeEvidence } from "./finding.ts";
import { enrichFinding } from "../dekoclean/findingEngine.ts";
import type { DekoCleanFinding } from "../dekoclean/types.ts";
import type { DekoCleanConfig, ScannedFile } from "../dekoclean/types.ts";

const IMPORT_PATTERN = /(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\)|import\s*\(\s*["']([^"']+)["']\s*\)/g;
const ASSET_PATTERN = /["'`](\/[^"'`?#]+\.(?:png|jpe?g|webp|gif|svg|avif|ico|mp4|webm|mov|mp3|wav))["'`]/gi;

function resolveImport(importer: string, specifier: string, known: Set<string>): string | null {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return null;
  const base = specifier.startsWith("@/")
    ? specifier.slice(2)
    : path.posix.normalize(path.posix.join(path.posix.dirname(importer), specifier));
  const candidates = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".css"]
    .flatMap((extension) => [`${base}${extension}`, `${base}/index${extension}`]);
  return candidates.find((candidate) => known.has(candidate)) ?? "";
}

export function detectReferenceFindings(files: ScannedFile[], config: DekoCleanConfig): DekoCleanFinding[] {
  const findings: DekoCleanFinding[] = [];
  const known = new Set(files.map((file) => file.path));

  for (const file of files) {
    if (/(?:\.test\.|dekoclean-(?:security-)?test\.ts$|next-env\.d\.ts$)/.test(file.path)) continue;
    if (!config.textExtensions.includes(file.extension) || file.sizeBytes > config.maxTextFileBytes) continue;
    let content: string;
    try { content = fs.readFileSync(file.absolutePath, "utf8"); } catch { continue; }

    if (file.extension === ".json") {
      try { JSON.parse(content); } catch (error) {
        const evidence = error instanceof Error ? error.message : "JSON parse failed";
        findings.push(enrichFinding({
          id: findingId("invalid-json", [file.path], evidence), type: "invalid-json", severity: file.protected ? "high" : "medium",
          title: "ملف JSON غير صالح", explanation: "تعذر تحليل بنية JSON. لم يتم تعديل الملف.", affectedPaths: [file.path],
          evidence: [sanitizeEvidence(evidence)], detectedBy: "dekoradar", detectedAt: new Date().toISOString(),
          recommendedActions: ["repair", "restore", "ignore"], requiresAdminConfirmation: true, status: "new",
        }));
      }
    }

    IMPORT_PATTERN.lastIndex = 0;
    let importMatch = IMPORT_PATTERN.exec(content);
    while (importMatch) {
      const specifier = importMatch[1] ?? importMatch[2] ?? importMatch[3];
      if (specifier && resolveImport(file.path, specifier, known) === "") {
        findings.push(enrichFinding({
          id: findingId("broken-import", [file.path], specifier), type: "broken-import", severity: "high",
          title: "مسار استيراد مفقود", explanation: "يشير الاستيراد الثابت إلى ملف غير موجود. الإصلاح يحتاج معاينة patch وتأكيد المدير.",
          affectedPaths: [file.path], evidence: [`Import: ${sanitizeEvidence(specifier)}`], detectedBy: "dekoradar",
          detectedAt: new Date().toISOString(), recommendedActions: ["repair", "restore", "ignore"],
          requiresAdminConfirmation: true, status: "new",
        }));
      }
      importMatch = IMPORT_PATTERN.exec(content);
    }

    ASSET_PATTERN.lastIndex = 0;
    let assetMatch = ASSET_PATTERN.exec(content);
    while (assetMatch) {
      const reference = assetMatch[1];
      const publicPath = reference ? `public/${reference.slice(1)}` : "";
      if (reference && !known.has(publicPath)) {
        findings.push(enrichFinding({
          id: findingId("broken-asset-reference", [file.path], reference), type: "broken-asset-reference", severity: "medium",
          title: "مرجع أصل ثابت مفقود", explanation: "يشير الكود إلى ملف عام غير موجود. لم يتم تغيير المرجع.",
          affectedPaths: [file.path], evidence: [`Asset: ${sanitizeEvidence(reference)}`], detectedBy: "dekoradar",
          detectedAt: new Date().toISOString(), recommendedActions: ["repair", "restore", "ignore"],
          requiresAdminConfirmation: true, status: "new",
        }));
      }
      assetMatch = ASSET_PATTERN.exec(content);
    }
  }
  return findings;
}

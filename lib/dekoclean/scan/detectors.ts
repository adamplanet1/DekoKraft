import fs from "node:fs";
import path from "node:path";

import { enrichFinding } from "../findingEngine.ts";
import type { DekoCleanConfig, DekoCleanFinding, DekoCleanScanResult } from "../types.ts";
import { createLocalStructuredReportConnector } from "../../dekoradar/securityAlertAdapter.ts";
import { createSafeSyntheticHash, runDekoRadarScan, securityFindingsToDekoClean } from "../../dekoradar/scanProject.ts";
import type { DekoScanDetectorId, DekoScanDetectorResult, DekoScanProfileId } from "./types.ts";
import type { DekoRadarScanResult } from "../../dekoradar/types.ts";
import { detectNavigationIntegrity } from "../detectors/navigationIntegrityDetector.ts";
import { detectUIInspectorFindings } from "../detectors/uiInspectorDetector.ts";

export interface DekoScanDetectorContext {
  projectRoot: string;
  config: DekoCleanConfig;
  scan: DekoCleanScanResult;
  profileId: DekoScanProfileId;
  changedFiles: Set<string>;
  deletedFiles: string[];
  forceFull: boolean;
  coreResult?: Promise<DekoRadarScanResult>;
}

function finding(input: Parameters<typeof enrichFinding>[0]): DekoCleanFinding {
  return enrichFinding(input);
}

function now(): string {
  return new Date().toISOString();
}

function sharedCore(context: DekoScanDetectorContext): Promise<DekoRadarScanResult> {
  context.coreResult ??= runDekoRadarScan(context.projectRoot, false, { persist: false, scan: context.scan });
  return context.coreResult;
}

function filterChanged(findings: DekoCleanFinding[], context: DekoScanDetectorContext): DekoCleanFinding[] {
  if (context.profileId !== "quick" || context.forceFull) return findings;
  return findings.flatMap((entry) => {
    if (entry.affectedFiles.length === 0) return [];
    const affectedFiles = entry.affectedFiles.filter((file) => context.changedFiles.has(file) || context.deletedFiles.includes(file));
    return affectedFiles.length ? [{ ...entry, affectedFiles, affectedPaths: affectedFiles, count: affectedFiles.length }] : [];
  });
}

async function projectCore(context: DekoScanDetectorContext): Promise<DekoScanDetectorResult> {
  const result = await sharedCore(context);
  const deleted = context.deletedFiles.map((file) => finding({
    id: `deleted-${createSafeSyntheticHash(file).slice(0, 16)}`,
    type: "missing-file", severity: "medium", title: "ملف حُذف منذ آخر فحص ناجح",
    explanation: "تغيّر مخزون الملفات منذ آخر بصمة ناجحة. يلزم التحقق من المراجع المتأثرة.",
    affectedPaths: [file], evidence: ["Changed-file cache: deleted"], detectedBy: "dekoclean", detectedAt: now(),
    recommendedActions: ["validate", "restore", "ignore"], requiresAdminConfirmation: true, status: "new",
  }));
  return { findings: filterChanged([...result.findings, ...deleted], context), scannedFiles: context.profileId === "quick" && !context.forceFull ? context.changedFiles.size + context.deletedFiles.length : result.scannedFiles, skippedFiles: context.profileId === "quick" && !context.forceFull ? Math.max(0, context.scan.files.length - context.changedFiles.size) : 0 };
}

async function invalidJson(context: DekoScanDetectorContext): Promise<DekoScanDetectorResult> {
  const files = context.scan.files.filter((file) => file.extension === ".json" && (context.profileId !== "quick" || context.forceFull || context.changedFiles.has(file.path)));
  const findings: DekoCleanFinding[] = [];
  for (const file of files) {
    try { JSON.parse(fs.readFileSync(file.absolutePath, "utf8")); }
    catch (error) {
      findings.push(finding({ id: `invalid-json-${createSafeSyntheticHash(file.path).slice(0, 16)}`, type: "invalid-json", category: "api-inconsistencies", severity: "high", title: "ملف JSON غير صالح", explanation: error instanceof Error ? error.message : "تعذر تحليل JSON.", affectedPaths: [file.path], evidence: ["JSON.parse failed"], detectedBy: "dekoclean", detectedAt: now(), recommendedActions: ["repair", "validate", "ignore"], requiresAdminConfirmation: true, status: "new" }));
    }
  }
  return { findings, scannedFiles: files.length };
}

async function security(context: DekoScanDetectorContext): Promise<DekoScanDetectorResult> {
  const core = await sharedCore(context);
  const integrity = core.findings.filter((entry) => entry.category === "security-issues" || entry.category === "integrity-issues");
  const exposedPatterns: string[] = [];
  const unsafePermissions: string[] = [];
  for (const file of context.scan.files.filter((entry) => context.config.textExtensions.includes(entry.extension) && entry.sizeBytes <= context.config.maxTextFileBytes)) {
    if (!/(?:^|\/)(?:\.env|credentials?)(?:\.|$)/i.test(file.path)) {
      try {
        const content = fs.readFileSync(file.absolutePath, "utf8");
        if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-[A-Za-z0-9_-]{20,}/.test(content)) exposedPatterns.push(file.path);
      } catch { /* unreadable files are handled by integrity detectors */ }
    }
    if (/(?:^|\/)(?:\.env(?:\.|$)|.*(?:private[-_.]?key|credentials?).*)/i.test(file.path)) {
      try { if ((fs.statSync(file.absolutePath).mode & 0o077) !== 0) unsafePermissions.push(file.path); }
      catch { /* availability differs by platform */ }
    }
  }
  const localFindings: DekoCleanFinding[] = [];
  if (exposedPatterns.length) localFindings.push(finding({ id: "security-secret-patterns", type: "security-alert", category: "security-issues", severity: "critical", title: "نمط سر محتمل خارج مخزن البيئة", explanation: "اكتُشف نمط يشبه مفتاحًا أو مفتاحًا خاصًا. لا تعرض DekoClean القيمة نفسها.", affectedPaths: exposedPatterns, evidence: ["Sensitive pattern detected; value redacted"], detectedBy: "integrity-check", detectedAt: now(), recommendedActions: ["validate", "repair"], requiresAdminConfirmation: true, status: "new" }));
  if (unsafePermissions.length) localFindings.push(finding({ id: "security-protected-permissions", type: "security-alert", category: "security-issues", severity: "medium", title: "صلاحيات واسعة لملفات محمية", explanation: "تسمح صلاحيات نظام الملفات بوصول group/other إلى ملف محمي.", affectedPaths: unsafePermissions, evidence: ["Protected file mode includes group/other permissions"], detectedBy: "integrity-check", detectedAt: now(), recommendedActions: ["validate", "repair"], requiresAdminConfirmation: true, status: "new" }));
  const connector = createLocalStructuredReportConnector(context.projectRoot);
  const connectorFindings = securityFindingsToDekoClean(await connector.scanProject());
  return { findings: [...integrity, ...localFindings, ...connectorFindings], scannedFiles: context.scan.files.filter((file) => file.protected).length, securityConnectorAvailable: connector.available };
}

function interpolationTokens(value: string): string[] {
  return [...value.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort();
}

function flatten(source: unknown, prefix = "", output: Record<string, string> = {}): Record<string, string> {
  if (typeof source === "string") { output[prefix] = source; return output; }
  if (!source || typeof source !== "object" || Array.isArray(source)) return output;
  for (const [key, value] of Object.entries(source)) flatten(value, prefix ? `${prefix}.${key}` : key, output);
  return output;
}

async function translationsDetector(): Promise<DekoScanDetectorResult> {
  const { translations } = await import("../../../locales/index.ts");
  const dictionaries = Object.fromEntries(Object.entries(translations).map(([lang, dictionary]) => [lang, flatten(dictionary)]));
  const languages = Object.keys(dictionaries);
  const allKeys = new Set(languages.flatMap((lang) => Object.keys(dictionaries[lang])));
  const findings: DekoCleanFinding[] = [];
  for (const lang of languages) {
    const missing = [...allKeys].filter((key) => !(key in dictionaries[lang]));
    const empty = Object.entries(dictionaries[lang]).filter(([, value]) => !value.trim()).map(([key]) => key);
    const tokenMismatch = [...allKeys].filter((key) => {
      const base = dictionaries.ar?.[key] ?? dictionaries.en?.[key];
      const localized = dictionaries[lang][key];
      return base !== undefined && localized !== undefined && interpolationTokens(base).join("|") !== interpolationTokens(localized).join("|");
    });
    if (missing.length) findings.push(finding({ id: `translations-missing-${lang}`, type: "unknown", category: "missing-translations", severity: "medium", title: `مفاتيح ترجمة مفقودة (${lang.toUpperCase()})`, explanation: "بنية قاموس اللغة لا تطابق البنية الموحدة.", affectedPaths: missing.map((key) => `locales/${lang}.ts#${key}`), evidence: [`Missing keys: ${missing.length}`], detectedBy: "dekoclean", detectedAt: now(), recommendedActions: ["repair", "validate"], requiresAdminConfirmation: true, status: "new" }));
    if (empty.length) findings.push(finding({ id: `translations-empty-${lang}`, type: "unknown", category: "missing-translations", severity: "low", title: `قيم ترجمة فارغة (${lang.toUpperCase()})`, explanation: "القيم الفارغة تؤدي إلى محتوى غير ظاهر.", affectedPaths: empty.map((key) => `locales/${lang}.ts#${key}`), evidence: [`Empty values: ${empty.length}`], detectedBy: "dekoclean", detectedAt: now(), recommendedActions: ["repair", "validate"], requiresAdminConfirmation: true, status: "new" }));
    if (tokenMismatch.length) findings.push(finding({ id: `translations-tokens-${lang}`, type: "unknown", category: "missing-translations", severity: "high", title: `اختلاف متغيرات الترجمة (${lang.toUpperCase()})`, explanation: "أسماء interpolation يجب أن تكون متطابقة بين اللغات.", affectedPaths: tokenMismatch.map((key) => `locales/${lang}.ts#${key}`), evidence: [`Token mismatches: ${tokenMismatch.length}`], detectedBy: "dekoclean", detectedAt: now(), recommendedActions: ["repair", "validate"], requiresAdminConfirmation: true, status: "new" }));
  }
  return { findings, scannedFiles: languages.length };
}

async function assets(context: DekoScanDetectorContext): Promise<DekoScanDetectorResult> {
  const assets = context.scan.files.filter((file) => context.config.assetExtensions.includes(file.extension));
  const paths = new Set(assets.map((file) => file.path));
  const findings: DekoCleanFinding[] = [];
  const missingPairs: string[] = [];
  const oversized: string[] = [];
  const core = await sharedCore(context);
  const assetPaths = new Set(assets.map((asset) => asset.path));
  const coreAssetFindings = core.findings.filter((entry) => entry.type === "broken-asset-reference" || entry.affectedFiles.some((file) => assetPaths.has(file)));
  for (const asset of assets) {
    const pair = asset.path.match(/^(.*)-(600|1200)(\.[^.]+)$/i);
    if (pair) {
      const counterpart = `${pair[1]}-${pair[2] === "600" ? "1200" : "600"}${pair[3]}`;
      if (!paths.has(counterpart)) missingPairs.push(asset.path);
    }
    if (asset.sizeBytes > 5 * 1024 * 1024) oversized.push(asset.path);
  }
  if (missingPairs.length) findings.push(finding({ id: "assets-missing-responsive-pairs", type: "broken-asset-reference", severity: "medium", title: "أزواج صور 600/1200 غير مكتملة", explanation: "عُثر على صورة متجاوبة بلا النسخة المقابلة المتوقعة.", affectedPaths: missingPairs, evidence: ["Missing responsive image counterpart"], detectedBy: "dekoclean", detectedAt: now(), recommendedActions: ["recreate", "validate", "ignore"], requiresAdminConfirmation: true, status: "new" }));
  if (oversized.length) findings.push(finding({ id: "assets-oversized", type: "unused-file", severity: "low", title: "موارد كبيرة تحتاج مراجعة", explanation: "حجم المورد يتجاوز 5MB وقد يؤثر في النقل أو التحميل.", affectedPaths: oversized, evidence: ["Asset size > 5MB"], detectedBy: "dekoclean", detectedAt: now(), recommendedActions: ["validate", "ignore"], requiresAdminConfirmation: true, status: "new" }));
  return { findings: [...coreAssetFindings, ...findings], scannedFiles: assets.length };
}

async function participants(): Promise<DekoScanDetectorResult> {
  const { auditParticipantOwnership } = await import("../../participants/ownershipAudit.ts");
  const { getParticipantRegistry } = await import("../../participants/registry.ts");
  const { sellerProducts } = await import("../../../app/data/sellerProducts.ts");
  const audit = await auditParticipantOwnership();
  const registry = getParticipantRegistry();
  const registryIds = new Set(registry.map((participant) => participant.participantId));
  const duplicateIds = registry.map((participant) => participant.participantId).filter((id, index, ids) => ids.indexOf(id) !== index);
  const orphanProducts = sellerProducts.filter((product) => {
    if (product.ownerType === "admin") return false;
    const owner = product.participantId ?? product.sellerId;
    return Boolean(owner) && !registryIds.has(String(owner));
  }).map((product) => product.id);
  const entries = Object.entries({ ...audit, duplicateParticipantIds: duplicateIds, orphanProductOwners: orphanProducts }).filter(([key, value]) => key !== "localOnlyStores" && Array.isArray(value) && value.length > 0) as Array<[string, string[]]>;
  const affected = entries.flatMap(([, ids]) => ids);
  if (!entries.length) return { findings: [], scannedFiles: audit.normalizedParticipantIdRecords };
  return { findings: [finding({ id: "participants-ownership-audit", type: "ownership-inconsistency", severity: "high", title: "عدم اتساق ربط participantId", explanation: "عُثر على سجلات لا تطابق سجل المشاركين أو تحتاج مالكًا مؤكدًا. لن تُعاد الملكية تلقائيًا.", affectedPaths: affected, count: affected.length, evidence: entries.map(([key, ids]) => `${key}: ${ids.length}`), detectedBy: "dekoradar", detectedAt: now(), recommendedActions: ["repair", "validate", "ignore"], requiresAdminConfirmation: true, status: "new" })], scannedFiles: audit.normalizedParticipantIdRecords + affected.length };
}

async function dekobrain(context: DekoScanDetectorContext): Promise<DekoScanDetectorResult> {
  const { listAICostRecords } = await import("../../ai-cost/costStore.ts");
  const records = await listAICostRecords();
  const recent = records.filter((record) => Date.now() - new Date(record.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000);
  const failed = recent.filter((record) => record.status === "failed");
  const findings: DekoCleanFinding[] = [];
  if (recent.length >= 3 && failed.length / recent.length >= .25) findings.push(finding({ id: "dekobrain-failed-executions", type: "unknown", category: "api-inconsistencies", severity: "high", title: "ارتفاع فشل عمليات الذكاء الاصطناعي", explanation: "تجاوزت نسبة الفشل التشغيلي 25% خلال آخر 30 يومًا.", affectedPaths: failed.map((record) => `ai-cost:${record.id}`), evidence: [`Failed: ${failed.length}/${recent.length}`], detectedBy: "dekoclean", detectedAt: now(), recommendedActions: ["validate", "ignore"], requiresAdminConfirmation: true, status: "new" }));
  const memoryFiles = ["data/echo-guide-accepted-memory.json", "data/ai-cost-records.json"];
  for (const relative of memoryFiles) {
    const target = path.join(context.projectRoot, relative);
    if (!fs.existsSync(target)) continue;
    try { JSON.parse(fs.readFileSync(target, "utf8")); }
    catch { findings.push(finding({ id: `dekobrain-memory-${createSafeSyntheticHash(relative).slice(0, 12)}`, type: "invalid-json", category: "api-inconsistencies", severity: "critical", title: "ذاكرة تشغيلية غير قابلة للقراءة", explanation: "تعذر تحليل مخزن تشغيلي مرتبط بـ DekoBrain.", affectedPaths: [relative], evidence: ["Operational JSON unreadable"], detectedBy: "integrity-check", detectedAt: now(), recommendedActions: ["restore", "validate"], requiresAdminConfirmation: true, status: "new" })); }
  }
  return { findings, scannedFiles: recent.length + memoryFiles.length };
}

async function performance(): Promise<DekoScanDetectorResult> {
  return { findings: [], scannedFiles: 0, performanceMeasurementsAvailable: false };
}

export const DEKO_SCAN_DETECTORS: Record<DekoScanDetectorId, (context: DekoScanDetectorContext) => Promise<DekoScanDetectorResult>> = {
  "navigation-integrity": async () => ({ findings: detectNavigationIntegrity(), scannedFiles: 0 }),
  "ui-inspector": async () => ({ findings: detectUIInspectorFindings(), scannedFiles: 0 }),
  "project-core": projectCore,
  "invalid-json": invalidJson,
  security,
  dekobrain,
  translations: translationsDetector,
  assets,
  participants,
  performance,
};

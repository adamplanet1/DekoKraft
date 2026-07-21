import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { gzipSync, gunzipSync } from "node:zlib";

import { createDekoCleanConfig } from "../dekoclean/config.ts";
import { checksumFile } from "../dekoclean/duplicateDetector.ts";
import { isProtectedPath, toPosixPath } from "../dekoclean/pathSafety.ts";
import { scanProject } from "../dekoclean/scanner.ts";
import { buildUsageGraph } from "../dekoclean/usageGraph.ts";
import type { DekoCleanScanResult } from "../dekoclean/types.ts";
import type { RecoveryManifest, RecoveryManifestEntry, RecoveryPoint } from "./types.ts";

const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".md", ".html", ".yml", ".yaml", ".txt"]);

export function recoveryRoot(projectRoot: string): string { return path.join(projectRoot, ".dekoclean", "recovery"); }
function objectsRoot(projectRoot: string): string { return path.join(recoveryRoot(projectRoot), "objects"); }
function pointRoot(projectRoot: string, id: string): string { return path.join(recoveryRoot(projectRoot), "points", id); }
function pointsIndexPath(projectRoot: string): string { return path.join(recoveryRoot(projectRoot), "recovery-points.json"); }

export function validRecoveryId(id: string): boolean { return /^[a-zA-Z0-9][\w.-]{5,127}$/.test(id); }

function sha256(value: Buffer | string): string { return createHash("sha256").update(value).digest("hex"); }
function category(filePath: string, extension: string): RecoveryManifestEntry["category"] {
  if (filePath.startsWith("locales/")) return "locale";
  if (filePath.startsWith("public/") || [".png", ".jpg", ".jpeg", ".webp", ".svg", ".mp4", ".webm"].includes(extension)) return "asset";
  if (filePath.startsWith("data/") || extension === ".json") return "data";
  if (/^(?:package|tsconfig|next\.config|eslint|\.env)/.test(filePath)) return "config";
  if ([".ts", ".tsx", ".js", ".jsx", ".css"].includes(extension)) return "source";
  return "other";
}

function writeContentObject(projectRoot: string, absolutePath: string, checksum: string, extension: string): { reference: string; encoding: "raw" | "gzip"; bytesAdded: number } {
  const content = fs.readFileSync(absolutePath);
  const compressed = TEXT_EXTENSIONS.has(extension) ? gzipSync(content, { level: 6 }) : null;
  const useGzip = Boolean(compressed && compressed.length + 32 < content.length);
  const object = useGzip ? compressed! : content;
  const reference = toPosixPath(path.join("objects", checksum.slice(0, 2), `${checksum}.${useGzip ? "gz" : "bin"}`));
  const target = path.join(recoveryRoot(projectRoot), reference);
  if (fs.existsSync(target)) return { reference, encoding: useGzip ? "gzip" : "raw", bytesAdded: 0 };
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, object, { mode: 0o600 });
  return { reference, encoding: useGzip ? "gzip" : "raw", bytesAdded: object.length };
}

export function readContentObject(projectRoot: string, entry: RecoveryManifestEntry): Buffer {
  if (!entry.contentObjectReference || !entry.checksum) throw new Error("Recovery manifest entry has no content object.");
  const root = recoveryRoot(projectRoot);
  const target = path.resolve(root, entry.contentObjectReference);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Unsafe recovery object reference.");
  const stored = fs.readFileSync(target);
  const content = entry.contentEncoding === "gzip" ? gunzipSync(stored) : stored;
  if (sha256(content) !== entry.checksum) throw new Error(`Recovery content checksum mismatch: ${entry.path}`);
  return content;
}

export function readRecoveryPoints(projectRoot = process.cwd()): RecoveryPoint[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(pointsIndexPath(projectRoot), "utf8"));
    return Array.isArray(parsed) ? (parsed as RecoveryPoint[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  } catch { return []; }
}

export function writeRecoveryPoints(points: RecoveryPoint[], projectRoot = process.cwd()): void {
  const target = pointsIndexPath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(points.slice(0, 500), null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
}

export function readRecoveryPoint(id: string, projectRoot = process.cwd()): RecoveryPoint {
  if (!validRecoveryId(id)) throw new Error("Invalid recovery point id.");
  const point = readRecoveryPoints(projectRoot).find((entry) => entry.recoveryPointId === id);
  if (!point) throw new Error("Recovery point not found.");
  return point;
}

export function readRecoveryManifest(reference: string, projectRoot = process.cwd()): RecoveryManifest {
  const root = recoveryRoot(projectRoot);
  const target = path.resolve(root, reference);
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Unsafe recovery manifest reference.");
  const parsed = JSON.parse(fs.readFileSync(target, "utf8")) as RecoveryManifest;
  const integrityHash = manifestIntegrity(parsed);
  if (integrityHash !== parsed.integrityHash) throw new Error("Recovery manifest integrity validation failed.");
  return parsed;
}

function manifestIntegrity(manifest: Omit<RecoveryManifest, "integrityHash"> | RecoveryManifest): string {
  const content = { ...manifest } as Partial<RecoveryManifest>;
  delete content.integrityHash;
  return sha256(JSON.stringify(content));
}

export function createIncrementalManifest(projectRoot: string, recoveryPointId: string, scan: DekoCleanScanResult = scanProject(createDekoCleanConfig(projectRoot))): { manifest: RecoveryManifest; storageBytesAdded: number; totalReferencedBytes: number } {
  const config = createDekoCleanConfig(projectRoot);
  const previousPoint = readRecoveryPoints(projectRoot).find((point) => point.status === "verified" || point.status === "provisional");
  const previous = previousPoint ? readRecoveryManifest(previousPoint.manifestReference, projectRoot) : null;
  const previousByPath = new Map((previous?.entries ?? []).filter((entry) => !entry.deleted).map((entry) => [entry.path, entry]));
  const usage = buildUsageGraph(scan.files, config);
  let storageBytesAdded = 0;
  let totalReferencedBytes = 0;
  const entries = scan.files.map((file): RecoveryManifestEntry => {
    const checksum = checksumFile(file.absolutePath);
    const existing = previousByPath.get(file.path);
    const object = existing?.checksum === checksum && existing.contentObjectReference ? { reference: existing.contentObjectReference, encoding: existing.contentEncoding ?? "raw" as const, bytesAdded: 0 } : writeContentObject(projectRoot, file.absolutePath, checksum, file.extension);
    storageBytesAdded += object.bytesAdded;
    totalReferencedBytes += file.sizeBytes;
    const node = usage[file.path];
    return { path: file.path, checksum, size: file.sizeBytes, modifiedAt: file.lastModifiedAt, category: category(file.path, file.extension), protected: isProtectedPath(file.path, config), dependencies: node?.references ?? [], dependents: node?.referencedBy ?? [], restoreEligible: !file.symbolicLink, contentObjectReference: object.reference, contentEncoding: object.encoding, deleted: false };
  });
  const currentPaths = new Set(entries.map((entry) => entry.path));
  const deleted = [...previousByPath.values()].filter((entry) => !currentPaths.has(entry.path)).map((entry): RecoveryManifestEntry => ({ ...entry, modifiedAt: new Date().toISOString(), contentObjectReference: undefined, contentEncoding: undefined, deleted: true }));
  entries.push(...deleted);
  const previousChecksums = new Map((previous?.entries ?? []).map((entry) => [entry.path, entry.checksum]));
  const changedFiles = entries.filter((entry) => entry.deleted || previousChecksums.get(entry.path) !== entry.checksum).map((entry) => entry.path);
  const dependencyMapReference = toPosixPath(path.join("points", recoveryPointId, "dependency-map.json"));
  const dependencyTarget = path.join(recoveryRoot(projectRoot), dependencyMapReference);
  fs.mkdirSync(path.dirname(dependencyTarget), { recursive: true });
  fs.writeFileSync(dependencyTarget, `${JSON.stringify(usage, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  const manifestBase: Omit<RecoveryManifest, "integrityHash"> = { version: 1, recoveryPointId, projectRootFingerprint: sha256(path.resolve(projectRoot)), createdAt: new Date().toISOString(), entries: entries.sort((a, b) => a.path.localeCompare(b.path)), changedFiles, deletedFiles: deleted.map((entry) => entry.path), dependencyMapReference, protectedChecksumSummary: sha256(entries.filter((entry) => entry.protected).map((entry) => `${entry.path}:${entry.checksum}`).sort().join("\n")) };
  const manifest: RecoveryManifest = { ...manifestBase, integrityHash: manifestIntegrity(manifestBase) };
  const manifestReference = toPosixPath(path.join("points", recoveryPointId, "manifest.json"));
  fs.mkdirSync(pointRoot(projectRoot, recoveryPointId), { recursive: true });
  fs.writeFileSync(path.join(recoveryRoot(projectRoot), manifestReference), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return { manifest, storageBytesAdded, totalReferencedBytes };
}

export function recoveryStorageBytes(projectRoot = process.cwd()): number {
  const root = objectsRoot(projectRoot);
  if (!fs.existsSync(root)) return 0;
  let total = 0;
  const walk = (directory: string) => { for (const entry of fs.readdirSync(directory, { withFileTypes: true })) { const target = path.join(directory, entry.name); if (entry.isDirectory()) walk(target); else if (entry.isFile()) total += fs.statSync(target).size; } };
  walk(root);
  return total;
}

export function createRecoveryId(prefix = "rp"): string { return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`; }

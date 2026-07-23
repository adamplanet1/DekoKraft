import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { appendDekoCleanAudit } from "./auditLog.ts";

export type CleanupCandidate = { id: string; label: string; relativePath: string; bytes: number; kind: "file" | "directory" };
export type LocalCleanupPreview = {
  previewId: string;
  candidates: CleanupCandidate[];
  estimatedBytes: number;
  preserved: string[];
  createdAt: string;
};
export type LocalCleanupResult = {
  deletedItems: number;
  reclaimedBytes: number;
  failures: string[];
  completedAt: string;
};

const ALLOWED_ROOTS = [".next/cache", ".dekoclean/tmp", ".dekoclean/temp", ".dekoclean/reports/cache"] as const;
export const LOCAL_CLEANUP_PRESERVED = [
  "app/", "public/", "package.json", "package-lock.json", "ملفات الإعداد", "ملفات المستخدم", "protected baselines", "security findings", "audit logs", ".git/", "node_modules/",
];

function sha(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function safeAllowedTarget(projectRoot: string, relativePath: string): string {
  const root = path.resolve(projectRoot);
  if (!ALLOWED_ROOTS.some((allowed) => relativePath === allowed || relativePath.startsWith(`${allowed}/`))) throw new Error("CLEANUP_TARGET_NOT_ALLOWLISTED");
  const target = path.resolve(root, relativePath);
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error("CLEANUP_PATH_TRAVERSAL");
  return target;
}
function sizeOf(target: string): number {
  if (!fs.existsSync(target)) return 0;
  const stat = fs.lstatSync(target);
  if (stat.isSymbolicLink()) return 0;
  if (stat.isFile()) return stat.size;
  if (!stat.isDirectory()) return 0;
  return fs.readdirSync(target).reduce((sum, name) => sum + sizeOf(path.join(target, name)), 0);
}

export function createLocalCleanupPreview(projectRoot = process.cwd()): LocalCleanupPreview {
  const candidates = ALLOWED_ROOTS.flatMap((relativePath): CleanupCandidate[] => {
    const target = safeAllowedTarget(projectRoot, relativePath);
    if (!fs.existsSync(target) || fs.lstatSync(target).isSymbolicLink()) return [];
    return [{ id: sha(relativePath).slice(0, 24), label: relativePath, relativePath, bytes: sizeOf(target), kind: fs.statSync(target).isDirectory() ? "directory" : "file" }];
  });
  const createdAt = new Date().toISOString();
  const signature = candidates.map((item) => `${item.id}:${item.bytes}`).join("|");
  return {
    previewId: `${Date.now().toString(36)}-${sha(signature).slice(0, 24)}`,
    candidates,
    estimatedBytes: candidates.reduce((sum, item) => sum + item.bytes, 0),
    preserved: LOCAL_CLEANUP_PRESERVED,
    createdAt,
  };
}

export function executeLocalSimpleCleanup(
  input: { previewId: string; confirmed: boolean },
  adminReference: string,
  projectRoot = process.cwd(),
): LocalCleanupResult {
  if (!input.confirmed) throw new Error("CLEANUP_CONFIRMATION_REQUIRED");
  if (!/^[a-z0-9]+-[a-f\d]{24}$/i.test(input.previewId)) throw new Error("CLEANUP_PREVIEW_INVALID");
  const current = createLocalCleanupPreview(projectRoot);
  const expectedSignature = current.previewId.split("-").at(-1);
  if (input.previewId.split("-").at(-1) !== expectedSignature) throw new Error("CLEANUP_PREVIEW_STALE");
  let deletedItems = 0;
  let reclaimedBytes = 0;
  const failures: string[] = [];
  for (const candidate of current.candidates) {
    try {
      const target = safeAllowedTarget(projectRoot, candidate.relativePath);
      if (fs.lstatSync(target).isSymbolicLink()) throw new Error("symbolic links are not cleaned");
      fs.rmSync(target, { recursive: true, force: false });
      deletedItems += 1;
      reclaimedBytes += candidate.bytes;
    } catch (error) {
      failures.push(`${candidate.relativePath}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }
  const completedAt = new Date().toISOString();
  appendDekoCleanAudit({
    operationId: randomUUID(), action: "validate", adminReference,
    affectedPaths: current.candidates.map((item) => item.relativePath),
    beforeChecksums: {}, afterChecksums: {}, rollbackStatus: "not-required",
    status: failures.length ? "failed" : "completed", createdAt: completedAt,
    metadata: { operation: "local-simple-cleanup", deletedItems, reclaimedBytes, failures },
  }, projectRoot);
  return { deletedItems, reclaimedBytes, failures, completedAt };
}

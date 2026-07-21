import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createDekoCleanConfig } from "./config.ts";
import { updateFindingStatus } from "./findingStore.ts";
import { isProtectedPath, resolveInsideProject, toPosixPath } from "./pathSafety.ts";
import {
  claimRepairRecipeExecution, readRepairRecipe, repairBackupRoot, repairRecipeIntegrityValid, saveRepairExecutionLog, updateRepairRecipe,
} from "./repairRecipeStore.ts";
import type { DekoCleanRepairRecipe, EchoRepairExecutionResult, RepairExecutionLog, RepairExecutionStatus } from "./types.ts";

const EXCLUDED_SEGMENTS = new Set([".git", "node_modules", ".next", ".dekoclean", "backups", "backup"]);

export interface EchoRecoveryDependencies {
  writeProposed?: (target: string, content: string, mode: number) => void;
}

function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

function atomicReplace(target: string, content: string | Buffer, mode: number): void {
  const temporary = path.join(path.dirname(target), `.${path.basename(target)}.echo-recovery-${process.pid}-${randomUUID()}.tmp`);
  let descriptor: number | undefined;
  try {
    descriptor = fs.openSync(temporary, "wx", mode);
    fs.writeFileSync(descriptor, content);
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporary, target);
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function safeTarget(projectRoot: string, relativePath: string): string {
  const normalized = toPosixPath(relativePath).replace(/^\.\//, "");
  const segments = normalized.split("/");
  if (!normalized || segments.some((segment) => EXCLUDED_SEGMENTS.has(segment.toLowerCase()) || segment === "..")) {
    throw Object.assign(new Error("The repair target is excluded or unsafe."), { code: "TARGET_PATH_REJECTED" });
  }
  const filename = segments.at(-1) ?? "";
  if (/(?:^|[._-])(?:secret|secrets|credentials?|private[-_]?key|id_rsa)(?:[._-]|$)/i.test(filename)) {
    throw Object.assign(new Error("Environment and secret files are excluded from repair."), { code: "EXCLUDED_FILE" });
  }
  const config = createDekoCleanConfig(projectRoot);
  if (isProtectedPath(normalized, config)) {
    throw Object.assign(new Error("The repair target is protected."), { code: "EXCLUDED_FILE" });
  }
  const target = resolveInsideProject(config.projectRoot, normalized);
  const relative = path.relative(config.projectRoot, target);
  let cursor = config.projectRoot;
  for (const segment of relative.split(path.sep)) {
    cursor = path.join(cursor, segment);
    if (fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink()) {
      throw Object.assign(new Error("Symbolic links are not valid EchoRecovery targets."), { code: "SYMLINK_REJECTED" });
    }
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    throw Object.assign(new Error("The repair target is not a regular file."), { code: "TARGET_NOT_FILE" });
  }
  return target;
}

function result(log: RepairExecutionLog, message: string): EchoRepairExecutionResult {
  return { ok: log.status === "completed", status: log.status, recipeId: log.recipeId, log, message, errorCode: log.errorCode };
}

function initialLog(recipeId: string, recipe?: DekoCleanRepairRecipe): RepairExecutionLog {
  const change = recipe?.changes[0];
  return {
    id: `repair-execution-${Date.now()}-${randomUUID().slice(0, 8)}`,
    recipeId,
    targetPath: change?.path ?? "",
    startedAt: new Date().toISOString(),
    status: "pending",
    expectedBeforeChecksum: change?.expectedBeforeChecksum ?? "",
    expectedAfterChecksum: change?.expectedAfterChecksum ?? "",
  };
}

function finish(
  log: RepairExecutionLog,
  status: RepairExecutionStatus,
  projectRoot: string,
  message: string,
  errorCode?: string,
): EchoRepairExecutionResult {
  const completed = { ...log, status, completedAt: new Date().toISOString(), errorCode, errorMessage: errorCode ? message : undefined };
  saveRepairExecutionLog(completed, projectRoot);
  return result(completed, message);
}

export function executeEchoRepair(
  recipeId: string,
  projectRoot = process.cwd(),
  dependencies: EchoRecoveryDependencies = {},
): EchoRepairExecutionResult {
  const root = path.resolve(projectRoot);
  const recipe = readRepairRecipe(recipeId, root);
  let log = initialLog(recipeId, recipe ?? undefined);

  if (!recipe) return finish(log, "rejected", root, "Repair recipe was not found.", "RECIPE_NOT_FOUND");
  const affectedFiles = [...new Set(recipe.affectedFiles)];
  const changePaths = recipe.changes.map((change) => change.path);
  if (!repairRecipeIntegrityValid(recipe) || !recipe.deterministic || affectedFiles.length === 0 || recipe.changes.length !== affectedFiles.length || new Set(changePaths).size !== changePaths.length || affectedFiles.some((file) => !changePaths.includes(file))) {
    return finish(log, "rejected", root, "Repair recipe is ambiguous or failed integrity validation.", "RECIPE_AMBIGUOUS");
  }
  if (Date.parse(recipe.expiresAt) <= Date.now()) {
    updateRepairRecipe({ ...recipe, status: "rejected" }, root);
    return finish(log, "rejected", root, "Repair recipe expired.", "RECIPE_EXPIRED");
  }
  if (recipe.status !== "accepted" || !recipe.acceptedAt || !recipe.acceptedBy) {
    const code = ["executing", "executed", "rejected"].includes(recipe.status) ? "RECIPE_ALREADY_USED" : "RECIPE_NOT_ACCEPTED";
    return finish(log, "rejected", root, code === "RECIPE_ALREADY_USED" ? "Repair recipe has already been used." : "Repair recipe was not explicitly accepted.", code);
  }

  if (recipe.changes.some((change) => recipe.expectedChecksums[change.path]?.before !== change.expectedBeforeChecksum || recipe.expectedChecksums[change.path]?.after !== change.expectedAfterChecksum)) {
    updateRepairRecipe({ ...recipe, status: "rejected" }, root);
    return finish(log, "rejected", root, "Repair recipe checksum metadata is inconsistent.", "RECIPE_AMBIGUOUS");
  }

  if (!claimRepairRecipeExecution(recipe.id, root)) {
    return finish(log, "rejected", root, "Repair recipe has already been claimed for execution.", "RECIPE_ALREADY_USED");
  }
  log = {
    ...log,
    status: "executing",
    totalFiles: recipe.changes.length,
    completedFiles: 0,
    fileResults: recipe.changes.map((change) => ({
      targetPath: change.path, status: "pending", expectedBeforeChecksum: change.expectedBeforeChecksum, expectedAfterChecksum: change.expectedAfterChecksum,
    })),
  };
  saveRepairExecutionLog(log, root);

  type PreparedFile = { change: DekoCleanRepairRecipe["changes"][number]; target: string; original: string; proposed: string; mode: number; backup: string; backupRelative: string };
  const backupSegment = `${Date.now()}-${log.id}`;
  const prepared: PreparedFile[] = [];
  try {
    for (const change of recipe.changes) {
      const target = safeTarget(root, change.path);
      const original = fs.readFileSync(target, "utf8");
      const actualBeforeChecksum = sha256(original);
      if (actualBeforeChecksum !== change.expectedBeforeChecksum) throw Object.assign(new Error(`The file changed after preview generation: ${change.path}`), { code: "SOURCE_CHECKSUM_MISMATCH" });
      if (original.split(change.before).length - 1 !== 1) throw Object.assign(new Error(`The exact patch is no longer unambiguous: ${change.path}`), { code: "PATCH_NOT_EXACT" });
      const proposed = original.replace(change.before, change.after);
      if (sha256(proposed) !== change.expectedAfterChecksum) throw Object.assign(new Error(`The recipe checksum is invalid: ${change.path}`), { code: "RECIPE_CHECKSUM_INVALID" });
      prepared.push({
        change, target, original, proposed, mode: fs.statSync(target).mode & 0o777,
        backup: path.join(repairBackupRoot(root), backupSegment, change.path),
        backupRelative: toPosixPath(path.join(".dekoclean", "repair", "backups", backupSegment, change.path)),
      });
      const index = recipe.changes.indexOf(change);
      if (log.fileResults) log.fileResults[index] = { ...log.fileResults[index], actualBeforeChecksum };
      if (index === 0) log = { ...log, actualBeforeChecksum };
    }
  } catch (error) {
    updateRepairRecipe({ ...recipe, status: "rejected" }, root);
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "TARGET_PATH_REJECTED";
    return finish(log, "rejected", root, error instanceof Error ? error.message : "Repair preflight failed.", code);
  }

  try {
    for (let index = 0; index < prepared.length; index += 1) {
      const file = prepared[index];
      fs.mkdirSync(path.dirname(file.backup), { recursive: true, mode: 0o700 });
      fs.copyFileSync(file.target, file.backup, fs.constants.COPYFILE_EXCL);
      fs.chmodSync(file.backup, 0o600);
      if (sha256(fs.readFileSync(file.backup)) !== file.change.expectedBeforeChecksum) throw new Error(`Backup checksum verification failed: ${file.change.path}`);
      if (log.fileResults) log.fileResults[index] = { ...log.fileResults[index], status: "backed-up", backupPath: file.backupRelative };
      log = { ...log, backupPath: index === 0 ? file.backupRelative : log.backupPath, backupVerified: index === prepared.length - 1 };
      saveRepairExecutionLog(log, root);
    }
  } catch (error) {
    updateRepairRecipe({ ...recipe, status: "rejected" }, root);
    return finish(log, "failed", root, error instanceof Error ? error.message : "Verified backup creation failed.", "BACKUP_FAILED");
  }

  let failure: { code: string; message: string } | null = null;
  for (let index = 0; index < prepared.length; index += 1) {
    const file = prepared[index];
    try {
      (dependencies.writeProposed ?? atomicReplace)(file.target, file.proposed, file.mode);
      const actualAfterChecksum = sha256(fs.readFileSync(file.target));
      if (log.fileResults) log.fileResults[index] = { ...log.fileResults[index], actualAfterChecksum };
      if (actualAfterChecksum !== file.change.expectedAfterChecksum) throw Object.assign(new Error(`Post-write checksum verification failed: ${file.change.path}`), { code: "POST_WRITE_CHECKSUM_MISMATCH" });
      if (log.fileResults) log.fileResults[index] = { ...log.fileResults[index], status: "completed" };
      log = { ...log, completedFiles: index + 1, actualAfterChecksum: index === 0 ? actualAfterChecksum : log.actualAfterChecksum };
      saveRepairExecutionLog(log, root);
    } catch (error) {
      failure = { code: typeof error === "object" && error && "code" in error ? String(error.code) : "WRITE_FAILED_ROLLED_BACK", message: error instanceof Error ? error.message : `Repair write failed: ${file.change.path}` };
      if (log.fileResults) log.fileResults[index] = { ...log.fileResults[index], status: "failed" };
      break;
    }
  }

  if (failure) {
    let rollbackPassed = true;
    for (let index = prepared.length - 1; index >= 0; index -= 1) {
      const file = prepared[index];
      try {
        atomicReplace(file.target, fs.readFileSync(file.backup), file.mode);
        if (sha256(fs.readFileSync(file.target)) !== file.change.expectedBeforeChecksum) rollbackPassed = false;
        else if (log.fileResults) log.fileResults[index] = { ...log.fileResults[index], status: "rolled-back" };
      } catch { rollbackPassed = false; }
    }
    updateRepairRecipe({ ...recipe, status: "executed", executedAt: new Date().toISOString() }, root);
    if (!rollbackPassed) return finish(log, "failed", root, "Repair failed and one or more backups could not be restored safely.", "ROLLBACK_FAILED");
    return finish(log, "rolled-back", root, `${failure.message}; all affected files were restored.`, failure.code);
  }

  updateRepairRecipe({ ...recipe, status: "executed", executedAt: new Date().toISOString() }, root);
  try { updateFindingStatus(recipe.findingId, "resolved", root); } catch { /* a refreshed scan may already have replaced the finding */ }
  return finish({ ...log, checksumVerified: true }, "completed", root, `Repair completed for ${prepared.length} files with verified backups and checksums.`);
}

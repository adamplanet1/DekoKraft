import { randomUUID } from "node:crypto";
import fs from "node:fs";

import { appendDekoCleanAudit } from "./auditLog.ts";
import { readActionPlan } from "./actionPlans.ts";
import { createDekoCleanConfig } from "./config.ts";
import { readFindings, updateFindingLifecycle, updateFindingStatus } from "./findingStore.ts";
import { isProtectedPath, resolveInsideProject } from "./pathSafety.ts";
import { checksumPath, quarantineFindingPaths } from "./quarantine.ts";
import { restoreDekoCleanManifest } from "./restore.ts";
import type { DekoCleanAuditEntry, DekoCleanValidationResult } from "./types.ts";
import { validateDekoCleanOperation } from "./validation.ts";
import { recordHealthScore } from "./healthScore.ts";
import { appendAuditTimeline } from "./timeline.ts";
import { recordDekoIndexSnapshot } from "./missionControl.ts";
import type { DekoIndexTrigger } from "./missionControlTypes.ts";
import { createRecoveryPoint } from "../dekorebuild/recoveryPoints.ts";

function checksums(paths: string[], projectRoot: string): Record<string, string> {
  return Object.fromEntries(paths.flatMap((relativePath) => {
    const absolutePath = resolveInsideProject(projectRoot, relativePath);
    return fs.existsSync(absolutePath) ? [[relativePath, checksumPath(absolutePath)]] : [];
  }));
}

function manifestValidation(operationId: string, commands: Array<{ command: string; success: boolean; exitCode: number | null; output: string }>): DekoCleanValidationResult {
  return {
    operationId,
    lintPassed: commands.find((result) => result.command === "npm run lint")?.success ?? false,
    buildPassed: commands.find((result) => result.command === "npm run build")?.success ?? false,
    diffCheckPassed: commands.find((result) => result.command === "git diff --check")?.success ?? false,
    integrityPassed: commands.every((result) => result.success),
    commands,
    createdAt: new Date().toISOString(),
  };
}

export interface ExecutePlanOptions {
  planId: string;
  confirmed: boolean;
  adminReference: string;
  projectRoot?: string;
  restoreManifestId?: string;
}

export async function executeDekoCleanPlan(options: ExecutePlanOptions): Promise<DekoCleanAuditEntry> {
  if (!options.confirmed) throw new Error("Explicit admin confirmation is required.");
  const projectRoot = createDekoCleanConfig(options.projectRoot).projectRoot;
  const healthBefore = recordHealthScore(projectRoot).value;
  const plan = readActionPlan(options.planId, projectRoot);
  const findings = readFindings(projectRoot).filter((finding) => plan.findingIds.includes(finding.id));
  if (findings.length !== plan.findingIds.length) throw new Error("One or more findings no longer exist.");
  if (plan.affectedPaths.some((filePath) => isProtectedPath(filePath, createDekoCleanConfig(projectRoot))) && ["quarantine", "recreate"].includes(plan.action)) {
    throw new Error("Protected paths cannot be quarantined or recreated by an action plan.");
  }

  const operationId = randomUUID();
  const beforeChecksums = checksums(plan.affectedPaths, projectRoot);
  let validationResult: DekoCleanValidationResult | undefined;
  let snapshotManifestId: string | undefined;
  let status: DekoCleanAuditEntry["status"] = "completed";
  let rollbackStatus: DekoCleanAuditEntry["rollbackStatus"] = plan.rollbackAvailable ? "available" : "not-required";
  const lifecycleFinding = findings[0];
  if (lifecycleFinding && ["validate", "repair", "restore", "recreate"].includes(plan.action)) {
    updateFindingLifecycle(lifecycleFinding.id, { status: plan.action === "validate" ? "VALIDATING" : "IN_PROGRESS", action: plan.action as "validate" | "repair" | "restore" | "recreate", success: false }, projectRoot);
  }

  if (["quarantine", "restore"].includes(plan.action)) {
    const recoveryPoint = await createRecoveryPoint({ type: plan.action === "restore" ? "automatic" : "before-repair", createdBy: options.adminReference, operationId: `before-${operationId}`, projectRoot });
    if (recoveryPoint.status !== "verified") throw new Error("DekoRebuild refused the operation because the pre-operation recovery point did not pass validation.");
  }

  try {
    if (plan.action === "ignore") {
      for (const finding of findings) updateFindingStatus(finding.id, "ignored", projectRoot);
    } else if (plan.action === "validate" || plan.action === "scan") {
      validationResult = await validateDekoCleanOperation(projectRoot, operationId);
    } else if (plan.action === "quarantine") {
      const manifest = quarantineFindingPaths({
        projectRoot, confirmed: true, paths: plan.affectedPaths, findingId: findings[0]?.id ?? plan.findingIds[0],
        adminReference: options.adminReference, validate: true,
      });
      if (!manifest) throw new Error("Quarantine confirmation failed.");
      snapshotManifestId = manifest.id;
      validationResult = manifestValidation(operationId, manifest.validation);
      for (const finding of findings) updateFindingStatus(finding.id, validationResult.integrityPassed ? "resolved" : "failed", projectRoot);
      if (!validationResult.integrityPassed) rollbackStatus = "recommended";
    } else if (plan.action === "restore") {
      if (!options.restoreManifestId) throw new Error("A restore manifest id is required.");
      const manifest = restoreDekoCleanManifest(projectRoot, options.restoreManifestId);
      snapshotManifestId = manifest.id;
      validationResult = await validateDekoCleanOperation(projectRoot, operationId);
      for (const finding of findings) updateFindingStatus(finding.id, validationResult.integrityPassed ? "resolved" : "failed", projectRoot);
    } else {
      throw new Error(`${plan.action} requires a deterministic reviewed recipe and is not auto-executable in v1.`);
    }
    if (lifecycleFinding && ["validate", "repair", "restore", "recreate"].includes(plan.action)) {
      const passed = validationResult?.integrityPassed ?? false;
      updateFindingLifecycle(lifecycleFinding.id, { status: passed ? "RESOLVED" : "FAILED", action: plan.action as "validate" | "repair" | "restore" | "recreate", success: passed, reason: passed ? undefined : "Validation did not pass for the finding." , message: passed ? "The finding was no longer detected after validation." : "The finding is still present." }, projectRoot);
    }
  } catch (error) {
    status = "failed";
    rollbackStatus = plan.rollbackAvailable ? "recommended" : "not-required";
    const failedEntry: DekoCleanAuditEntry = {
      operationId, findingId: findings[0]?.id, action: plan.action, adminReference: options.adminReference,
      affectedPaths: plan.affectedPaths, beforeChecksums, afterChecksums: checksums(plan.affectedPaths, projectRoot),
      snapshotManifestId, validationResult, rollbackStatus, status, createdAt: new Date().toISOString(),
    };
    appendDekoCleanAudit(failedEntry, projectRoot);
    const healthAfter = recordHealthScore(projectRoot).value;
    appendAuditTimeline(failedEntry, healthBefore, healthAfter, projectRoot);
    if (lifecycleFinding && ["validate", "repair", "restore", "recreate"].includes(plan.action)) {
      updateFindingLifecycle(lifecycleFinding.id, { status: "FAILED", action: plan.action as "validate" | "repair" | "restore" | "recreate", success: false, reason: error instanceof Error ? error.message : "Action failed." }, projectRoot);
    }
    const trigger = (["repair", "restore", "recreate", "quarantine", "rollback"].includes(plan.action) ? plan.action : plan.action === "validate" ? "build" : null) as DekoIndexTrigger | null;
    if (trigger) await recordDekoIndexSnapshot({ operationId, trigger }, projectRoot).catch((snapshotError) => console.error("[DekoClean] Mission Control snapshot failed.", snapshotError));
    throw error;
  }

  const entry: DekoCleanAuditEntry = {
    operationId, findingId: findings[0]?.id, action: plan.action, adminReference: options.adminReference,
    affectedPaths: plan.affectedPaths, beforeChecksums, afterChecksums: checksums(plan.affectedPaths, projectRoot),
    snapshotManifestId, validationResult, rollbackStatus, status, createdAt: new Date().toISOString(),
  };
  appendDekoCleanAudit(entry, projectRoot);
  const healthAfter = recordHealthScore(projectRoot).value;
  appendAuditTimeline(entry, healthBefore, healthAfter, projectRoot);
  const trigger = (["repair", "restore", "recreate", "quarantine", "rollback"].includes(plan.action) ? plan.action : plan.action === "validate" ? "build" : null) as DekoIndexTrigger | null;
  if (trigger) await recordDekoIndexSnapshot({ operationId, trigger }, projectRoot).catch((snapshotError) => console.error("[DekoClean] Mission Control snapshot failed.", snapshotError));
  return entry;
}

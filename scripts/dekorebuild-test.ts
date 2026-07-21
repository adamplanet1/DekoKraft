import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  cancelRecoveryOperation,
  createRecoveryPreview,
  executeFileRecovery,
  readRecoveryOperation,
  rollbackRecovery,
} from "../lib/dekorebuild/operations.ts";
import { createRecoveryPoint, type RecoveryValidator } from "../lib/dekorebuild/recoveryPoints.ts";
import { readRecoveryManifest, readRecoveryPoints } from "../lib/dekorebuild/storage.ts";

const healthyValidator: RecoveryValidator = async () => ({
  lintPassed: true,
  buildPassed: true,
  diffCheckPassed: true,
  radarPassed: true,
  protectedIntegrityPassed: true,
  manifestsValid: true,
  commands: [],
  validatedAt: new Date().toISOString(),
});

const failingValidator: RecoveryValidator = async () => ({
  ...(await healthyValidator("")),
  buildPassed: false,
});

async function main(): Promise<void> {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dekorebuild-test-"));
  try {
    fs.mkdirSync(path.join(projectRoot, "app"), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, ".next", "server"), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, "package.json"), '{"name":"fixture","version":"1.0.0"}\n');
    fs.writeFileSync(path.join(projectRoot, "app", "a.ts"), 'export const value = "healthy";\n');
    fs.writeFileSync(path.join(projectRoot, "app", "b.ts"), 'export const stable = true;\n');
    fs.writeFileSync(path.join(projectRoot, ".next", "server", "generated.js"), "generated\n");

    const invalid = await createRecoveryPoint({
      type: "manual",
      createdBy: "test-admin",
      operationId: "invalid-point-operation",
      projectRoot,
      validator: failingValidator,
    });
    assert.equal(invalid.status, "invalid", "failed validation must not create a verified point");

    const point = await createRecoveryPoint({
      type: "manual",
      createdBy: "test-admin",
      operationId: "healthy-point-operation",
      projectRoot,
      validator: healthyValidator,
    });
    assert.equal(point.status, "verified");
    const manifest = readRecoveryManifest(point.manifestReference, projectRoot);
    assert.equal(manifest.entries.some((entry) => entry.path.startsWith(".next/")), false, "generated folders must be excluded");

    const duplicate = await createRecoveryPoint({
      type: "manual",
      createdBy: "test-admin",
      operationId: "healthy-point-operation",
      projectRoot,
      validator: healthyValidator,
    });
    assert.equal(duplicate.recoveryPointId, point.recoveryPointId, "operation ids must be idempotent");

    const deduplicated = await createRecoveryPoint({
      type: "manual",
      createdBy: "test-admin",
      operationId: "deduplicated-point-operation",
      projectRoot,
      validator: healthyValidator,
    });
    assert.equal(deduplicated.storageBytesAdded, 0, "unchanged content must reuse content-addressed objects");

    assert.throws(
      () => createRecoveryPreview({ recoveryPointId: point.recoveryPointId, selectedPath: "../outside.ts", projectRoot, createdBy: "test-admin" }),
      /outside|unsafe|path/i,
      "path traversal must be rejected",
    );

    fs.writeFileSync(path.join(projectRoot, "app", "a.ts"), 'export const value = "damaged";\n');
    const beforeStable = fs.readFileSync(path.join(projectRoot, "app", "b.ts"), "utf8");
    const preview = createRecoveryPreview({
      recoveryPointId: point.recoveryPointId,
      selectedPath: "app/a.ts",
      detectedProblem: "fixture damage",
      operationId: "restore-file-operation",
      projectRoot,
      createdBy: "test-admin",
    });
    assert.deepEqual(preview.filesToRestore, ["app/a.ts"]);

    const executed = await executeFileRecovery({
      operationId: preview.operationId,
      confirmed: true,
      projectRoot,
      validator: healthyValidator,
      profileRunner: async () => true,
    });
    assert.equal(executed.status, "awaiting-acceptance");
    assert.ok(executed.emergencyRecoveryPointId, "an emergency point must exist before mutation");
    assert.equal(fs.readFileSync(path.join(projectRoot, "app", "a.ts"), "utf8"), 'export const value = "healthy";\n');
    assert.equal(fs.readFileSync(path.join(projectRoot, "app", "b.ts"), "utf8"), beforeStable, "unselected files must remain unchanged");
    assert.equal(readRecoveryPoints(projectRoot).some((entry) => entry.recoveryPointId === executed.emergencyRecoveryPointId && entry.type === "emergency"), true);

    const idempotentExecution = await executeFileRecovery({ operationId: preview.operationId, confirmed: true, projectRoot, validator: healthyValidator });
    assert.equal(idempotentExecution.updatedAt, executed.updatedAt, "completed execution must not run twice");

    const rolledBack = await rollbackRecovery({ operationId: preview.operationId, confirmed: true, projectRoot, validator: healthyValidator });
    assert.equal(rolledBack.status, "rolled-back");
    assert.equal(fs.readFileSync(path.join(projectRoot, "app", "a.ts"), "utf8"), 'export const value = "damaged";\n', "rollback must restore the pre-recovery file");

    const cancelPreview = createRecoveryPreview({
      recoveryPointId: point.recoveryPointId,
      selectedPath: "app/a.ts",
      operationId: "cancel-preview-operation",
      projectRoot,
      createdBy: "test-admin",
    });
    const beforeCancel = fs.readFileSync(path.join(projectRoot, "app", "a.ts"), "utf8");
    assert.equal(cancelRecoveryOperation({ operationId: cancelPreview.operationId, projectRoot }).status, "cancelled");
    assert.equal(fs.readFileSync(path.join(projectRoot, "app", "a.ts"), "utf8"), beforeCancel, "cancelling a preview must not mutate files");

    const projectPreview = createRecoveryPreview({
      recoveryPointId: point.recoveryPointId,
      selectedPath: "app/a.ts",
      operationId: "project-scope-operation",
      projectRoot,
      createdBy: "test-admin",
      level: "project",
    });
    await assert.rejects(
      executeFileRecovery({ operationId: projectPreview.operationId, confirmed: true, projectRoot, validator: healthyValidator }),
      /second explicit confirmation/i,
    );
    await assert.rejects(
      executeFileRecovery({ operationId: projectPreview.operationId, confirmed: true, secondConfirmation: true, projectRoot, validator: healthyValidator }),
      /file-level recovery only/i,
    );

    const protectedPreview = createRecoveryPreview({
      recoveryPointId: point.recoveryPointId,
      selectedPath: "package.json",
      operationId: "protected-file-operation",
      projectRoot,
      createdBy: "test-admin",
    });
    assert.equal(protectedPreview.requiresProtectedConfirmation, true);
    await assert.rejects(
      executeFileRecovery({ operationId: protectedPreview.operationId, confirmed: true, projectRoot, validator: healthyValidator }),
      /stronger explicit confirmation/i,
    );
    assert.equal(readRecoveryOperation(protectedPreview.operationId, projectRoot)?.status, "previewed");

    console.log("DekoRebuild recovery tests passed.");
  } finally {
    fs.rmSync(projectRoot, { recursive: true, force: true });
  }
}

void main();

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";

import { executeEchoRepair } from "../lib/dekoclean/echoRecovery.ts";
import { enrichFinding } from "../lib/dekoclean/findingEngine.ts";
import { createRepairPreview } from "../lib/dekoclean/repairPreview.ts";
import {
  acceptRepairRecipe, readRepairExecutionLogs, recipeIntegrity, saveRepairRecipe,
} from "../lib/dekoclean/repairRecipeStore.ts";
import type { DekoCleanRepairRecipe } from "../lib/dekoclean/types.ts";

const suiteRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-echo-recovery-"));

function fixture(root: string, relativePath: string, content: string): void {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}

function scenario(name: string): { root: string; source: string; recipe: DekoCleanRepairRecipe } {
  const root = path.join(suiteRoot, name);
  const source = 'const untouched = "keep";\nimport Card from "../ui/Card";\nexport default Card;\n';
  fixture(root, "package.json", '{"private":true}\n');
  fixture(root, "app/page.tsx", source);
  fixture(root, "components/Card.tsx", "export default function Card(){return null}\n");
  const finding = enrichFinding({
    id: `finding-${name}`, type: "broken-import", severity: "high", title: "Broken import", explanation: "fixture",
    affectedPaths: ["app/page.tsx"], evidence: ["Import: ../ui/Card"], detectedBy: "dekoradar",
    detectedAt: new Date().toISOString(), recommendedActions: ["repair", "restore"], requiresAdminConfirmation: true, status: "new",
  });
  return { root, source, recipe: createRepairPreview(finding, root) };
}

function accepted(name: string) {
  const value = scenario(name);
  acceptRepairRecipe(value.recipe.id, "admin@test.local", value.root);
  return value;
}

function derivedRecipe(base: DekoCleanRepairRecipe, patch: Partial<DekoCleanRepairRecipe>): DekoCleanRepairRecipe {
  const withoutHash = {
    ...base, ...patch, id: `repair-preview-${randomUUID()}`, status: "pending" as const,
    acceptedAt: undefined, acceptedBy: undefined, executedAt: undefined,
  };
  const immutable: Partial<DekoCleanRepairRecipe> = { ...withoutHash };
  delete immutable.integrityHash;
  return { ...withoutHash, integrityHash: recipeIntegrity(immutable as Omit<DekoCleanRepairRecipe, "integrityHash">) };
}

try {
  {
    const root = path.join(suiteRoot, "multi-file");
    const first = 'import Card from "../ui/Card";\nexport default Card;\n';
    const second = 'import Card from "../ui/Card";\nexport const Secondary = Card;\n';
    fixture(root, "package.json", '{"private":true}\n');
    fixture(root, "app/page.tsx", first);
    fixture(root, "app/secondary.tsx", second);
    fixture(root, "components/Card.tsx", "export default function Card(){return null}\n");
    const finding = enrichFinding({
      id: "finding-multi-file", type: "broken-import", severity: "high", title: "Broken imports", explanation: "fixture",
      affectedPaths: ["app/page.tsx", "app/secondary.tsx"], evidence: ["Import: ../ui/Card"], detectedBy: "dekoradar",
      detectedAt: new Date().toISOString(), recommendedActions: ["repair", "restore"], requiresAdminConfirmation: true, status: "new",
    });
    const recipe = createRepairPreview(finding, root);
    assert.equal(recipe.changes.length, 2, "preview contains one deterministic change per affected file");
    acceptRepairRecipe(recipe.id, "admin@test.local", root);
    const result = executeEchoRepair(recipe.id, root);
    assert.equal(result.status, "completed");
    assert.equal(result.log.totalFiles, 2);
    assert.equal(result.log.completedFiles, 2);
    assert.deepEqual(result.log.fileResults?.map((entry) => entry.status), ["completed", "completed"], "progress is persisted after each file");
    assert.equal(fs.readFileSync(path.join(root, "app/page.tsx"), "utf8"), first.replace("../ui/Card", "../components/Card"));
    assert.equal(fs.readFileSync(path.join(root, "app/secondary.tsx"), "utf8"), second.replace("../ui/Card", "../components/Card"));
  }

  {
    const { root, source, recipe } = accepted("success");
    const result = executeEchoRepair(recipe.id, root);
    assert.equal(result.status, "completed", "successful repair completes");
    assert.equal(result.log.backupVerified, true, "backup is checksum verified");
    assert.ok(result.log.backupPath && fs.existsSync(path.join(root, result.log.backupPath)), "timestamped backup exists");
    const repaired = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
    assert.equal(repaired, source.replace("../ui/Card", "../components/Card"), "only the exact previewed patch is applied");
    assert.equal(readRepairExecutionLogs(root).at(-1)?.status, "completed", "success is persisted in the repair log");
    assert.equal(executeEchoRepair(recipe.id, root).errorCode, "RECIPE_ALREADY_USED", "duplicate execution is rejected");
  }

  {
    const root = path.join(suiteRoot, "multi-file");
    const first = 'import Card from "../ui/Card";\nexport default Card;\n';
    const second = 'const label = "keep";\nimport Card from "../ui/Card";\nexport default Card;\n';
    fixture(root, "package.json", '{"private":true}\n');
    fixture(root, "app/page.tsx", first);
    fixture(root, "app/secondary.tsx", second);
    fixture(root, "components/Card.tsx", "export default function Card(){return null}\n");
    const finding = enrichFinding({
      id: "finding-multi-file", type: "broken-import", severity: "high", title: "Broken imports", explanation: "fixture",
      affectedPaths: ["app/page.tsx", "app/secondary.tsx"], evidence: ["Import: ../ui/Card"], detectedBy: "dekoradar",
      detectedAt: new Date().toISOString(), recommendedActions: ["repair"], requiresAdminConfirmation: true, status: "new",
    });
    const recipe = createRepairPreview(finding, root);
    assert.equal(recipe.affectedFiles.length, 2, "preview includes every affected file");
    acceptRepairRecipe(recipe.id, "admin@test.local", root);
    const result = executeEchoRepair(recipe.id, root);
    assert.equal(result.status, "completed", "multi-file repair completes sequentially");
    assert.equal(result.log.completedFiles, 2, "progress records both completed files");
    assert.equal(fs.readFileSync(path.join(root, "app/page.tsx"), "utf8"), first.replace("../ui/Card", "../components/Card"));
    assert.equal(fs.readFileSync(path.join(root, "app/secondary.tsx"), "utf8"), second.replace("../ui/Card", "../components/Card"));
  }

  {
    const { root, recipe } = accepted("source-mismatch");
    fs.appendFileSync(path.join(root, "app/page.tsx"), "// changed after preview\n");
    const result = executeEchoRepair(recipe.id, root);
    assert.equal(result.errorCode, "SOURCE_CHECKSUM_MISMATCH", "pre-change checksum mismatch aborts safely");
    assert.equal(result.log.backupPath, undefined, "no backup or write occurs after source mismatch");
  }

  {
    const { root, source, recipe } = accepted("post-mismatch");
    const result = executeEchoRepair(recipe.id, root, {
      writeProposed(target) { fs.writeFileSync(target, "corrupted post-write content", "utf8"); },
    });
    assert.equal(result.status, "rolled-back", "post-write checksum mismatch rolls back");
    assert.equal(result.errorCode, "POST_WRITE_CHECKSUM_MISMATCH");
    assert.equal(fs.readFileSync(path.join(root, "app/page.tsx"), "utf8"), source, "automatic rollback restores the verified backup");
    assert.equal(readRepairExecutionLogs(root).at(-1)?.status, "rolled-back", "rollback is persisted");
  }

  {
    const { root, recipe } = scenario("unaccepted");
    assert.equal(executeEchoRepair(recipe.id, root).errorCode, "RECIPE_NOT_ACCEPTED", "unaccepted recipe is rejected");
    assert.equal(executeEchoRepair("repair-preview-00000000-0000-0000-0000-000000000000", root).errorCode, "RECIPE_NOT_FOUND", "missing recipe is rejected");
  }

  {
    const { root, recipe } = scenario("path-traversal");
    const change = { ...recipe.changes[0], path: "../outside.ts" };
    const unsafe = derivedRecipe(recipe, { affectedFiles: [change.path], changes: [change], expectedChecksums: { [change.path]: { before: change.expectedBeforeChecksum, after: change.expectedAfterChecksum } } });
    saveRepairRecipe(unsafe, root); acceptRepairRecipe(unsafe.id, "admin@test.local", root);
    assert.equal(executeEchoRepair(unsafe.id, root).errorCode, "TARGET_PATH_REJECTED", "path traversal is rejected");
  }

  {
    const { root, recipe } = scenario("ambiguous");
    const ambiguous = derivedRecipe(recipe, { changes: [recipe.changes[0], { ...recipe.changes[0] }] });
    saveRepairRecipe(ambiguous, root); acceptRepairRecipe(ambiguous.id, "admin@test.local", root);
    assert.equal(executeEchoRepair(ambiguous.id, root).errorCode, "RECIPE_AMBIGUOUS", "ambiguous multi-change recipe is rejected");
  }

  {
    const { root, recipe } = scenario("excluded-file");
    const secret = "SECRET=before\n";
    fixture(root, ".env.local", secret);
    const change = {
      ...recipe.changes[0], path: ".env.local", before: "before", after: "after",
      expectedBeforeChecksum: createHashValue(secret), expectedAfterChecksum: createHashValue(secret.replace("before", "after")),
    };
    const excluded = derivedRecipe(recipe, { affectedFiles: [change.path], changes: [change], expectedChecksums: { [change.path]: { before: change.expectedBeforeChecksum, after: change.expectedAfterChecksum } } });
    saveRepairRecipe(excluded, root); acceptRepairRecipe(excluded.id, "admin@test.local", root);
    assert.equal(executeEchoRepair(excluded.id, root).errorCode, "EXCLUDED_FILE", "environment files are rejected");
    assert.equal(fs.readFileSync(path.join(root, ".env.local"), "utf8"), secret);
  }

  console.log("EchoRecovery execution boundary tests passed.");
} finally {
  fs.rmSync(suiteRoot, { recursive: true, force: true });
}

function createHashValue(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readFindingLifecycleEvents, readFindings, updateFindingLifecycle, writeFindings } from "../lib/dekoclean/findingStore.ts";
import type { DekoCleanFinding } from "../lib/dekoclean/types.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-lifecycle-"));
try {
  const finding = { id: "legacy-finding", type: "broken-import", category: "broken-imports", severity: "high", title: "legacy", description: "legacy", explanation: "legacy", affectedFiles: ["app/page.tsx"], affectedPaths: ["app/page.tsx"], count: 1, evidence: ["Import: ../ui/Card"], dependencies: [], relatedFindingIds: [], detectedBy: "dekoclean", source: "dekoclean", detectedAt: new Date().toISOString(), recommendedAction: "validate", recommendedActions: ["validate"], repairAvailable: false, canRollback: false, canValidate: true, requiresAdminConfirmation: true, status: "new" } as DekoCleanFinding;
  writeFindings([finding], root);
  const legacy = readFindings(root)[0];
  assert.equal(legacy.lifecycle?.status, "OPEN");
  updateFindingLifecycle(legacy.id, { status: "VALIDATING", action: "validate", success: false }, root);
  updateFindingLifecycle(legacy.id, { status: "RESOLVED", action: "validate", success: true, message: "resolved" }, root);
  assert.equal(readFindings(root)[0].lifecycle?.status, "RESOLVED");
  assert.equal(readFindingLifecycleEvents(root).length, 2);
  console.log("DekoClean finding lifecycle tests passed.");
} finally { fs.rmSync(root, { recursive: true, force: true }); }

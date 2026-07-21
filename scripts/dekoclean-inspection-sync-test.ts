import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { enrichFinding } from "../lib/dekoclean/findingEngine.ts";
import { readFindings, saveDetectedFindings, writeFindings } from "../lib/dekoclean/findingStore.ts";
import { calculateInspectionCounters, selectInspectionFindings, selectVisibleInspectionFindings } from "../lib/dekoclean/findingSelectors.ts";
import { displayedFindingsLabel, findingDisplayStatus, noActionableFindingsMessage } from "../lib/dekoclean/findingPresentation.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-inspection-"));
try {
  const sixteenInformational = Array.from({ length: 16 }, (_, index) => enrichFinding({ id: `info-${index}`, findingId: `info-${index}`, type: "unused-file", severity: "info", title: `Informational ${index}`, explanation: "No action required", affectedPaths: [`public/info-${index}.webp`], evidence: ["informational"], detectedBy: "dekoclean", detectedAt: "2026-07-21T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: false, status: "new" }));
  const sixteenCounters = calculateInspectionCounters(sixteenInformational);
  assert.equal(sixteenCounters.totalFindings, 16);
  assert.equal(selectVisibleInspectionFindings(sixteenInformational).length, 16);
  assert.equal(sixteenCounters.actionableFindings, 0);
  assert.equal(noActionableFindingsMessage(sixteenCounters.actionableFindings), "لا توجد نتائج تحتاج إلى إجراء حاليًا. البطاقات أدناه هي سجل نتائج آخر فحص.");

  const active = enrichFinding({ id: "current-id", findingId: "current-id", type: "duplicate-file", severity: "info", title: "Duplicate", explanation: "Same content", affectedPaths: ["public/a.webp"], evidence: ["sha256:same"], detectedBy: "dekoclean", detectedAt: "2026-07-21T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: false, status: "new" });
  const ignored = enrichFinding({ id: "ignored-id", findingId: "ignored-id", type: "unknown", severity: "high", title: "Ignored manifest", explanation: "Previously ignored", affectedPaths: ["data/manifest.json"], evidence: ["invalid"], detectedBy: "dekoclean", detectedAt: "2026-07-21T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: false, status: "ignored" });
  const actionable = enrichFinding({ id: "actionable-id", findingId: "actionable-id", type: "duplicate-file", severity: "low", title: "Actionable duplicate", explanation: "Can be quarantined", affectedPaths: ["public/a.webp", "public/b.webp"], evidence: ["duplicate"], detectedBy: "dekoclean", detectedAt: "2026-07-21T00:00:00.000Z", recommendedActions: ["quarantine", "ignore"], requiresAdminConfirmation: true, status: "new" });
  const resolved = enrichFinding({ id: "resolved-id", findingId: "resolved-id", type: "unknown", severity: "info", title: "Resolved", explanation: "Resolved finding", affectedPaths: ["public/resolved.webp"], evidence: ["resolved"], detectedBy: "dekoclean", detectedAt: "2026-07-21T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: false, status: "resolved" });
  writeFindings([active, actionable, ignored, resolved], root);

  const stored = readFindings(root);
  assert.equal(stored.find((finding) => finding.id === "ignored-id")?.lifecycle?.status, "IGNORED", "legacy ignored state stays excluded");
  assert.deepEqual(selectInspectionFindings(stored).map((finding) => finding.id).sort(), ["actionable-id", "current-id"], "total findings includes every active finding before filtering");
  assert.equal(selectVisibleInspectionFindings(stored, ["current-id"]).length, 1, "visible findings equals the rendered-card selection");
  assert.deepEqual(calculateInspectionCounters(stored), { totalFindings: 2, actionableFindings: 1, uniqueAffectedFiles: 2, ignoredFindings: 1, resolvedFindings: 1 }, "counters separate cards, actionable findings, deduplicated paths, ignored, and resolved records");
  assert.equal(displayedFindingsLabel(16, 16), "النتائج المعروضة: 16 من أصل 16", "all sixteen findings are reported when no filter is active");
  assert.equal(displayedFindingsLabel(5, 16), "النتائج المعروضة: 5 من أصل 16", "displayed and total findings remain explicit");
  assert.equal(noActionableFindingsMessage(0), "لا توجد نتائج تحتاج إلى إجراء حاليًا. البطاقات أدناه هي سجل نتائج آخر فحص.", "zero actionable findings shows the history explanation");
  assert.deepEqual(findingDisplayStatus(active), { status: "informational", label: "لا تحتاج إجراء" }, "informational finding has a no-action badge");
  assert.deepEqual(findingDisplayStatus(actionable), { status: "actionable", label: "تحتاج إجراء" }, "actionable finding has an action-required badge");

  const recurring = { ...active, id: "detector-new-id", findingId: "detector-new-id", detectedAt: "2026-07-21T01:00:00.000Z" };
  const saved = saveDetectedFindings([recurring], root);
  const reconciled = saved.find((finding) => finding.fingerprint === active.fingerprint);
  assert.equal(reconciled?.id, "current-id", "recurring finding preserves its canonical stored id");

  const orchestrator = fs.readFileSync(path.join(process.cwd(), "lib/dekoclean/scan/orchestrator.ts"), "utf8");
  const scanCenter = fs.readFileSync(path.join(process.cwd(), "app/admin/dekoclean/SmartScanCenter.tsx"), "utf8");
  assert.match(orchestrator, /runFindingFingerprints/, "scan run maps persisted findings by stable fingerprint");
  assert.match(scanCenter, /await onResultsChanged\(response\.run\)/, "inspection refresh is awaited after scan completion");
  console.log("DekoClean inspection synchronization tests passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

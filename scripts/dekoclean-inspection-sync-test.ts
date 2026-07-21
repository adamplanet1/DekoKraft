import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { enrichFinding } from "../lib/dekoclean/findingEngine.ts";
import { readFindings, saveDetectedFindings, writeFindings } from "../lib/dekoclean/findingStore.ts";
import { selectInspectionFindings } from "../lib/dekoclean/findingSelectors.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-inspection-"));
try {
  const active = enrichFinding({ id: "current-id", findingId: "current-id", type: "duplicate-file", severity: "info", title: "Duplicate", explanation: "Same content", affectedPaths: ["public/a.webp"], evidence: ["sha256:same"], detectedBy: "dekoclean", detectedAt: "2026-07-21T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: false, status: "new" });
  const ignored = enrichFinding({ id: "ignored-id", findingId: "ignored-id", type: "unknown", severity: "high", title: "Ignored manifest", explanation: "Previously ignored", affectedPaths: ["data/manifest.json"], evidence: ["invalid"], detectedBy: "dekoclean", detectedAt: "2026-07-21T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: false, status: "ignored" });
  writeFindings([active, ignored], root);

  const stored = readFindings(root);
  assert.equal(stored.find((finding) => finding.id === "ignored-id")?.lifecycle?.status, "IGNORED", "legacy ignored state stays excluded");
  assert.deepEqual(selectInspectionFindings(stored).map((finding) => finding.id), ["current-id"], "inspection includes active informational findings and excludes ignored findings");

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

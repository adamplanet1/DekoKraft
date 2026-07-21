import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  clearPerformanceHistory,
  ensureDekoCleanActionStorage,
  readPerformanceHistory,
  recordIgnoredFindings,
  writePerformanceHistory,
} from "../lib/dekoclean/actionStorage.ts";
import type { PerformanceSnapshot } from "../lib/dekoclean/performance.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-actions-"));

ensureDekoCleanActionStorage(root);
for (const file of ["ignore.json", "performance-history.json"]) {
  assert.equal(fs.existsSync(path.join(root, ".dekoclean", "state", file)), true, `${file} is created`);
}
for (const directory of ["snapshots", "manifests", path.join("repair", "backups")]) {
  assert.equal(fs.existsSync(path.join(root, ".dekoclean", directory)), true, `${directory} is created`);
}

const ignored = recordIgnoredFindings(["finding-1"], "admin@example.test", root);
assert.equal(ignored[0]?.findingId, "finding-1");

const snapshot: PerformanceSnapshot = {
  schemaVersion: 1,
  id: "browser-test",
  source: "browser" as const,
  timestamp: "2026-07-21T20:00:00.000Z",
  route: "/admin/dekoclean",
  buildDurationMs: null,
  bundleSizeBytes: null,
  javascriptSizeBytes: null,
  cssSizeBytes: null,
  staticAssetSizeBytes: null,
  totalOutputSizeBytes: null,
  exportedFileCount: null,
  firstPaintMs: null,
  fcpMs: null,
  lcpMs: null,
  cls: null,
  ttfbMs: null,
  domContentLoadedMs: null,
  pageLoadMs: null,
  navigationDurationMs: null,
  hydrationMs: null,
  resourceCount: null,
  transferredBytes: null,
  decodedBytes: null,
  supportedMetrics: [],
  unavailableMetrics: [],
};
assert.deepEqual(writePerformanceHistory([snapshot], root), [snapshot]);
assert.deepEqual(readPerformanceHistory(root), [snapshot]);
clearPerformanceHistory(root);
assert.deepEqual(readPerformanceHistory(root), []);

const center = fs.readFileSync(path.join(process.cwd(), "app/admin/dekoclean/DekoCleanCenter.tsx"), "utf8");
const analytics = fs.readFileSync(path.join(process.cwd(), "app/admin/dekoclean/MissionControlAnalytics.tsx"), "utf8");
assert.match(center, /onClick=\{\(\) => void execute\("ignore"\)\}/, "Ignore invokes the execution API flow");
assert.match(center, /onClick=\{\(\) => void previewRepair\(\)\}/, "Repair invokes the preview API flow");
assert.match(center, /onClick=\{\(\) => void restoreLatest\(\)\}/, "Restore invokes the restore API flow");
assert.match(center, /onClick=\{\(\) => void analyze\(\)\}/, "Analyze Alternative invokes the recommendation API flow");
assert.match(analytics, /PERFORMANCE_MEASURE_EVENT/, "Measure Performance dispatches the collector event");
assert.match(analytics, /reloadPerformance\(true\)/, "Refresh Metrics invokes persisted history reload");
assert.match(analytics, /clearPerformance\(\)/, "Clear Performance History invokes the delete API flow");

fs.rmSync(root, { recursive: true, force: true });
console.log("DekoClean action storage tests passed.");

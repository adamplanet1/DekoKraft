import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createDekoCleanConfig } from "../lib/dekoclean/config.ts";
import { organizeFindings } from "../lib/dekoclean/findingEngine.ts";
import { scanProject } from "../lib/dekoclean/scanner.ts";
import { DEKO_SCAN_DETECTORS } from "../lib/dekoclean/scan/detectors.ts";
import { compareFileState } from "../lib/dekoclean/scan/fileState.ts";
import { DEKO_SCAN_PROFILES } from "../lib/dekoclean/scan/profiles.ts";
import { requestScanCancellation, writeScanRun } from "../lib/dekoclean/scan/runStore.ts";
import type { DekoScanRun } from "../lib/dekoclean/scan/types.ts";
import { appendTimelineEntry, readMaintenanceTimeline } from "../lib/dekoclean/timeline.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-smart-scan-"));
fs.mkdirSync(path.join(root, "app"), { recursive: true });
fs.mkdirSync(path.join(root, "public", "images"), { recursive: true });
fs.mkdirSync(path.join(root, ".next", "server"), { recursive: true });
fs.mkdirSync(path.join(root, "github-pages", "public", "images"), { recursive: true });
fs.writeFileSync(path.join(root, "app", "page.tsx"), "export default function Page(){return <img src=\"/images/item-600.webp\"/>}\n");
fs.writeFileSync(path.join(root, "app", "broken.json"), "{broken");
fs.writeFileSync(path.join(root, "public", "images", "item-600.webp"), "fixture");
fs.writeFileSync(path.join(root, ".next", "server", "ignored.js"), "generated");
fs.writeFileSync(path.join(root, "github-pages", "public", "images", "item-600.webp"), "fixture");

const config = createDekoCleanConfig(root);
const scan = scanProject(config);
assert.equal(DEKO_SCAN_PROFILES.length, 8, "Eight profiles must be registered.");
assert.equal(new Set(DEKO_SCAN_PROFILES.map((profile) => profile.id)).size, 8, "Profile ids must be unique.");
assert(DEKO_SCAN_PROFILES.every((profile) => profile.detectorIds.every((id) => id in DEKO_SCAN_DETECTORS)), "Every profile must resolve through the shared detector registry.");
assert(!scan.files.some((file) => file.path.startsWith(".next/")), "Generated folders must never enter the scan.");
assert(!scan.files.some((file) => file.path.startsWith("github-pages/public/")), "Copied GitHub Pages public assets must never enter the scan.");

const context = { projectRoot: root, config, scan, profileId: "full" as const, changedFiles: new Set(scan.files.map((file) => file.path)), deletedFiles: [], forceFull: true };
const jsonResult = await DEKO_SCAN_DETECTORS["invalid-json"](context);
assert.equal(jsonResult.findings[0]?.type, "invalid-json", "Invalid JSON detector must report malformed files.");
const assetsResult = await DEKO_SCAN_DETECTORS.assets(context);
assert(assetsResult.findings.some((finding) => finding.title.includes("600/1200")), "Assets detector must report a missing responsive pair.");
const performanceResult = await DEKO_SCAN_DETECTORS.performance(context);
assert.equal(performanceResult.performanceMeasurementsAvailable, false, "Unavailable performance values must not be fabricated.");

const baseline = Object.fromEntries(scan.files.map((file) => [file.path, `${file.sizeBytes}:${file.lastModifiedAt}`]));
assert.equal(compareFileState(scan, baseline).changed.size, 0, "Unchanged files must be skipped by Quick Scan.");
const changed = { ...baseline, "app/page.tsx": "old" };
assert(compareFileState(scan, changed).changed.has("app/page.tsx"), "Quick Scan must identify changed files.");

const duplicate = jsonResult.findings[0];
assert.equal(organizeFindings([duplicate, { ...duplicate, id: `${duplicate.id}-copy` }]).length, 1, "Duplicate findings must be grouped by root cause.");

const timestamp = new Date().toISOString();
const queued: DekoScanRun = { scanId: "cancel-test", profileId: "quick", status: "queued", phase: "queued", progress: 0, startedAt: timestamp, updatedAt: timestamp, scannedFiles: 0, skippedFiles: 0, findingsFound: 0, groupedFindings: 0, detectorFailures: [], findingIds: [], changedFiles: 0, deletedFiles: 0 };
writeScanRun(queued, root);
assert.equal(requestScanCancellation(queued.scanId, root).cancellationRequested, true, "Cancellation must be persisted safely.");

const timelineInput = { id: "scan-once", time: timestamp, operation: "scan" as const, actor: "test-admin", source: "Smart Scan", result: "successful" as const, affectedFiles: [], healthScoreBefore: 100, healthScoreAfter: 100 };
appendTimelineEntry(timelineInput, root);
appendTimelineEntry(timelineInput, root);
assert.equal(readMaintenanceTimeline(root).filter((entry) => entry.id === timelineInput.id).length, 1, "scanId must deduplicate timeline entries.");

fs.rmSync(root, { recursive: true, force: true });
console.log("DekoClean Smart Scan tests passed.");

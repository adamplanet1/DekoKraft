import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  buildReportSnapshot, calculatePerformanceScore, mergePerformanceSnapshot, parseBuildPerformanceReport,
  parsePerformanceSnapshots, serializePerformanceSnapshots, type PerformanceSnapshot,
} from "../lib/dekoclean/performance.ts";
import { readFindings, saveDetectedFindings, writeFindings } from "../lib/dekoclean/findingStore.ts";
import { enrichFinding } from "../lib/dekoclean/findingEngine.ts";

const emptySnapshot = (overrides: Partial<PerformanceSnapshot>): PerformanceSnapshot => ({
  schemaVersion: 1, id: "browser:one", timestamp: "2026-07-21T00:00:00.000Z", route: "/", source: "browser",
  buildDurationMs: null, bundleSizeBytes: null, javascriptSizeBytes: null, cssSizeBytes: null, staticAssetSizeBytes: null,
  totalOutputSizeBytes: null, exportedFileCount: null, firstPaintMs: null, fcpMs: null, lcpMs: null, cls: null,
  ttfbMs: null, domContentLoadedMs: null, pageLoadMs: null, navigationDurationMs: null, hydrationMs: null,
  resourceCount: null, transferredBytes: null, decodedBytes: null, supportedMetrics: [], unavailableMetrics: [], ...overrides,
});

const unavailable = calculatePerformanceScore([emptySnapshot({})]);
assert.equal(unavailable.score, null);
assert.equal(unavailable.rating, "unavailable");
assert.equal(unavailable.availableMetrics, 0);

const good = calculatePerformanceScore([emptySnapshot({ lcpMs: 2200, cls: 0.05, fcpMs: 1200, ttfbMs: 500, pageLoadMs: 2000, hydrationMs: 100 })]);
assert.equal(good.score, 100);
assert.equal(good.rating, "good");
assert.equal(good.availableMetrics, 6);

const poor = calculatePerformanceScore([emptySnapshot({ lcpMs: 8000, cls: 0.8, fcpMs: 7000 })]);
assert.ok((poor.score ?? 100) < 50);
assert.equal(poor.rating, "poor");

const serialized = serializePerformanceSnapshots([emptySnapshot({ navigationId: "nav-1" })]);
assert.deepEqual(parsePerformanceSnapshots(serialized), [emptySnapshot({ navigationId: "nav-1" })]);
assert.deepEqual(parsePerformanceSnapshots("not-json"), []);

const first = emptySnapshot({ navigationId: "nav-1" });
const duplicate = emptySnapshot({ id: "browser:two", navigationId: "nav-1", timestamp: "2026-07-21T00:01:00.000Z" });
const deduplicated = mergePerformanceSnapshot([first], duplicate);
assert.equal(deduplicated.length, 1);
assert.equal(deduplicated[0].id, "browser:two");

const report = parseBuildPerformanceReport({ schemaVersion: 1, generatedAt: "2026-07-21T00:00:00.000Z", buildDurationMs: 12000, buildDurationSeconds: 12, buildStatus: "success", outputDirectory: "out", bundleSizeBytes: 1000, javascriptSizeBytes: 800, cssSizeBytes: 200, staticAssetSizeBytes: 300, totalOutputSizeBytes: 2000, javascriptFiles: 2, cssFiles: 1, imageFiles: 1, exportedFileCount: 8 });
assert.ok(report);
assert.equal(buildReportSnapshot(report).buildDurationMs, 12000);
assert.equal(parseBuildPerformanceReport({ buildStatus: "failed" }), null);

const findingRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-performance-findings-"));
const historical = enrichFinding({ id: "historical", type: "ownership-inconsistency", severity: "info", title: "historical", explanation: "resolved evidence", affectedPaths: ["data/history.json"], evidence: ["resolved"], detectedBy: "dekoclean", detectedAt: "2026-07-20T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: true, status: "resolved", lifecycle: { status: "RESOLVED", updatedAt: "2026-07-20T00:00:00.000Z", resolvedAt: "2026-07-20T00:00:00.000Z" } });
writeFindings([historical], findingRoot);
saveDetectedFindings([], findingRoot);
assert.equal(readFindings(findingRoot)[0].lifecycle?.status, "RESOLVED");

console.log("DekoClean performance scoring and serialization tests passed.");

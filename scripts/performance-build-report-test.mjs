import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { aggregateExportOutput, createBuildPerformanceReport } from "./performance-build-report.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekokraft-performance-build-"));
fs.mkdirSync(path.join(root, "_next"), { recursive: true });
fs.writeFileSync(path.join(root, "_next", "app.js"), Buffer.alloc(100));
fs.writeFileSync(path.join(root, "_next", "app.css"), Buffer.alloc(40));
fs.writeFileSync(path.join(root, "image.webp"), Buffer.alloc(60));
fs.writeFileSync(path.join(root, "index.html"), Buffer.alloc(20));
const metrics = aggregateExportOutput(root);
assert.deepEqual(metrics, { bundleSizeBytes: 140, javascriptSizeBytes: 100, cssSizeBytes: 40, staticAssetSizeBytes: 60, totalOutputSizeBytes: 220, javascriptFiles: 1, cssFiles: 1, imageFiles: 1, exportedFileCount: 4 });
const report = createBuildPerformanceReport({ generatedAt: "2026-07-21T00:00:00.000Z", buildDurationMs: 1234, buildStatus: "success", outputDirectory: "out", metrics });
assert.equal(report.buildDurationSeconds, 1.234);
assert.equal(report.totalOutputSizeBytes, 220);
console.log("Performance build aggregation tests passed.");

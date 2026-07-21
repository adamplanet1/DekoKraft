import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { aggregateExportOutput, createBuildPerformanceReport } from "./performance-build-report.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesRoot = path.join(root, "github-pages");
const pagesPublic = path.join(pagesRoot, "public");
const pagesOutput = path.join(pagesRoot, "out");
const rootOutput = path.join(root, "out");
fs.rmSync(pagesPublic, { recursive: true, force: true });
fs.cpSync(path.join(root, "public"), pagesPublic, { recursive: true });
fs.rmSync(path.join(pagesPublic, "images", "admin"), { recursive: true, force: true });
const startedAt = process.hrtime.bigint();
const result = spawnSync(process.execPath, [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build", pagesRoot, "--webpack"], { cwd: root, env: { ...process.env, DEKOKRAFT_STATIC_EXPORT: "true", DEKOKRAFT_GITHUB_PAGES: "true" }, stdio: "inherit" });
const buildDurationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
const generatedAt = new Date().toISOString();
if (result.status !== 0) {
  const failedReport = createBuildPerformanceReport({ generatedAt, buildDurationMs, buildStatus: "failed", outputDirectory: "github-pages/out", metrics: aggregateExportOutput(pagesOutput) });
  fs.mkdirSync(path.join(root, "public", "generated"), { recursive: true });
  fs.writeFileSync(path.join(root, "public", "generated", "performance-build-report.json"), `${JSON.stringify(failedReport, null, 2)}\n`);
  process.exit(result.status ?? 1);
}
const pagesReportDirectory = path.join(pagesOutput, "generated");
fs.mkdirSync(pagesReportDirectory, { recursive: true });
let performanceReport = createBuildPerformanceReport({ generatedAt, buildDurationMs, buildStatus: "success", outputDirectory: "github-pages/out", metrics: aggregateExportOutput(pagesOutput) });
// Include the generated report itself in exported-file and output-size totals.
// Repeating stabilizes the small JSON-size change caused by the totals changing.
for (let pass = 0; pass < 3; pass += 1) {
  fs.writeFileSync(path.join(pagesReportDirectory, "performance-build-report.json"), `${JSON.stringify(performanceReport, null, 2)}\n`);
  performanceReport = createBuildPerformanceReport({ generatedAt, buildDurationMs, buildStatus: "success", outputDirectory: "github-pages/out", metrics: aggregateExportOutput(pagesOutput) });
}
for (const directory of [path.join(root, "public", "generated"), pagesReportDirectory]) {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "performance-build-report.json"), `${JSON.stringify(performanceReport, null, 2)}\n`);
}
fs.rmSync(rootOutput, { recursive: true, force: true });
fs.cpSync(pagesOutput, rootOutput, { recursive: true });
for (const required of [
  "index.html",
  "404.html",
  "studio/index.html",
  "market/index.html",
  "register/index.html",
  "login/index.html",
  "seller/login/index.html",
  "info/services/index.html",
]) if (!fs.existsSync(path.join(rootOutput, required))) throw new Error(`Static export is missing ${required}.`);
console.log(`GitHub Pages static export copied to ${rootOutput}`);
console.log(`Performance build report: ${Math.round(buildDurationMs)} ms, ${performanceReport.bundleSizeBytes} bundle bytes, ${performanceReport.totalOutputSizeBytes} output bytes`);

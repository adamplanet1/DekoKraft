import fs from "node:fs";
import path from "node:path";

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".ico"]);

export function aggregateExportOutput(outputDirectory) {
  const result = { bundleSizeBytes: 0, javascriptSizeBytes: 0, cssSizeBytes: 0, staticAssetSizeBytes: 0, totalOutputSizeBytes: 0, javascriptFiles: 0, cssFiles: 0, imageFiles: 0, exportedFileCount: 0 };
  if (!fs.existsSync(outputDirectory)) return result;
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) { walk(target); continue; }
      if (!entry.isFile()) continue;
      const size = fs.statSync(target).size;
      const extension = path.extname(entry.name).toLowerCase();
      result.totalOutputSizeBytes += size;
      result.exportedFileCount += 1;
      if (extension === ".js") { result.javascriptSizeBytes += size; result.javascriptFiles += 1; }
      else if (extension === ".css") { result.cssSizeBytes += size; result.cssFiles += 1; }
      else if (![".html", ".txt", ".json"].includes(extension)) result.staticAssetSizeBytes += size;
      if (imageExtensions.has(extension)) result.imageFiles += 1;
    }
  };
  walk(outputDirectory);
  result.bundleSizeBytes = result.javascriptSizeBytes + result.cssSizeBytes;
  return result;
}

export function createBuildPerformanceReport({ generatedAt, buildDurationMs, buildStatus, outputDirectory, metrics }) {
  return { schemaVersion: 1, generatedAt, buildDurationMs, buildDurationSeconds: Number((buildDurationMs / 1000).toFixed(3)), buildStatus, outputDirectory, ...metrics };
}

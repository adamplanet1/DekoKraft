import path from "node:path";

import type {
  DekoCleanConfig,
  DekoCleanReason,
  DekoCleanUsageGraph,
  ScannedFile,
} from "./types.ts";

export interface UnusedFinding {
  path: string;
  reason: Extract<DekoCleanReason, "unused-source" | "unused-image" | "orphan-json" | "dynamic-reference-risk">;
  dynamicRisk: boolean;
}

const NEXT_ENTRY_NAMES = new Set([
  "page.tsx", "page.ts", "page.jsx", "page.js", "layout.tsx", "layout.ts",
  "layout.jsx", "layout.js", "route.ts", "route.js", "loading.tsx", "loading.jsx",
  "error.tsx", "error.jsx", "not-found.tsx", "not-found.jsx", "template.tsx",
  "default.tsx", "middleware.ts", "instrumentation.ts",
]);

export function isFrameworkEntry(filePath: string): boolean {
  const name = path.posix.basename(filePath);
  return NEXT_ENTRY_NAMES.has(name) || filePath === "next.config.ts" ||
    filePath === "eslint.config.mjs" || filePath.startsWith("scripts/") ||
    filePath.startsWith("locales/") || /(?:^|\/)index\.(?:ts|tsx|js|jsx)$/.test(filePath) ||
    /(?:^|\/)(?:package-lock|pnpm-lock|yarn\.lock|tsconfig(?:\.[^.]+)?\.json)$/.test(filePath);
}

function hasExpectedAssetSibling(file: ScannedFile, files: ScannedFile[], graph: DekoCleanUsageGraph): boolean {
  const parsed = path.posix.parse(file.path);
  const family = parsed.name.replace(/(?:[-_.](?:600|1200|\d+x\d+|thumb|small|large))$/i, "");
  if (family === parsed.name) return false;

  return files.some((candidate) => {
    if (candidate.path === file.path || path.posix.dirname(candidate.path) !== parsed.dir) return false;
    const candidateName = path.posix.parse(candidate.path).name;
    return candidateName.startsWith(family) && (graph[candidate.path]?.referencedBy.length ?? 0) > 0;
  });
}

export function detectLikelyUnused(
  files: ScannedFile[],
  graph: DekoCleanUsageGraph,
  config: DekoCleanConfig,
): UnusedFinding[] {
  const findings: UnusedFinding[] = [];
  const projectHasDynamicReferences = Object.values(graph).some((node) => node.hasDynamicReferenceRisk);

  for (const file of files) {
    if (file.protected || file.symbolicLink || isFrameworkEntry(file.path)) continue;
    const node = graph[file.path];
    if (!node || node.referencedBy.length > 0) continue;

    if (config.sourceExtensions.includes(file.extension)) {
      if (file.extension === ".css" && file.path === "app/globals.css") continue;
      findings.push({
        path: file.path,
        reason: node.hasDynamicReferenceRisk ? "dynamic-reference-risk" : "unused-source",
        dynamicRisk: node.hasDynamicReferenceRisk,
      });
      continue;
    }

    if (config.assetExtensions.includes(file.extension) && file.path.startsWith("public/")) {
      if (hasExpectedAssetSibling(file, files, graph)) continue;
      findings.push({
        path: file.path,
        reason: projectHasDynamicReferences ? "dynamic-reference-risk" : "unused-image",
        dynamicRisk: projectHasDynamicReferences,
      });
      continue;
    }

    if (file.extension === ".json" && !file.path.endsWith("package.json")) {
      findings.push({
        path: file.path,
        reason: projectHasDynamicReferences ? "dynamic-reference-risk" : "orphan-json",
        dynamicRisk: projectHasDynamicReferences,
      });
    }
  }

  return findings;
}

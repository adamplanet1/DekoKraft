import fs from "node:fs";
import path from "node:path";

import { toPosixPath } from "./pathSafety.ts";
import type {
  DekoCleanConfig,
  DekoCleanUsageGraph,
  ScannedFile,
  UsageGraphNode,
} from "./types.ts";

const REFERENCE_PATTERNS = [
  /(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["'`]([^"'`]+)["'`]/g,
  /require\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /import\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /url\(\s*["']?([^"')]+)["']?\s*\)/g,
  /["'`](\/[^"'`?#]+)["'`]/g,
];

function candidatePaths(specifier: string, importer: string): string[] {
  const clean = specifier.split(/[?#]/)[0] ?? specifier;
  let base: string;
  if (clean.startsWith("@/")) base = clean.slice(2);
  else if (clean.startsWith("/")) base = `public/${clean.slice(1)}`;
  else if (clean.startsWith(".")) base = path.posix.normalize(path.posix.join(path.posix.dirname(importer), clean));
  else return [];

  const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json"];
  return extensions.flatMap((extension) => [
    `${base}${extension}`,
    `${base}/index${extension}`,
  ]).map((value) => value.replace(/^\.\//, ""));
}

function createNode(file: ScannedFile): UsageGraphNode {
  return {
    path: file.path,
    referencedBy: [],
    references: [],
    hasDynamicReferenceRisk: false,
  };
}

export function buildUsageGraph(files: ScannedFile[], config: DekoCleanConfig): DekoCleanUsageGraph {
  const graph: DekoCleanUsageGraph = Object.fromEntries(files.map((file) => [file.path, createNode(file)]));
  const knownPaths = new Set(files.map((file) => file.path));

  for (const file of files) {
    if (!config.textExtensions.includes(file.extension) || file.sizeBytes > config.maxTextFileBytes) continue;
    let content: string;
    try {
      content = fs.readFileSync(file.absolutePath, "utf8");
    } catch {
      continue;
    }

    const node = graph[file.path];
    node.hasDynamicReferenceRisk = config.dynamicReferencePatterns.some((pattern) => pattern.test(content));
    const references = new Set<string>();

    for (const pattern of REFERENCE_PATTERNS) {
      pattern.lastIndex = 0;
      let match = pattern.exec(content);
      while (match) {
        const specifier = match[1];
        if (specifier) {
          const resolved = candidatePaths(toPosixPath(specifier), file.path)
            .find((candidate) => knownPaths.has(candidate));
          if (resolved) references.add(resolved);
        }
        match = pattern.exec(content);
      }
    }

    node.references = [...references].sort();
    for (const referencedPath of references) {
      graph[referencedPath].referencedBy.push(file.path);
    }
  }

  for (const node of Object.values(graph)) node.referencedBy.sort();
  return graph;
}

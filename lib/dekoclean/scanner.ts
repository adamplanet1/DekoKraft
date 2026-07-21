import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { assertNoExternalSymlink, isProtectedPath, normalizeRelativePath } from "./pathSafety.ts";
import type {
  DekoCleanConfig,
  DekoCleanScanResult,
  ScannedDirectoryCandidate,
  ScannedFile,
} from "./types.ts";

const ignoredGeneratedFile = /(?:\.map|\.log|\.tmp|\.cache)$/i;
const mandatoryIgnoredDirectories = new Set([
  ".next", "out", "dist", "build", "coverage", "node_modules", ".git", ".vercel", ".cache", "tmp", "temp",
]);

function shouldIgnoreFile(name: string): boolean {
  return ignoredGeneratedFile.test(name) || name === ".DS_Store" || /^Thumbs\.db$/i.test(name);
}

function shouldIgnoreDirectory(name: string, relativePath: string, config: DekoCleanConfig): boolean {
  return mandatoryIgnoredDirectories.has(name) || config.ignoredDirectories.includes(name) ||
    config.ignoredDirectories.includes(relativePath) || config.buildDirectories.includes(name) ||
    config.cacheDirectories.includes(name) || config.dependencyDirectories.includes(name);
}

function directorySize(absolutePath: string, projectRoot: string): number {
  let total = 0;
  const entries = fs.readdirSync(absolutePath, { withFileTypes: true });

  for (const entry of entries) {
    const child = path.join(absolutePath, entry.name);
    if (entry.isSymbolicLink()) {
      assertNoExternalSymlink(projectRoot, child);
      continue;
    }
    if (entry.isDirectory()) total += directorySize(child, projectRoot);
    else if (entry.isFile()) total += fs.statSync(child).size;
  }

  return total;
}

export function scanProject(config: DekoCleanConfig): DekoCleanScanResult {
  const files: ScannedFile[] = [];
  const directoryCandidates: ScannedDirectoryCandidate[] = [];
  let totalSizeBytes = 0;
  let regenerableDependenciesBytes = 0;

  function walk(absoluteDirectory: string): void {
    const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(absoluteDirectory, entry.name);
      const relativePath = normalizeRelativePath(config.projectRoot, absolutePath);
      const topLevelName = relativePath.split("/")[0] ?? relativePath;

      if ((entry.isDirectory() || entry.isSymbolicLink()) && shouldIgnoreDirectory(entry.name, relativePath, config)) continue;
      if (entry.isFile() && shouldIgnoreFile(entry.name)) continue;

      if (entry.isSymbolicLink()) {
        assertNoExternalSymlink(config.projectRoot, absolutePath);
        const stat = fs.lstatSync(absolutePath);
        files.push({
          path: relativePath,
          absolutePath,
          sizeBytes: stat.size,
          extension: path.extname(entry.name).toLowerCase(),
          lastModifiedAt: stat.mtime.toISOString(),
          protected: true,
          symbolicLink: true,
        });
        continue;
      }

      if (entry.isDirectory()) {
        if (config.ignoredDirectories.includes(topLevelName) || shouldIgnoreDirectory(entry.name, relativePath, config)) continue;

        if (config.dependencyDirectories.includes(topLevelName)) {
          regenerableDependenciesBytes += directorySize(absolutePath, config.projectRoot);
          continue;
        }

        const buildReason = config.buildDirectories.includes(topLevelName)
          ? "build-output"
          : config.cacheDirectories.includes(topLevelName)
            ? "cache-file"
            : null;

        if (buildReason) {
          const sizeBytes = directorySize(absolutePath, config.projectRoot);
          directoryCandidates.push({
            path: relativePath,
            absolutePath,
            sizeBytes,
            reason: buildReason,
          });
          totalSizeBytes += sizeBytes;
          continue;
        }

        walk(absolutePath);
        continue;
      }

      if (!entry.isFile()) continue;
      const stat = fs.statSync(absolutePath);
      totalSizeBytes += stat.size;
      files.push({
        path: relativePath,
        absolutePath,
        sizeBytes: stat.size,
        extension: path.extname(entry.name).toLowerCase(),
        lastModifiedAt: stat.mtime.toISOString(),
        protected: isProtectedPath(relativePath, config),
        symbolicLink: false,
      });
    }
  }

  walk(config.projectRoot);

  const fingerprint = createHash("sha256")
    .update(files.map((file) => `${file.path}:${file.sizeBytes}:${file.lastModifiedAt}`).sort().join("\n"))
    .digest("hex");

  return { files, directoryCandidates, totalSizeBytes, regenerableDependenciesBytes, fingerprint };
}

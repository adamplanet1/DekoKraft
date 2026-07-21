import fs from "node:fs";
import path from "node:path";

import type { DekoCleanConfig } from "./types.ts";

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

export function normalizeRelativePath(projectRoot: string, absolutePath: string): string {
  return toPosixPath(path.relative(projectRoot, absolutePath));
}

export function resolveInsideProject(projectRoot: string, relativePath: string): string {
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative) || relative === "") {
    throw new Error(`Unsafe DekoClean path: ${relativePath}`);
  }

  return resolved;
}

export function isProtectedPath(relativePath: string, config: DekoCleanConfig): boolean {
  const normalized = toPosixPath(relativePath).replace(/^\.\//, "");
  const protectedByPath = config.protectedPaths.some((protectedPath) => {
    const normalizedProtected = protectedPath.replace(/\/$/, "");
    return normalized === normalizedProtected || normalized.startsWith(`${normalizedProtected}/`);
  });

  return (
    protectedByPath ||
    config.protectedNamePatterns.some((pattern) => pattern.test(normalized))
  );
}

export function assertNoExternalSymlink(projectRoot: string, absolutePath: string): void {
  const stat = fs.lstatSync(absolutePath);
  if (!stat.isSymbolicLink()) return;

  const target = fs.realpathSync(absolutePath);
  const relative = path.relative(path.resolve(projectRoot), target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`External symbolic link is not allowed: ${absolutePath}`);
  }
}

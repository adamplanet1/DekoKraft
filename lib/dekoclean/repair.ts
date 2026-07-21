import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createDekoCleanConfig } from "./config.ts";
import { checksumFile } from "./duplicateDetector.ts";
import { isProtectedPath, resolveInsideProject } from "./pathSafety.ts";

export interface DekoCleanRepairPreview {
  id: string;
  path: string;
  occurrences: number;
  before: string;
  after: string;
  snapshotRequired: true;
}

export function previewReferenceRepair(projectRoot: string, relativePath: string, from: string, to: string): DekoCleanRepairPreview {
  const config = createDekoCleanConfig(projectRoot);
  if (isProtectedPath(relativePath, config)) throw new Error("Protected files require a dedicated reviewed recipe.");
  if (!from || !to || from === to) throw new Error("A deterministic source and replacement are required.");
  const absolutePath = resolveInsideProject(config.projectRoot, relativePath);
  const stat = fs.statSync(absolutePath);
  if (!stat.isFile() || stat.size > config.maxTextFileBytes) throw new Error("Repair preview is limited to small text files.");
  const content = fs.readFileSync(absolutePath, "utf8");
  const occurrences = content.split(from).length - 1;
  if (occurrences !== 1) throw new Error("Reference repair requires exactly one unambiguous occurrence.");
  return { id: randomUUID(), path: relativePath, occurrences, before: from, after: to, snapshotRequired: true };
}

export function applyConfirmedReferenceRepair(
  projectRoot: string,
  preview: DekoCleanRepairPreview,
  confirmed: boolean,
): { snapshotId: string; beforeChecksum: string; afterChecksum: string } | null {
  if (!confirmed) return null;
  const config = createDekoCleanConfig(projectRoot);
  if (isProtectedPath(preview.path, config)) throw new Error("Protected repair refused.");
  const absolutePath = resolveInsideProject(config.projectRoot, preview.path);
  const content = fs.readFileSync(absolutePath, "utf8");
  if (content.split(preview.before).length - 1 !== 1) throw new Error("File changed after preview; create a new repair preview.");
  const snapshotId = `repair-${preview.id}`;
  const snapshotPath = path.join(config.projectRoot, ".dekoclean", "snapshots", snapshotId, preview.path);
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.copyFileSync(absolutePath, snapshotPath);
  const beforeChecksum = checksumFile(absolutePath);
  fs.writeFileSync(absolutePath, content.replace(preview.before, preview.after), "utf8");
  const afterChecksum = checksumFile(absolutePath);
  fs.writeFileSync(path.join(config.projectRoot, ".dekoclean", "snapshots", snapshotId, "manifest.json"), `${JSON.stringify({
    id: snapshotId, originalPath: preview.path, snapshotPath: path.relative(config.projectRoot, snapshotPath),
    beforeChecksum, afterChecksum, createdAt: new Date().toISOString(),
  }, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return { snapshotId, beforeChecksum, afterChecksum };
}

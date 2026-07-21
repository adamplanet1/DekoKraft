import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { createDekoCleanConfig } from "./config.ts";
import { checksumFile } from "./duplicateDetector.ts";
import { isProtectedPath, resolveInsideProject, toPosixPath } from "./pathSafety.ts";
import { readLatestReport } from "./report.ts";
import type {
  DekoCleanManifest,
  DekoCleanManifestEntry,
  DekoCleanCommandValidationResult,
} from "./types.ts";

export function createManifestId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function checksumPath(absolutePath: string): string {
  const stat = fs.lstatSync(absolutePath);
  if (stat.isFile()) return checksumFile(absolutePath);
  if (!stat.isDirectory()) return createHash("sha256").update(`${stat.size}:${stat.mtimeMs}`).digest("hex");

  const hash = createHash("sha256");
  function walk(directory: string, prefix: string): void {
    const entries = fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const child = path.join(directory, entry.name);
      const relative = toPosixPath(path.join(prefix, entry.name));
      const childStat = fs.lstatSync(child);
      hash.update(`${relative}:${childStat.size}:${childStat.mtimeMs}`);
      if (entry.isDirectory() && !entry.isSymbolicLink()) walk(child, relative);
    }
  }
  walk(absolutePath, "");
  return hash.digest("hex");
}

export function runValidationCommands(projectRoot: string): DekoCleanCommandValidationResult[] {
  const commands: Array<{ command: string; args: string[] }> = [
    { command: "npm", args: ["run", "lint"] },
    { command: "npm", args: ["run", "build"] },
    { command: "git", args: ["diff", "--check"] },
  ];

  return commands.map(({ command, args }) => {
    const result = spawnSync(command, args, {
      cwd: projectRoot,
      encoding: "utf8",
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
      timeout: 15 * 60 * 1000,
    });
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    return {
      command: [command, ...args].join(" "),
      success: result.status === 0,
      exitCode: result.status,
      output: output.slice(-20_000),
    };
  });
}

export function writeManifest(projectRoot: string, manifest: DekoCleanManifest): string {
  const directory = path.join(projectRoot, ".dekoclean", "manifests");
  fs.mkdirSync(directory, { recursive: true });
  const manifestPath = path.join(directory, `${manifest.id}.json`);
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifestPath;
}

export interface QuarantineFindingOptions {
  projectRoot?: string;
  confirmed: boolean;
  paths: string[];
  findingId: string;
  adminReference: string;
  validate?: boolean;
}

export function quarantineFindingPaths(options: QuarantineFindingOptions): DekoCleanManifest | null {
  if (!options.confirmed) return null;
  const config = createDekoCleanConfig(options.projectRoot);
  const id = createManifestId();
  const timestamp = new Date().toISOString();
  const quarantineRoot = path.join(config.projectRoot, ".dekoclean", "quarantine", id);
  const uniquePaths = [...new Set(options.paths)];
  if (uniquePaths.length === 0) throw new Error("No resolved paths are available for quarantine.");

  const entries: DekoCleanManifestEntry[] = uniquePaths.map((relativePath) => {
    if (isProtectedPath(relativePath, config)) throw new Error(`Protected path refused: ${relativePath}`);
    const source = resolveInsideProject(config.projectRoot, relativePath);
    if (!fs.existsSync(source)) throw new Error(`Quarantine source does not exist: ${relativePath}`);
    const stat = fs.lstatSync(source);
    if (stat.isSymbolicLink()) throw new Error(`Symbolic links cannot be quarantined through findings: ${relativePath}`);
    const destination = path.join(quarantineRoot, relativePath);
    return {
      originalPath: relativePath,
      quarantinePath: toPosixPath(path.relative(config.projectRoot, destination)),
      checksum: checksumPath(source),
      sizeBytes: stat.isDirectory() ? 0 : stat.size,
      reasons: ["dynamic-reference-risk"],
      timestamp,
      findingId: options.findingId,
      adminReference: options.adminReference,
      validationStatus: "pending",
    };
  });

  const manifest: DekoCleanManifest = {
    id, projectRoot: config.projectRoot, createdAt: timestamp, entries, validation: [], status: "quarantined",
  };
  writeManifest(config.projectRoot, manifest);
  const moved: DekoCleanManifestEntry[] = [];
  try {
    for (const entry of entries) {
      const source = resolveInsideProject(config.projectRoot, entry.originalPath);
      const destination = resolveInsideProject(config.projectRoot, entry.quarantinePath);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.renameSync(source, destination);
      moved.push(entry);
    }
  } catch (error) {
    for (const entry of moved.reverse()) {
      const source = resolveInsideProject(config.projectRoot, entry.quarantinePath);
      const destination = resolveInsideProject(config.projectRoot, entry.originalPath);
      if (fs.existsSync(source) && !fs.existsSync(destination)) {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.renameSync(source, destination);
      }
    }
    throw error;
  }

  if (options.validate !== false) {
    manifest.validation = runValidationCommands(config.projectRoot);
    const passed = manifest.validation.every((result) => result.success);
    manifest.status = passed ? "validated" : "validation-failed";
    manifest.entries = manifest.entries.map((entry) => ({ ...entry, validationStatus: passed ? "passed" : "failed" }));
    writeManifest(config.projectRoot, manifest);
  }
  return manifest;
}

export interface ApplyDekoCleanOptions {
  projectRoot?: string;
  confirmed: boolean;
  validate?: boolean;
}

export function applyDekoClean(options: ApplyDekoCleanOptions): DekoCleanManifest | null {
  if (!options.confirmed) return null;
  const config = createDekoCleanConfig(options.projectRoot);
  const report = readLatestReport(config.projectRoot);
  const id = createManifestId();
  const timestamp = new Date().toISOString();
  const quarantineRoot = path.join(config.projectRoot, ".dekoclean", "quarantine", id);
  const entries: DekoCleanManifestEntry[] = [];

  for (const candidate of report.candidates) {
    if (candidate.risk !== "safe" || candidate.recommendation !== "quarantine") continue;
    if (isProtectedPath(candidate.path, config)) {
      throw new Error(`Protected path refused during apply: ${candidate.path}`);
    }
    const originalPath = resolveInsideProject(config.projectRoot, candidate.path);
    if (!fs.existsSync(originalPath)) continue;
    const quarantinePath = path.join(quarantineRoot, candidate.path);
    entries.push({
      originalPath: candidate.path,
      quarantinePath: toPosixPath(path.relative(config.projectRoot, quarantinePath)),
      checksum: checksumPath(originalPath),
      sizeBytes: candidate.sizeBytes,
      reasons: candidate.reasons,
      timestamp,
    });
  }

  const manifest: DekoCleanManifest = {
    id,
    projectRoot: config.projectRoot,
    createdAt: timestamp,
    entries,
    validation: [],
    status: "quarantined",
  };

  // The manifest is written before the first move so every planned operation is recoverable.
  writeManifest(config.projectRoot, manifest);
  const moved: DekoCleanManifestEntry[] = [];
  try {
    for (const entry of entries) {
      const source = resolveInsideProject(config.projectRoot, entry.originalPath);
      const destination = resolveInsideProject(config.projectRoot, entry.quarantinePath);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.renameSync(source, destination);
      moved.push(entry);
    }
  } catch (error) {
    for (const entry of moved.reverse()) {
      const source = resolveInsideProject(config.projectRoot, entry.quarantinePath);
      const destination = resolveInsideProject(config.projectRoot, entry.originalPath);
      if (fs.existsSync(source) && !fs.existsSync(destination)) {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.renameSync(source, destination);
      }
    }
    throw error;
  }

  if (options.validate !== false) {
    manifest.validation = runValidationCommands(config.projectRoot);
    manifest.status = manifest.validation.every((result) => result.success)
      ? "validated"
      : "validation-failed";
    writeManifest(config.projectRoot, manifest);
  }

  return manifest;
}

import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { createDekoCleanConfig } from "./config.ts";
import { isProtectedPath, resolveInsideProject, toPosixPath } from "./pathSafety.ts";
import { scanProject } from "./scanner.ts";
import { recipeIntegrity, saveRepairRecipe } from "./repairRecipeStore.ts";
import type { DekoCleanFinding, DekoCleanRepairChange, DekoCleanRepairRecipe } from "./types.ts";

const VALIDATION_COMMANDS = ["npm run lint", "npm run build", "git diff --check"];

function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

function evidenceValue(finding: DekoCleanFinding): string {
  const prefix = finding.type === "broken-import" ? "Import:" : finding.type === "broken-asset-reference" ? "Asset:" : "";
  const evidence = finding.evidence.find((item) => item.startsWith(prefix));
  if (!prefix || !evidence) throw new Error("This finding does not contain a deterministic reference repair recipe.");
  const value = evidence.slice(prefix.length).trim();
  if (!value) throw new Error("The broken reference is missing from the finding evidence.");
  return value;
}

function importReplacement(importer: string, broken: string, files: string[]): string {
  const requestedName = path.posix.basename(broken).replace(/\.(?:[cm]?[jt]sx?|json|css)$/i, "");
  const candidates = files.filter((file) => {
    const name = path.posix.basename(file).replace(/\.(?:[cm]?[jt]sx?|json|css)$/i, "");
    return name === requestedName && file !== importer;
  });
  if (candidates.length !== 1) throw new Error(`Repair preview requires one unambiguous import target; found ${candidates.length}.`);
  let relative = path.posix.relative(path.posix.dirname(importer), candidates[0]).replace(/\.(?:[cm]?[jt]sx?)$/i, "");
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return relative;
}

function assetReplacement(broken: string, files: string[]): string {
  const requestedName = path.posix.basename(broken);
  const candidates = files.filter((file) => file.startsWith("public/") && path.posix.basename(file) === requestedName);
  if (candidates.length !== 1) throw new Error(`Repair preview requires one unambiguous asset target; found ${candidates.length}.`);
  return `/${candidates[0].slice("public/".length)}`;
}

function buildChange(projectRoot: string, relativePath: string, before: string, after: string): DekoCleanRepairChange {
  const absolutePath = resolveInsideProject(projectRoot, relativePath);
  const content = fs.readFileSync(absolutePath, "utf8");
  const occurrences = content.split(before).length - 1;
  if (occurrences !== 1) throw new Error(`Repair preview requires exactly one occurrence in ${relativePath}; found ${occurrences}.`);
  const nextContent = content.replace(before, after);
  return {
    path: relativePath,
    line: content.slice(0, content.indexOf(before)).split("\n").length,
    kind: "reference-replacement",
    before,
    after,
    expectedBeforeChecksum: sha256(content),
    expectedAfterChecksum: sha256(nextContent),
  };
}

export function createRepairPreview(finding: DekoCleanFinding, projectRoot = process.cwd(), now = new Date()): DekoCleanRepairRecipe {
  if (!finding.recommendedActions.includes("repair")) throw new Error("This finding does not offer repair as a recommended action.");
  if (finding.affectedFiles.length === 0) throw new Error("Deterministic Repair Preview requires at least one affected file.");
  const config = createDekoCleanConfig(projectRoot);
  const broken = evidenceValue(finding);
  const files = scanProject(config).files.map((file) => file.path);
  const affectedFiles = [...new Set(finding.affectedFiles.map(toPosixPath))].sort((a, b) => a.localeCompare(b));
  const changes = affectedFiles.map((affectedPath) => {
    if (isProtectedPath(affectedPath, config)) throw new Error(`Protected file requires a dedicated reviewed repair recipe: ${affectedPath}`);
    const stat = fs.statSync(resolveInsideProject(config.projectRoot, affectedPath));
    if (!stat.isFile() || stat.size > config.maxTextFileBytes) throw new Error(`Repair Preview is limited to small text files: ${affectedPath}`);
    const replacement = finding.type === "broken-import"
      ? importReplacement(affectedPath, broken, files)
      : assetReplacement(broken, files);
    if (replacement === broken) throw new Error(`The proposed replacement is identical to the broken reference: ${affectedPath}`);
    return buildChange(config.projectRoot, affectedPath, broken, replacement);
  });
  const expectedChecksums = Object.fromEntries(changes.map((change) => [change.path, { before: change.expectedBeforeChecksum, after: change.expectedAfterChecksum }]));
  const base: Omit<DekoCleanRepairRecipe, "integrityHash"> = {
    id: `repair-preview-${randomUUID()}`,
    findingId: finding.id,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    readOnly: true,
    deterministic: true,
    status: "pending" as const,
    affectedFiles,
    changes,
    expectedChecksums,
    backupPlan: {
      recoveryPointType: "before-repair",
      snapshotRequired: true,
      filesToSnapshot: affectedFiles,
      rollback: "Restore all affected files from the verified before-repair backups if any write or checksum validation fails.",
    },
    validationCommands: VALIDATION_COMMANDS,
  };
  const recipe: DekoCleanRepairRecipe = { ...base, integrityHash: recipeIntegrity(base) };
  return saveRepairRecipe(recipe, config.projectRoot);
}

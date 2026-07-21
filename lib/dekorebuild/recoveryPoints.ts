import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { recordHealthScore } from "../dekoclean/healthScore.ts";
import { getDekoIndexSnapshot } from "../dekoclean/missionControl.ts";
import { runValidationCommands } from "../dekoclean/quarantine.ts";
import { runDekoRadarScan } from "../dekoradar/scanProject.ts";
import { createIncrementalManifest, createRecoveryId, readRecoveryPoints, recoveryStorageBytes, writeRecoveryPoints } from "./storage.ts";
import type { DekoRebuildSummary, RecoveryPoint, RecoveryPointStatus, RecoveryPointType, RecoveryValidation } from "./types.ts";

export type RecoveryValidator = (projectRoot: string) => Promise<Omit<RecoveryValidation, "snapshotCompleted">>;

function existingManifestsValid(projectRoot: string): boolean {
  const directory = path.join(projectRoot, ".dekoclean", "manifests");
  if (!fs.existsSync(directory)) return true;
  try {
    return fs.readdirSync(directory).filter((name) => name.endsWith(".json")).every((name) => {
      const parsed = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8")) as { entries?: unknown; projectRoot?: unknown };
      return Array.isArray(parsed.entries) && typeof parsed.projectRoot === "string" && path.resolve(parsed.projectRoot) === path.resolve(projectRoot);
    });
  } catch { return false; }
}

export const validateHealthyState: RecoveryValidator = async (projectRoot) => {
  const commands = runValidationCommands(projectRoot);
  const radar = await runDekoRadarScan(projectRoot, false, { persist: false });
  const critical = radar.findings.filter((finding) => finding.status !== "ignored" && finding.severity === "critical");
  const protectedCritical = radar.findings.filter((finding) => finding.type === "integrity-mismatch" && ["high", "critical"].includes(finding.severity));
  return {
    lintPassed: commands.find((entry) => entry.command === "npm run lint")?.success ?? false,
    buildPassed: commands.find((entry) => entry.command === "npm run build")?.success ?? false,
    diffCheckPassed: commands.find((entry) => entry.command === "git diff --check")?.success ?? false,
    radarPassed: critical.length === 0,
    protectedIntegrityPassed: protectedCritical.length === 0,
    manifestsValid: existingManifestsValid(projectRoot),
    commands,
    validatedAt: new Date().toISOString(),
  };
};

function projectVersion(projectRoot: string): string {
  try { const parsed = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")) as { version?: unknown }; return typeof parsed.version === "string" ? parsed.version : "unknown"; }
  catch { return "unknown"; }
}

function gitCommitHash(projectRoot: string): string | undefined {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { cwd: projectRoot, encoding: "utf8", timeout: 10_000, maxBuffer: 1024 });
  const value = result.status === 0 ? result.stdout.trim() : "";
  return /^[a-f\d]{40}$/i.test(value) ? value : undefined;
}

function validationPassed(validation: RecoveryValidation): boolean {
  return validation.lintPassed && validation.buildPassed && validation.diffCheckPassed && validation.radarPassed && validation.protectedIntegrityPassed && validation.manifestsValid && validation.snapshotCompleted;
}

function applyRetention(points: RecoveryPoint[]): RecoveryPoint[] {
  const now = Date.now();
  const hourly = new Set<string>();
  const daily = new Set<string>();
  const weekly = new Set<string>();
  return points.map((point) => {
    if (["manual", "release", "emergency"].includes(point.type) || point.status !== "verified") return point;
    const date = new Date(point.createdAt);
    const ageDays = (now - date.getTime()) / 86_400_000;
    const hourlyKey = point.createdAt.slice(0, 13);
    const dailyKey = point.createdAt.slice(0, 10);
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const weekKey = `${date.getFullYear()}-${Math.ceil(((date.getTime() - firstDay.getTime()) / 86_400_000 + firstDay.getDay() + 1) / 7)}`;
    const keep = ageDays <= 1 ? !hourly.has(hourlyKey) && Boolean(hourly.add(hourlyKey)) : ageDays <= 30 ? !daily.has(dailyKey) && Boolean(daily.add(dailyKey)) : ageDays <= 84 ? !weekly.has(weekKey) && Boolean(weekly.add(weekKey)) : false;
    return keep ? point : { ...point, status: "archived" as const };
  });
}

export async function createRecoveryPoint(input: { type: RecoveryPointType; createdBy: string; operationId?: string; projectRoot?: string; validator?: RecoveryValidator; provisional?: boolean; validatedState?: RecoveryValidation }): Promise<RecoveryPoint> {
  const projectRoot = path.resolve(input.projectRoot ?? process.cwd());
  const recoveryPointId = createRecoveryId(input.type === "emergency" ? "emergency" : "rp");
  const operationId = input.operationId ?? recoveryPointId;
  const points = readRecoveryPoints(projectRoot);
  const duplicate = points.find((point) => point.operationId === operationId);
  if (duplicate) return duplicate;
  const baseValidation = input.provisional ? { lintPassed: false, buildPassed: false, diffCheckPassed: false, radarPassed: false, protectedIntegrityPassed: false, manifestsValid: existingManifestsValid(projectRoot), commands: [], validatedAt: new Date().toISOString() } : input.validatedState ? { ...input.validatedState, snapshotCompleted: undefined } : await (input.validator ?? validateHealthyState)(projectRoot);
  const snapshot = createIncrementalManifest(projectRoot, recoveryPointId);
  const validation: RecoveryValidation = { ...baseValidation, snapshotCompleted: true };
  const deko = await getDekoIndexSnapshot(projectRoot).catch(() => null);
  const point: RecoveryPoint = {
    recoveryPointId, type: input.type, createdAt: snapshot.manifest.createdAt, createdBy: input.createdBy.slice(0, 160), projectVersion: projectVersion(projectRoot), operationId,
    healthScore: recordHealthScore(projectRoot).value, dekoIndex: deko?.score ?? null, gitCommitHash: gitCommitHash(projectRoot), validation,
    manifestReference: `points/${recoveryPointId}/manifest.json`, snapshotReference: `objects`, changedFiles: snapshot.manifest.changedFiles,
    dependencyMapReference: snapshot.manifest.dependencyMapReference, protectedChecksumSummary: snapshot.manifest.protectedChecksumSummary,
    status: input.provisional ? "provisional" : validationPassed(validation) ? "verified" : "invalid", storageBytesAdded: snapshot.storageBytesAdded, totalReferencedBytes: snapshot.totalReferencedBytes,
  };
  writeRecoveryPoints(applyRetention([point, ...points]), projectRoot);
  return point;
}

export function updateRecoveryPointStatus(id: string, status: RecoveryPointStatus, projectRoot = process.cwd()): RecoveryPoint {
  const points = readRecoveryPoints(projectRoot);
  const index = points.findIndex((point) => point.recoveryPointId === id);
  if (index < 0) throw new Error("Recovery point not found.");
  points[index] = { ...points[index], status };
  writeRecoveryPoints(points, projectRoot);
  return points[index];
}

export function getDekoRebuildSummary(projectRoot = process.cwd()): DekoRebuildSummary {
  const points = readRecoveryPoints(projectRoot);
  let operations: import("./types.ts").RecoveryOperation[] = [];
  try { operations = JSON.parse(fs.readFileSync(path.join(projectRoot, ".dekoclean", "recovery", "operations.json"), "utf8")) as import("./types.ts").RecoveryOperation[]; } catch { /* empty history */ }
  const latestVerified = points.find((point) => point.status === "verified") ?? null;
  const lastSuccessfulRecovery = operations.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).find((operation) => operation.status === "accepted" || operation.status === "awaiting-acceptance") ?? null;
  return { latestVerified, recoveryPointCount: points.length, lastSuccessfulRecovery, storageUsedBytes: recoveryStorageBytes(projectRoot), verificationStatus: latestVerified ? "verified" : points.length ? "attention" : "unavailable" };
}

export function failureSignature(paths: string[], reason: string): string {
  return createHash("sha256").update(`${paths.slice().sort().join("|")}:${reason}`).digest("hex");
}

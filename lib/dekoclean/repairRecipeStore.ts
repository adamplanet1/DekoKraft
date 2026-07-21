import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { DekoCleanRepairRecipe, RepairExecutionLog } from "./types.ts";

function repairRoot(projectRoot: string): string {
  return path.join(path.resolve(projectRoot), ".dekoclean", "repair");
}

function recipesRoot(projectRoot: string): string {
  return path.join(repairRoot(projectRoot), "recipes");
}

function logsPath(projectRoot: string): string {
  return path.join(repairRoot(projectRoot), "execution-log.json");
}

function atomicJsonWrite(target: string, value: unknown): void {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  fs.renameSync(temporary, target);
}

function recipePath(recipeId: string, projectRoot: string): string {
  if (!/^repair-preview-[a-f\d-]{20,64}$/i.test(recipeId)) throw new Error("Invalid repair recipe identifier.");
  return path.join(recipesRoot(projectRoot), `${recipeId}.json`);
}

export function recipeIntegrity(recipe: Omit<DekoCleanRepairRecipe, "integrityHash">): string {
  const immutable: Partial<DekoCleanRepairRecipe> = { ...recipe };
  delete immutable.status;
  delete immutable.acceptedAt;
  delete immutable.acceptedBy;
  delete immutable.executedAt;
  return createHash("sha256").update(JSON.stringify(immutable)).digest("hex");
}

export function repairRecipeIntegrityValid(recipe: DekoCleanRepairRecipe): boolean {
  const withoutHash: Partial<DekoCleanRepairRecipe> = { ...recipe };
  delete withoutHash.integrityHash;
  return recipe.integrityHash === recipeIntegrity(withoutHash as Omit<DekoCleanRepairRecipe, "integrityHash">);
}

export function saveRepairRecipe(recipe: DekoCleanRepairRecipe, projectRoot = process.cwd()): DekoCleanRepairRecipe {
  const target = recipePath(recipe.id, projectRoot);
  if (fs.existsSync(target)) throw new Error("Repair recipe already exists.");
  atomicJsonWrite(target, recipe);
  return recipe;
}

export function readRepairRecipe(recipeId: string, projectRoot = process.cwd()): DekoCleanRepairRecipe | null {
  let target: string;
  try { target = recipePath(recipeId, projectRoot); } catch { return null; }
  if (!fs.existsSync(target)) return null;
  try { return JSON.parse(fs.readFileSync(target, "utf8")) as DekoCleanRepairRecipe; } catch { return null; }
}

export function updateRepairRecipe(recipe: DekoCleanRepairRecipe, projectRoot = process.cwd()): DekoCleanRepairRecipe {
  const target = recipePath(recipe.id, projectRoot);
  if (!fs.existsSync(target)) throw new Error("Repair recipe not found.");
  atomicJsonWrite(target, recipe);
  return recipe;
}

export function acceptRepairRecipe(recipeId: string, acceptedBy: string, projectRoot = process.cwd()): DekoCleanRepairRecipe {
  const recipe = readRepairRecipe(recipeId, projectRoot);
  if (!recipe) throw new Error("Repair recipe not found.");
  if (recipe.status !== "pending") throw new Error(`Repair recipe cannot be accepted from status ${recipe.status}.`);
  if (Date.parse(recipe.expiresAt) <= Date.now()) throw new Error("Repair recipe expired.");
  return updateRepairRecipe({ ...recipe, status: "accepted", acceptedAt: new Date().toISOString(), acceptedBy: acceptedBy.slice(0, 160) }, projectRoot);
}

export function claimRepairRecipeExecution(recipeId: string, projectRoot = process.cwd()): DekoCleanRepairRecipe | null {
  const recipe = readRepairRecipe(recipeId, projectRoot);
  if (!recipe || recipe.status !== "accepted") return null;
  const claim = path.join(repairRoot(projectRoot), "claims", `${recipe.id}.claim`);
  fs.mkdirSync(path.dirname(claim), { recursive: true, mode: 0o700 });
  try {
    fs.writeFileSync(claim, `${new Date().toISOString()}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  } catch { return null; }
  return updateRepairRecipe({ ...recipe, status: "executing" }, projectRoot);
}

export function readRepairExecutionLogs(projectRoot = process.cwd()): RepairExecutionLog[] {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(logsPath(projectRoot), "utf8"));
    return Array.isArray(parsed) ? parsed as RepairExecutionLog[] : [];
  } catch { return []; }
}

export function saveRepairExecutionLog(log: RepairExecutionLog, projectRoot = process.cwd()): RepairExecutionLog {
  const logs = readRepairExecutionLogs(projectRoot);
  const index = logs.findIndex((entry) => entry.id === log.id);
  if (index >= 0) logs[index] = log; else logs.push(log);
  atomicJsonWrite(logsPath(projectRoot), logs.slice(-1000));
  return log;
}

export function repairBackupRoot(projectRoot = process.cwd()): string {
  return path.join(repairRoot(projectRoot), "backups");
}

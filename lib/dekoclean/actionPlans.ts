import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { isProtectedPath } from "./pathSafety.ts";
import { createDekoCleanConfig } from "./config.ts";
import type { DekoCleanAction, DekoCleanActionPlan, DekoCleanFinding, DekoCleanSeverity } from "./types.ts";

const VALIDATION_COMMANDS = ["npm run lint", "npm run build", "git diff --check"];
const severityRank: Record<DekoCleanSeverity, number> = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };

function plansDirectory(projectRoot: string): string {
  return path.join(projectRoot, ".dekoclean", "plans");
}

export function canRecreatePath(relativePath: string, projectRoot = process.cwd()): boolean {
  const config = createDekoCleanConfig(projectRoot);
  if (isProtectedPath(relativePath, config)) return false;
  return /^(?:\.next|out|dist|build|coverage)(?:\/|$)/.test(relativePath) ||
    /(?:^|\/)(?:generated|reports?|indexes?)(?:\/|$)/i.test(relativePath) ||
    /(?:products|routes|metadata)-(?:index|generated)\.json$/i.test(relativePath);
}

export function createActionPlan(findings: DekoCleanFinding[], action: DekoCleanAction, projectRoot = process.cwd()): DekoCleanActionPlan {
  if (findings.length === 0) throw new Error("At least one finding is required.");
  const paths = [...new Set(findings.flatMap((finding) => finding.affectedPaths))];
  if (action === "recreate" && paths.some((filePath) => !canRecreatePath(filePath, projectRoot))) {
    throw new Error("Recreate is limited to verified generated artifacts.");
  }
  const highestRisk = findings.reduce((current, finding) =>
    severityRank[finding.severity] > severityRank[current] ? finding.severity : current, "info" as DekoCleanSeverity);
  const plan: DekoCleanActionPlan = {
    id: randomUUID(), findingIds: findings.map((finding) => finding.id), action, affectedPaths: paths,
    risk: highestRisk, snapshotRequired: ["repair", "restore", "recreate", "quarantine"].includes(action),
    validationCommands: VALIDATION_COMMANDS, rollbackAvailable: ["repair", "restore", "recreate", "quarantine"].includes(action),
    explanation: action === "repair"
      ? "خطة إصلاح حتمية فقط؛ يجب عرض patch منفصل قبل التنفيذ."
      : `خطة ${action} تتطلب تأكيد المدير قبل التنفيذ.`,
    createdAt: new Date().toISOString(),
  };
  const directory = plansDirectory(projectRoot);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, `${plan.id}.json`), `${JSON.stringify(plan, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return plan;
}

export function readActionPlan(id: string, projectRoot = process.cwd()): DekoCleanActionPlan {
  if (!/^[\w-]+$/.test(id)) throw new Error("Invalid action plan id.");
  const target = path.join(plansDirectory(projectRoot), `${id}.json`);
  const parsed: unknown = JSON.parse(fs.readFileSync(target, "utf8"));
  if (!parsed || typeof parsed !== "object" || !("findingIds" in parsed)) throw new Error("Invalid action plan.");
  return parsed as DekoCleanActionPlan;
}

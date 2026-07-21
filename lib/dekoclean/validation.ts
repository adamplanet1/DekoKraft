import { randomUUID } from "node:crypto";

import { runDekoRadarScan } from "../dekoradar/scanProject.ts";
import { runValidationCommands } from "./quarantine.ts";
import type { DekoCleanValidationResult } from "./types.ts";

export async function validateDekoCleanOperation(projectRoot = process.cwd(), operationId = randomUUID()): Promise<DekoCleanValidationResult> {
  const commands = runValidationCommands(projectRoot);
  const radar = await runDekoRadarScan(projectRoot, false);
  const integrityPassed = !radar.findings.some((finding) =>
    finding.status !== "ignored" && finding.type === "integrity-mismatch" && ["high", "critical"].includes(finding.severity));
  return {
    operationId,
    lintPassed: commands.find((result) => result.command === "npm run lint")?.success ?? false,
    buildPassed: commands.find((result) => result.command === "npm run build")?.success ?? false,
    diffCheckPassed: commands.find((result) => result.command === "git diff --check")?.success ?? false,
    integrityPassed,
    commands,
    createdAt: new Date().toISOString(),
  };
}

import { randomUUID } from "node:crypto";

import { readDekoCleanAudit } from "../../../../../lib/dekoclean/auditLog";
import { readFindings } from "../../../../../lib/dekoclean/findingStore";
import { disableSecurityMemoryEntry, readSecurityMemory, saveSecurityMemoryEntry } from "../../../../../lib/dekoclean/securityMemory";
import type { SecurityMemoryEntry } from "../../../../../lib/dekoclean/types";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withDekoCleanAdmin(async () => ({ entries: readSecurityMemory() }));
}

const treatments: SecurityMemoryEntry["confirmedTreatment"][] = [
  "quarantine", "restore-clean-copy", "remove-generated-file", "repair-reference", "update-dependency",
  "rotate-secret", "manual-security-review", "ignore-false-positive",
];

export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body = await request.json() as { operationId?: unknown; findingId?: unknown; treatment?: unknown; confirmed?: unknown };
    if (body.confirmed !== true || typeof body.operationId !== "string" || typeof body.findingId !== "string" || !treatments.includes(body.treatment as SecurityMemoryEntry["confirmedTreatment"])) {
      throw new Error("A validated operation, finding, treatment, and explicit confirmation are required.");
    }
    const operation = readDekoCleanAudit().find((entry) => entry.operationId === body.operationId);
    const finding = readFindings().find((entry) => entry.id === body.findingId);
    const validation = operation?.validationResult;
    if (!operation || operation.status !== "completed" || !finding || !validation || !validation.lintPassed || !validation.buildPassed || !validation.diffCheckPassed || !validation.integrityPassed) {
      throw new Error("Only a successfully validated treatment can be stored.");
    }
    const treatment = body.treatment as SecurityMemoryEntry["confirmedTreatment"];
    return { entry: saveSecurityMemoryEntry({
      id: randomUUID(), threatName: finding.title, category: finding.type, fileHashSha256: finding.fileHashSha256,
      sourceConnector: finding.detectedBy, detectionId: finding.id, confirmedTreatment: treatment,
      treatmentRecipe: {
        description: `Confirmed ${operation.action} treatment for ${finding.type}.`,
        allowedActions: [operation.action], validationCommands: validation.commands.map((command) => command.command),
        protectedPathsChecked: ["DekoClean protected-path policy"],
      },
      result: treatment === "ignore-false-positive" ? "false-positive" : "successful",
      confirmedByAdmin: true, confirmedAt: new Date().toISOString(), validationPassed: true,
      enabled: true, createdAt: new Date().toISOString(),
    }) };
  });
}

export async function PATCH(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body = await request.json() as { id?: unknown };
    if (typeof body.id !== "string") throw new Error("Security Memory id is required.");
    return { entry: disableSecurityMemoryEntry(body.id) };
  });
}

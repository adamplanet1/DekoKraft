import { randomUUID } from "node:crypto";

import { appendDekoCleanAudit } from "../../../../../lib/dekoclean/auditLog";
import { restoreDekoCleanManifest } from "../../../../../lib/dekoclean/restore";
import { validateDekoCleanOperation } from "../../../../../lib/dekoclean/validation";
import { withDekoCleanAdmin } from "../_shared";
import { recordHealthScore } from "../../../../../lib/dekoclean/healthScore";
import { appendAuditTimeline } from "../../../../../lib/dekoclean/timeline";
import { recordDekoIndexSnapshot } from "../../../../../lib/dekoclean/missionControl";
import { createRecoveryPoint } from "../../../../../lib/dekorebuild/recoveryPoints";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async (adminReference) => {
    const body = await request.json() as { manifestId?: unknown; confirmed?: unknown };
    if (typeof body.manifestId !== "string" || body.confirmed !== true) throw new Error("Restore requires a manifest id and explicit confirmation.");
    const healthBefore = recordHealthScore().value;
    const operationId = randomUUID();
    const recoveryPoint = await createRecoveryPoint({ type: "automatic", createdBy: adminReference, operationId: `before-${operationId}` });
    if (recoveryPoint.status !== "verified") throw new Error("DekoRebuild refused restore because the pre-restore recovery point did not pass validation.");
    const manifest = restoreDekoCleanManifest(process.cwd(), body.manifestId);
    const validation = await validateDekoCleanOperation(process.cwd(), operationId);
    const auditEntry = {
      operationId, action: "restore", adminReference, affectedPaths: manifest.entries.map((entry) => entry.originalPath),
      beforeChecksums: {}, afterChecksums: Object.fromEntries(manifest.entries.map((entry) => [entry.originalPath, entry.checksum])),
      snapshotManifestId: manifest.id, validationResult: validation,
      rollbackStatus: validation.integrityPassed && validation.lintPassed && validation.buildPassed && validation.diffCheckPassed ? "available" : "recommended",
      status: validation.integrityPassed && validation.lintPassed && validation.buildPassed && validation.diffCheckPassed ? "completed" : "failed",
      createdAt: new Date().toISOString(),
    } satisfies import("../../../../../lib/dekoclean/types").DekoCleanAuditEntry;
    appendDekoCleanAudit(auditEntry);
    const healthAfter = recordHealthScore().value;
    appendAuditTimeline(auditEntry, healthBefore, healthAfter);
    await recordDekoIndexSnapshot({ operationId, trigger: "restore" }).catch((snapshotError) => console.error("[DekoClean] Mission Control snapshot failed.", snapshotError));
    return { manifest, validation };
  });
}

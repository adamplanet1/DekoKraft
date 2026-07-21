import { createRecoveryPreview } from "../../../../../lib/dekorebuild/operations";
import { readRequiredString, withDekoRebuildAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoRebuildAdmin(async (adminReference) => {
    const body = await request.json().catch(() => ({})) as { recoveryPointId?: unknown; selectedPath?: unknown; detectedProblem?: unknown; operationId?: unknown };
    return { preview: createRecoveryPreview({ recoveryPointId: readRequiredString(body.recoveryPointId, "recoveryPointId"), selectedPath: readRequiredString(body.selectedPath, "selectedPath"), detectedProblem: typeof body.detectedProblem === "string" ? body.detectedProblem : undefined, operationId: typeof body.operationId === "string" ? body.operationId : undefined, createdBy: adminReference }) };
  });
}

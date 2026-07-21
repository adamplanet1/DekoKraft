import { executeDekoCleanPlan } from "../../../../../lib/dekoclean/operations";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async (adminReference) => {
    const body = await request.json() as { planId?: unknown; confirmed?: unknown; restoreManifestId?: unknown };
    if (typeof body.planId !== "string") throw new Error("planId is required.");
    if (body.confirmed !== true) throw new Error("Explicit confirmation is required.");
    if (body.restoreManifestId !== undefined && typeof body.restoreManifestId !== "string") throw new Error("Invalid restore manifest id.");
    return { operation: await executeDekoCleanPlan({
      planId: body.planId, confirmed: true, adminReference,
      restoreManifestId: body.restoreManifestId as string | undefined,
    }) };
  });
}

import { acceptRecovery } from "../../../../../lib/dekorebuild/operations";
import { readRequiredString, withDekoRebuildAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoRebuildAdmin(async () => {
    const body = await request.json().catch(() => ({})) as { operationId?: unknown; confirmed?: unknown };
    if (body.confirmed !== true) throw new Error("Explicit acceptance confirmation is required.");
    return { operation: await acceptRecovery({ operationId: readRequiredString(body.operationId, "operationId"), confirmed: true }) };
  });
}

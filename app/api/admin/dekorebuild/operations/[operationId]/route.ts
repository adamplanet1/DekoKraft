import { readRecoveryOperation } from "../../../../../../lib/dekorebuild/operations";
import { withDekoRebuildAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ operationId: string }> }) {
  return withDekoRebuildAdmin(async () => {
    const { operationId } = await params;
    const operation = readRecoveryOperation(operationId);
    if (!operation) throw new Error("Recovery operation not found.");
    return { operation };
  });
}

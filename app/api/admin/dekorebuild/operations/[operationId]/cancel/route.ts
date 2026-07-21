import { cancelRecoveryOperation } from "../../../../../../../lib/dekorebuild/operations";
import { withDekoRebuildAdmin } from "../../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ operationId: string }> }) {
  return withDekoRebuildAdmin(async () => {
    const { operationId } = await params;
    return { operation: cancelRecoveryOperation({ operationId }) };
  });
}

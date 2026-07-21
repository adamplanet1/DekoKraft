import { cancelParticipantScan } from "../../../../../../../lib/dekoclean/participant/orchestrator";
import { rejectParticipantOverride, withParticipantMaintenance } from "../../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ scanId: string }> }) {
  return withParticipantMaintenance(async (participantId) => {
    const body: unknown = await request.json().catch(() => ({}));
    rejectParticipantOverride(body);
    const { scanId } = await context.params;
    if (!/^[a-f\d-]{20,64}$/i.test(scanId)) throw new Error("معرف الفحص غير صالح.");
    return { run: cancelParticipantScan(scanId, participantId) };
  });
}

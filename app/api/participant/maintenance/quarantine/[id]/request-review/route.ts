import { requestParticipantQuarantineReview } from "../../../../../../../lib/dekoclean/participant/intake";
import { rejectParticipantOverride, withParticipantMaintenance } from "../../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return withParticipantMaintenance(async (participantId) => {
    const body: unknown = await request.json().catch(() => ({}));
    rejectParticipantOverride(body);
    const { id } = await context.params;
    if (!/^[a-f\d-]{20,64}$/i.test(id)) throw new Error("معرف الحجر غير صالح.");
    return { quarantine: requestParticipantQuarantineReview({ participantId, quarantineId: id }) };
  });
}

import { executeParticipantQuickClean } from "../../../../../../lib/dekoclean/participant/cleaning";
import { rejectParticipantOverride, withParticipantMaintenance } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withParticipantMaintenance(async (participantId) => {
    const body: unknown = await request.json();
    rejectParticipantOverride(body);
    const previewId = typeof body.previewId === "string" ? body.previewId : "";
    const candidateIds = Array.isArray(body.candidateIds) && body.candidateIds.every((item) => typeof item === "string") ? body.candidateIds.slice(0, 250) : [];
    if (!/^[a-f\d-]{20,64}$/i.test(previewId)) throw new Error("معرف المعاينة غير صالح.");
    return executeParticipantQuickClean({ participantId, previewId, confirmed: body.confirmed === true, candidateIds });
  });
}

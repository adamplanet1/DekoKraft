import { createParticipantCleanPreview, executeParticipantQuickClean, sanitizeParticipantCleanPreview } from "../../../../../lib/dekoclean/participant/cleaning";
import { rejectParticipantOverride, withParticipantMaintenance } from "../../maintenance/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withParticipantMaintenance(async (participantId) => {
    const body: unknown = await request.json().catch(() => ({}));
    rejectParticipantOverride(body);
    if (body.action === "preview") return { preview: sanitizeParticipantCleanPreview(createParticipantCleanPreview({ participantId, profileId: "quick-clean" })) };
    if (body.action === "execute" && typeof body.previewId === "string" && Array.isArray(body.candidateIds) && body.candidateIds.every((id) => typeof id === "string")) {
      const result = executeParticipantQuickClean({ participantId, previewId: body.previewId, confirmed: body.confirmed === true, candidateIds: body.candidateIds.slice(0, 250) });
      return { operation: result.operation, reclaimedBytes: result.reclaimedBytes };
    }
    throw new Error("عملية التنظيف غير صالحة.");
  });
}

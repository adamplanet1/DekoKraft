import { createParticipantCleanPreview, sanitizeParticipantCleanPreview } from "../../../../../../lib/dekoclean/participant/cleaning";
import { isParticipantCleanProfileId } from "../../../../../../lib/dekoclean/participant/profiles";
import { rejectParticipantOverride, withParticipantMaintenance } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withParticipantMaintenance(async (participantId) => {
    const body: unknown = await request.json();
    rejectParticipantOverride(body);
    const profileId = typeof body.profileId === "string" ? body.profileId : "";
    if (!isParticipantCleanProfileId(profileId)) throw new Error("ملف التنظيف غير مسموح.");
    return { preview: sanitizeParticipantCleanPreview(createParticipantCleanPreview({ participantId, profileId })) };
  });
}

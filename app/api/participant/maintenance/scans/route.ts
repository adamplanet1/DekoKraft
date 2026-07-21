import { getParticipantMaintenanceOverview, startParticipantScan } from "../../../../../lib/dekoclean/participant/orchestrator";
import { isParticipantScanProfileId } from "../../../../../lib/dekoclean/participant/profiles";
import { rejectParticipantOverride, withParticipantMaintenance } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() { return withParticipantMaintenance(async (participantId) => getParticipantMaintenanceOverview(participantId)); }

export async function POST(request: Request) {
  return withParticipantMaintenance(async (participantId) => {
    const body: unknown = await request.json();
    rejectParticipantOverride(body);
    const profileId = typeof body.profileId === "string" ? body.profileId : "";
    if (!isParticipantScanProfileId(profileId)) throw new Error("ملف الفحص غير مسموح.");
    return { run: startParticipantScan({ participantId, profileId }) };
  });
}

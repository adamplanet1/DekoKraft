import { getParticipantCleaningOverview } from "../../../../lib/dekoclean/participant/cleaning";
import { getParticipantMaintenanceOverview } from "../../../../lib/dekoclean/participant/orchestrator";
import { withParticipantMaintenance } from "./_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withParticipantMaintenance(async (participantId) => ({ participantId, ...getParticipantMaintenanceOverview(participantId), cleaning: getParticipantCleaningOverview(participantId) }));
}

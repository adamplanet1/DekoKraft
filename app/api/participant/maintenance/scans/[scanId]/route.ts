import { readParticipantMaintenanceState } from "../../../../../../lib/dekoclean/participant/store";
import { withParticipantMaintenance } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ scanId: string }> }) {
  return withParticipantMaintenance(async (participantId) => {
    const { scanId } = await context.params;
    if (!/^[a-f\d-]{20,64}$/i.test(scanId)) throw new Error("معرف الفحص غير صالح.");
    const run = readParticipantMaintenanceState(participantId).scans.find((item) => item.scanId === scanId && item.participantId === participantId);
    if (!run) throw new Error("لم يتم العثور على الفحص.");
    return { run };
  });
}

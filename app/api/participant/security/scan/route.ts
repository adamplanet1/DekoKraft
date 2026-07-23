import { startParticipantScan } from "../../../../../lib/dekoclean/participant/orchestrator";
import { rejectParticipantOverride, withParticipantMaintenance } from "../../maintenance/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withParticipantMaintenance(async (participantId) => {
    const body: unknown = await request.json().catch(() => ({}));
    rejectParticipantOverride(body);
    const run = startParticipantScan({ participantId, profileId: "security" });
    return { run: { scanId: run.scanId, status: run.status, phase: run.phase, progress: run.progress, startedAt: run.startedAt } };
  });
}

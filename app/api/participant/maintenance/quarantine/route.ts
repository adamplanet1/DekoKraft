import { readParticipantMaintenanceState } from "../../../../../lib/dekoclean/participant/store";
import { withParticipantMaintenance } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withParticipantMaintenance(async (participantId) => ({ quarantine: readParticipantMaintenanceState(participantId).quarantine.filter((item) => item.status !== "deleted-by-admin").map((item) => ({ id: item.id, resourceId: item.resourceId, displayName: item.displayName, safeReason: item.safeReason, classification: item.classification, severity: item.severity, status: item.status, sizeBytes: item.sizeBytes, scanId: item.scanId, createdAt: item.createdAt, updatedAt: item.updatedAt, reviewRequestedAt: item.reviewRequestedAt })) }));
}

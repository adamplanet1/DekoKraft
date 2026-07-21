import { notFound, redirect } from "next/navigation";

import ParticipantMaintenanceCenter from "../../../../participant/components/ParticipantMaintenanceCenter";
import ParticipantStudioShell from "../../../../participant/components/ParticipantStudioShell";
import { requireAdminSession } from "../../../../../lib/auth/participantAccess";
import { getParticipantProfile } from "../../../../../lib/participants/registry";
import "../../../../participant/participant.css";
import "../../../../participant/maintenance/participant-maintenance.css";

export default async function AdminParticipantMaintenancePage({ params }: { params: Promise<{ participantId: string }> }) {
  const session = await requireAdminSession().catch(() => null);
  if (!session) redirect("/admin");
  const { participantId } = await params;
  const participant = getParticipantProfile(participantId);
  if (!participant) notFound();

  return (
    <ParticipantStudioShell participantId={participantId} viewerRole="admin">
      <ParticipantMaintenanceCenter
        participant={{ participantId, name: participant.name, storeName: participant.storeName ?? "متجر المشارك" }}
        apiBase={`/api/admin/participants/${participantId}/maintenance`}
      />
    </ParticipantStudioShell>
  );
}

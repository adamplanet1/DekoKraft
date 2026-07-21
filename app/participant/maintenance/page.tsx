import { requireParticipantSession } from "../../../lib/auth/participantAccess";
import { getParticipantProfile } from "../../../lib/participants/registry";
import ParticipantMaintenanceCenter from "../components/ParticipantMaintenanceCenter";
import "./participant-maintenance.css";

export default async function ParticipantMaintenancePage() {
  const session = await requireParticipantSession();
  const profile = getParticipantProfile(session.participantId);
  return <ParticipantMaintenanceCenter participant={{ participantId: session.participantId, name: session.name ?? profile?.name ?? "مشارك", storeName: session.storeName ?? profile?.storeName ?? "متجر المشارك" }} />;
}

import ParticipantInventory from "../components/ParticipantInventory";
import { requireParticipantSession } from "../../../lib/auth/participantAccess";

export default async function ParticipantInventoryPage() {
  const session = await requireParticipantSession();
  return <ParticipantInventory participantId={session.participantId} />;
}

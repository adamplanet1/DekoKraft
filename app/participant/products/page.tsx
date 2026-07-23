import ParticipantProductsPanel from "../components/ParticipantProductsPanel";
import { requireParticipantSession } from "../../../lib/auth/participantAccess";

export default async function ParticipantProductsPage() {
  const session = await requireParticipantSession();
  return <ParticipantProductsPanel participantId={session.participantId} />;
}

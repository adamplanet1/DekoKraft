import { notFound, redirect } from "next/navigation";
import ParticipantStudioShell from "../../../../participant/components/ParticipantStudioShell";
import ParticipantStudioDashboard from "../../../../participant/components/ParticipantStudioDashboard";
import { getParticipantProfile, getParticipantRegistry } from "../../../../../lib/participants/registry";
import { requireAdminSession } from "../../../../../lib/auth/participantAccess";
import "../../../../participant/participant.css";

export default async function AdminParticipantPreviewPage({ params }: { params: Promise<{ participantId: string }> }) {
  const session = await requireAdminSession().catch(() => null);
  if (!session) redirect("/admin");
  const { participantId } = await params;
  if (!getParticipantProfile(participantId)) notFound();
  return <ParticipantStudioShell participantId={participantId} viewerRole="admin"><ParticipantStudioDashboard viewerRole="admin" participantId={participantId} /></ParticipantStudioShell>;
}

export function generateStaticParams() { return getParticipantRegistry().map((participant) => ({ participantId: participant.participantId })); }

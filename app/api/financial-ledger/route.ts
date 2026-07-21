import { listFinancialLedgerEntries } from "../../../lib/financial-ledger/store";
import { ParticipantAccessError, participantAccessResponse, requireAuthenticatedUser } from "../../../lib/auth/participantAccess";
import { getParticipantProfile } from "../../../lib/participants/registry";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await requireAuthenticatedUser();
    const entries = await listFinancialLedgerEntries();
    const requestedParticipantId = new URL(request.url).searchParams.get("participantId") ?? undefined;
    const participantId = session.role === "participant" ? session.participantId : requestedParticipantId;
    if (session.role === "admin" && participantId && !getParticipantProfile(participantId)) {
      throw new ParticipantAccessError(404, "لم يتم العثور على المشارك أو السجل المطلوب.");
    }
    return Response.json({ entries: participantId ? entries.filter((entry) => (entry.participantId ?? entry.sellerId) === participantId) : entries });
  } catch (error) {
    if (error instanceof ParticipantAccessError) return participantAccessResponse(error);
    console.error("[Financial Ledger] Failed to read ledger.", error);
    return Response.json({ error: "Unable to read the financial ledger." }, { status: 500 });
  }
}

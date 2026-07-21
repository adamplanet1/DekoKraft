import { getSellerProducts } from "../../../data/sellerProducts";
import { participantAccessResponse, requireParticipantSession } from "../../../../lib/auth/participantAccess";

export async function GET() {
  try {
    const session = await requireParticipantSession();
    return Response.json({ participantId: session.participantId, products: getSellerProducts(session.participantId) });
  } catch (error) { return participantAccessResponse(error); }
}

import { sellerProducts } from "../../../../data/sellerProducts";
import {
  assertParticipantOwnership,
  participantAccessResponse,
  requireParticipantSession,
} from "../../../../../lib/auth/participantAccess";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const session = await requireParticipantSession();
    const { productId } = await params;
    const product = sellerProducts.find((record) => record.id === productId);
    assertParticipantOwnership(product, session.participantId);
    return Response.json({ participantId: session.participantId, product });
  } catch (error) {
    return participantAccessResponse(error);
  }
}

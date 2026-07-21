import { getSellerProducts } from "../../../../../data/sellerProducts";
import {
  ParticipantAccessError,
  participantAccessResponse,
  requireAdminSession,
} from "../../../../../../lib/auth/participantAccess";
import { getParticipantProfile } from "../../../../../../lib/participants/registry";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ participantId: string }> },
) {
  try {
    await requireAdminSession();
    const { participantId } = await params;
    if (!getParticipantProfile(participantId)) {
      throw new ParticipantAccessError(404, "لم يتم العثور على المشارك أو السجل المطلوب.");
    }
    return Response.json({ participantId, products: getSellerProducts(participantId) });
  } catch (error) {
    return participantAccessResponse(error);
  }
}

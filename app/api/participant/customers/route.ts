import { participantAccessResponse, requireParticipantSession } from "../../../../lib/auth/participantAccess";
export async function GET() { try { const session=await requireParticipantSession();return Response.json({participantId:session.participantId,customers:[]}); } catch(error){return participantAccessResponse(error);} }

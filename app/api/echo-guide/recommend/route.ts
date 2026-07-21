import { buildEchoGuideRequest } from "../../../../lib/echo-guide/buildContext";
import { createEchoGuideRecommendation } from "../../../../lib/echo-guide/createRecommendation";
import { isEchoGuideOperation, isEchoGuideWorkspace } from "../../../../lib/echo-guide/types";
import { participantAccessResponse, resolveRequestParticipantId } from "../../../../lib/auth/participantAccess";

export const runtime = "nodejs";

type RecommendationBody = {
  participantId?: unknown;
  productId?: unknown;
  workspace?: unknown;
  operation?: unknown;
  userInstruction?: unknown;
  currentImageId?: unknown;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as RecommendationBody | null;
  const userInstruction = typeof body?.userInstruction === "string" ? body.userInstruction.trim() : "";
  if (!userInstruction) return Response.json({ success: false, message: "اكتب طلب التعديل أولًا." }, { status: 400 });
  if (!isEchoGuideWorkspace(body?.workspace)) return Response.json({ success: false, message: "مساحة العمل غير صالحة." }, { status: 400 });
  if (!isEchoGuideOperation(body?.operation)) return Response.json({ success: false, message: "نوع العملية غير صالح." }, { status: 400 });

  let participantId: string | undefined;
  try { participantId = await resolveRequestParticipantId(typeof body.participantId === "string" ? body.participantId : undefined); }
  catch (error) { return participantAccessResponse(error); }
  const guideRequest = await buildEchoGuideRequest({
    participantId,
    productId: typeof body.productId === "string" ? body.productId : undefined,
    workspace: body.workspace,
    operation: body.operation,
    userInstruction,
    currentImageId: typeof body.currentImageId === "string" ? body.currentImageId : undefined,
  });
  return Response.json({ success: true, recommendation: createEchoGuideRecommendation(guideRequest) });
}

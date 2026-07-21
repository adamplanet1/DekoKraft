import { decideExecution } from "../../../lib/decision-engine/decideExecution";
import type { DecisionInput } from "../../../lib/decision-engine/types";
import { buildEchoGuideRequest } from "../../../lib/echo-guide/buildContext";
import { createEchoGuideRecommendation } from "../../../lib/echo-guide/createRecommendation";
import { isEchoGuideOperation, isEchoGuideWorkspace } from "../../../lib/echo-guide/types";
import { participantAccessResponse, resolveRequestParticipantId } from "../../../lib/auth/participantAccess";

export const runtime = "nodejs";

type DecisionBody = {
  participantId?: unknown;
  productId?: unknown;
  workspace?: unknown;
  operation?: unknown;
  userInstruction?: unknown;
  currentImageId?: unknown;
  echoGuideRecommendationId?: unknown;
  finalPrompt?: unknown;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as DecisionBody | null;
  if (!isEchoGuideWorkspace(body?.workspace)) return Response.json({ success: false, message: "مساحة العمل غير صالحة." }, { status: 400 });
  if (!isEchoGuideOperation(body?.operation)) return Response.json({ success: false, message: "نوع العملية غير صالح." }, { status: 400 });
  const userInstruction = typeof body.userInstruction === "string" ? body.userInstruction.trim() : "";
  const finalPrompt = typeof body.finalPrompt === "string" ? body.finalPrompt.trim() : "";
  let participantId: string | undefined;
  try { participantId = await resolveRequestParticipantId(typeof body.participantId === "string" ? body.participantId : undefined); }
  catch (error) { return participantAccessResponse(error); }
  const productId = typeof body.productId === "string" ? body.productId : undefined;

  const guideRequest = await buildEchoGuideRequest({
    participantId,
    productId,
    workspace: body.workspace,
    operation: body.operation,
    userInstruction,
    currentImageId: typeof body.currentImageId === "string" ? body.currentImageId : undefined,
  });
  const trustedGuide = createEchoGuideRecommendation(guideRequest);
  const decisionInput: DecisionInput = {
    participantId,
    productId,
    workspace: body.workspace,
    operation: body.operation,
    userInstruction,
    currentImageId: typeof body.currentImageId === "string" ? body.currentImageId : undefined,
    echoGuideRecommendationId: typeof body.echoGuideRecommendationId === "string" ? body.echoGuideRecommendationId : undefined,
    finalPrompt,
    preserve: trustedGuide.preserve,
    avoid: trustedGuide.avoid,
    suggestedModel: trustedGuide.suggestedModel,
    suggestedQuality: trustedGuide.suggestedQuality,
    suggestedSize: trustedGuide.suggestedSize,
    suggestedRatio: trustedGuide.suggestedRatio,
    productDNAAvailable: trustedGuide.contextSources.productDNAUsed,
    echoMemoryAvailable: trustedGuide.contextSources.echoMemoryUsed,
  };
  if (process.env.NODE_ENV === "development") {
    console.info("[Decision Engine] input received", {
      workspace: decisionInput.workspace,
      operation: decisionInput.operation,
      hasImage: Boolean(decisionInput.currentImageId),
      productDNAAvailable: decisionInput.productDNAAvailable,
      echoMemoryAvailable: decisionInput.echoMemoryAvailable,
    });
  }
  return Response.json({ success: true, decision: decideExecution(decisionInput) });
}

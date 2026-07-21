import { addAcceptedEchoGuideMemory, type AcceptedEchoGuideMemoryRecord } from "../../../../lib/echo-guide/serverMemoryStore";
import { isEchoGuideWorkspace } from "../../../../lib/echo-guide/types";
import { participantAccessResponse, resolveRequestParticipantId } from "../../../../lib/auth/participantAccess";
import { getSellerProduct, sellerProducts } from "../../../data/sellerProducts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Partial<AcceptedEchoGuideMemoryRecord> | null;
  if (!body || body.accepted !== true || typeof body.productId !== "string" || !isEchoGuideWorkspace(body.workspace)) {
    return Response.json({ success: false, message: "لا تُحفظ في Echo Memory إلا نتيجة معتمدة صراحةً." }, { status: 400 });
  }
  let participantId: string | undefined;
  try { participantId = await resolveRequestParticipantId(typeof body.participantId === "string" ? body.participantId : undefined); }
  catch (error) { return participantAccessResponse(error); }
  if (participantId && sellerProducts.some((product) => product.id === body.productId) && !getSellerProduct(participantId, body.productId)) return Response.json({ error: "غير مسموح لك بالوصول إلى بيانات هذا المشارك." }, { status: 403 });
  const record: AcceptedEchoGuideMemoryRecord = {
    id: typeof body.id === "string" ? body.id : crypto.randomUUID(),
    participantId,
    productId: body.productId,
    workspace: body.workspace,
    acceptedPreference: typeof body.acceptedPreference === "string" ? body.acceptedPreference : "",
    promptRecipe: typeof body.promptRecipe === "string" ? body.promptRecipe : "",
    correction: typeof body.correction === "string" ? body.correction : undefined,
    model: typeof body.model === "string" ? body.model : "unknown",
    quality: typeof body.quality === "string" ? body.quality : undefined,
    size: typeof body.size === "string" ? body.size : undefined,
    successfulSettings: body.successfulSettings && typeof body.successfulSettings === "object" ? body.successfulSettings : {},
    accepted: true,
    acceptedAt: typeof body.acceptedAt === "string" ? body.acceptedAt : new Date().toISOString(),
  };
  await addAcceptedEchoGuideMemory(record);
  return Response.json({ success: true, id: record.id });
}

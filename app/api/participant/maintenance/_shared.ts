import { participantAccessResponse, requireParticipantSession } from "../../../../lib/auth/participantAccess";

export async function withParticipantMaintenance<T>(handler: (participantId: string) => Promise<T>): Promise<Response> {
  try {
    const session = await requireParticipantSession();
    return Response.json(await handler(session.participantId));
  } catch (error) {
    if (error instanceof Error && /الحد المؤقت/.test(error.message)) return Response.json({ error: error.message }, { status: 429 });
    if (error instanceof Error && !/صلاحية|دخول|مشارك/.test(error.message)) return Response.json({ error: error.message.slice(0, 240) }, { status: 400 });
    return participantAccessResponse(error);
  }
}

export function rejectParticipantOverride(body: unknown): asserts body is Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("صيغة الطلب غير صالحة.");
  if ("participantId" in body || "sellerId" in body) throw new Error("لا يمكن تحديد participantId داخل الطلب.");
}

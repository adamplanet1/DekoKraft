import { participantAccessResponse, requireAdminSession } from "../../../../../../../lib/auth/participantAccess";
import { createParticipantCleanPreview, executeParticipantQuickClean, getParticipantCleaningOverview, sanitizeParticipantCleanPreview } from "../../../../../../../lib/dekoclean/participant/cleaning";
import { intakeParticipantUpload, requestParticipantQuarantineReview } from "../../../../../../../lib/dekoclean/participant/intake";
import { cancelParticipantScan, getParticipantMaintenanceOverview, startParticipantScan } from "../../../../../../../lib/dekoclean/participant/orchestrator";
import { isParticipantCleanProfileId, isParticipantScanProfileId } from "../../../../../../../lib/dekoclean/participant/profiles";
import { readParticipantMaintenanceState } from "../../../../../../../lib/dekoclean/participant/store";
import { getParticipantProfile } from "../../../../../../../lib/participants/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ participantId: string; action?: string[] }> };

function assertSafeId(value: string, label: string): void {
  if (!/^[a-f\d-]{20,64}$/i.test(value)) throw new Error(`${label} غير صالح.`);
}

function rejectIdentityOverride(body: Record<string, unknown>): void {
  if ("participantId" in body || "sellerId" in body) throw new Error("لا يمكن تحديد participantId داخل الطلب.");
}

async function bodyRecord(request: Request): Promise<Record<string, unknown>> {
  const body: unknown = await request.json().catch(() => ({}));
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("صيغة الطلب غير صالحة.");
  const record = body as Record<string, unknown>;
  rejectIdentityOverride(record);
  return record;
}

async function withAdminParticipant(context: RouteContext, handler: (participantId: string, action: string[]) => Promise<unknown>): Promise<Response> {
  try {
    await requireAdminSession();
    const { participantId, action = [] } = await context.params;
    if (!getParticipantProfile(participantId)) return Response.json({ error: "لم يتم العثور على المشارك." }, { status: 404 });
    const result = await handler(participantId, action);
    return result instanceof Response ? result : Response.json(result);
  } catch (error) {
    if (error instanceof Error && /الحد المؤقت/.test(error.message)) return Response.json({ error: error.message }, { status: 429 });
    if (error instanceof Error && !/صلاحية|دخول|مشارك/.test(error.message)) return Response.json({ error: error.message.slice(0, 240) }, { status: 400 });
    return participantAccessResponse(error);
  }
}

export async function GET(_request: Request, context: RouteContext) {
  return withAdminParticipant(context, async (participantId, action) => {
    if (action.length === 0) return { participantId, ...getParticipantMaintenanceOverview(participantId), cleaning: getParticipantCleaningOverview(participantId) };
    if (action[0] === "scans" && action.length === 2) {
      assertSafeId(action[1], "معرف الفحص");
      const run = readParticipantMaintenanceState(participantId).scans.find((item) => item.scanId === action[1] && item.participantId === participantId);
      if (!run) throw new Error("لم يتم العثور على الفحص.");
      return { run };
    }
    if (action[0] === "quarantine" && action.length === 1) return { quarantine: getParticipantMaintenanceOverview(participantId).quarantine };
    return Response.json({ error: "مسار الصيانة غير موجود." }, { status: 404 });
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withAdminParticipant(context, async (participantId, action) => {
    if (action[0] === "intake" && action.length === 1) {
      const form = await request.formData();
      if (form.has("participantId") || form.has("sellerId")) throw new Error("لا يمكن تحديد participantId داخل الطلب.");
      const file = form.get("file");
      if (!(file instanceof File)) throw new Error("اختر ملفًا لفحصه.");
      return intakeParticipantUpload({ participantId, filename: file.name, mimeType: file.type || "application/octet-stream", content: Buffer.from(await file.arrayBuffer()) });
    }

    const body = await bodyRecord(request);
    if (action[0] === "scans" && action.length === 1) {
      const profileId = typeof body.profileId === "string" ? body.profileId : "";
      if (!isParticipantScanProfileId(profileId)) throw new Error("ملف الفحص غير مسموح.");
      return { run: startParticipantScan({ participantId, profileId }) };
    }
    if (action[0] === "scans" && action[2] === "cancel" && action.length === 3) {
      assertSafeId(action[1], "معرف الفحص");
      return { run: cancelParticipantScan(action[1], participantId) };
    }
    if (action[0] === "clean" && action[1] === "preview" && action.length === 2) {
      const profileId = typeof body.profileId === "string" ? body.profileId : "";
      if (!isParticipantCleanProfileId(profileId)) throw new Error("ملف التنظيف غير مسموح.");
      return { preview: sanitizeParticipantCleanPreview(createParticipantCleanPreview({ participantId, profileId })) };
    }
    if (action[0] === "clean" && action[1] === "execute" && action.length === 2) {
      const previewId = typeof body.previewId === "string" ? body.previewId : "";
      const candidateIds = Array.isArray(body.candidateIds) && body.candidateIds.every((item) => typeof item === "string") ? body.candidateIds.slice(0, 250) as string[] : [];
      assertSafeId(previewId, "معرف المعاينة");
      return executeParticipantQuickClean({ participantId, previewId, candidateIds, confirmed: body.confirmed === true });
    }
    if (action[0] === "quarantine" && action[2] === "request-review" && action.length === 3) {
      assertSafeId(action[1], "معرف الحجر");
      return { quarantine: requestParticipantQuarantineReview({ participantId, quarantineId: action[1] }) };
    }
    return Response.json({ error: "مسار الصيانة غير موجود." }, { status: 404 });
  });
}

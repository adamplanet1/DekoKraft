import { intakeParticipantUpload } from "../../../../../lib/dekoclean/participant/intake";
import { withParticipantMaintenance } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  return withParticipantMaintenance(async (participantId) => {
    const form = await request.formData();
    if (form.has("participantId") || form.has("sellerId")) throw new Error("لا يمكن تحديد participantId داخل الطلب.");
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("اختر ملفًا لفحصه.");
    return intakeParticipantUpload({ participantId, filename: file.name, mimeType: file.type || "application/octet-stream", content: Buffer.from(await file.arrayBuffer()) });
  });
}

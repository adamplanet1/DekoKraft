import { acceptProtectedFileBaseline } from "../../../../../../lib/dekoclean/protectedBaseline";
import { withDekoCleanAdmin } from "../../_shared";

export const runtime = "nodejs";
export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body = await request.json() as { findingId?: string; confirmed?: boolean; scanId?: string; reason?: string };
    if (!body.findingId || !body.scanId || !body.reason) throw new Error("findingId, scanId, and reason are required.");
    return { ok: true, approval: acceptProtectedFileBaseline({ findingId: body.findingId, confirmed: body.confirmed === true, approvedBy: "local-admin", scanId: body.scanId, reason: body.reason }) };
  }, { exposeDomainErrors: true });
}

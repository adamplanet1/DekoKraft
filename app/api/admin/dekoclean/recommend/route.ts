import { readFindings } from "../../../../../lib/dekoclean/findingStore";
import { recommendSecurityAction } from "../../../../../lib/dekoclean/securityAdvisor";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body = await request.json() as { findingId?: unknown };
    if (typeof body.findingId !== "string") throw new Error("findingId is required.");
    const finding = readFindings().find((entry) => entry.id === body.findingId);
    if (!finding) throw new Error("Finding not found.");
    return { recommendation: recommendSecurityAction(finding) };
  });
}

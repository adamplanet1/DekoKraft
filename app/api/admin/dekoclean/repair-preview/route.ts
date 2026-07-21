import { readFindings } from "../../../../../lib/dekoclean/findingStore";
import { createRepairPreview } from "../../../../../lib/dekoclean/repairPreview";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body = await request.json().catch(() => ({})) as { findingId?: unknown };
    if (typeof body.findingId !== "string" || !body.findingId) throw new Error("findingId is required.");
    const finding = readFindings().find((item) => item.id === body.findingId);
    if (!finding) throw new Error("Finding not found.");
    return { recipe: createRepairPreview(finding) };
  }, { exposeDomainErrors: true });
}

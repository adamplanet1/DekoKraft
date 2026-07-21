import { getDekoScanOverview, startDekoScan } from "../../../../../lib/dekoclean/scan/orchestrator";
import { isDekoScanProfileId } from "../../../../../lib/dekoclean/scan/profiles";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withDekoCleanAdmin(async () => getDekoScanOverview());
}

export async function POST(request: Request) {
  return withDekoCleanAdmin(async (adminReference) => {
    const body = await request.json().catch(() => ({})) as { profileId?: unknown; forceFull?: unknown };
    if (!isDekoScanProfileId(body.profileId)) throw new Error("Invalid DekoClean scan profile.");
    if (body.forceFull !== undefined && typeof body.forceFull !== "boolean") throw new Error("forceFull must be a boolean.");
    return { run: startDekoScan({ profileId: body.profileId, forceFull: body.forceFull, adminReference }) };
  });
}

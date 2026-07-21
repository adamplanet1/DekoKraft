import { latestScanRun } from "../../../../../../lib/dekoclean/scan/runStore";
import { isDekoScanProfileId } from "../../../../../../lib/dekoclean/scan/profiles";
import { withDekoCleanAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withDekoCleanAdmin(async () => {
    const value = new URL(request.url).searchParams.get("profile");
    if (value !== null && !isDekoScanProfileId(value)) throw new Error("Invalid DekoClean scan profile.");
    return { run: latestScanRun(value ?? undefined) };
  });
}

import { readScanRun } from "../../../../../../lib/dekoclean/scan/runStore";
import { withDekoCleanAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ scanId: string }> }) {
  return withDekoCleanAdmin(async () => {
    const { scanId } = await params;
    const run = readScanRun(scanId);
    if (!run) throw new Error("DekoClean scan run not found.");
    return { run };
  });
}

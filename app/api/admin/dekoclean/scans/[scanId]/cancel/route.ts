import { requestScanCancellation } from "../../../../../../../lib/dekoclean/scan/runStore";
import { withDekoCleanAdmin } from "../../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ scanId: string }> }) {
  return withDekoCleanAdmin(async () => {
    const { scanId } = await params;
    return { run: requestScanCancellation(scanId) };
  });
}

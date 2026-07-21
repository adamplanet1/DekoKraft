import { clearPerformanceHistory, readPerformanceHistory, writePerformanceHistory } from "../../../../../lib/dekoclean/actionStorage";
import type { PerformanceSnapshot } from "../../../../../lib/dekoclean/performance";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withDekoCleanAdmin(async () => ({ snapshots: readPerformanceHistory() }));
}

export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body = await request.json().catch(() => ({})) as { snapshots?: unknown };
    if (!Array.isArray(body.snapshots)) throw new Error("snapshots must be an array.");
    return { snapshots: writePerformanceHistory(body.snapshots as PerformanceSnapshot[]) };
  }, { exposeDomainErrors: true });
}

export async function DELETE() {
  return withDekoCleanAdmin(async () => {
    clearPerformanceHistory();
    return { snapshots: [] };
  });
}

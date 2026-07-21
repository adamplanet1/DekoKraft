import { runDekoRadarScan } from "../../../../../lib/dekoradar/scanProject";
import { getDekoCleanSummary } from "../../../../../lib/dekoclean/summary";
import { recordHealthScore } from "../../../../../lib/dekoclean/healthScore";
import { appendTimelineEntry } from "../../../../../lib/dekoclean/timeline";
import { recordDekoIndexSnapshot } from "../../../../../lib/dekoclean/missionControl";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async (adminReference) => {
    const body = await request.json().catch(() => ({})) as { operation?: unknown };
    const operation = body.operation === "scan" ? "scan" : "radar-scan";
    const before = recordHealthScore().value;
    const result = await runDekoRadarScan();
    const health = recordHealthScore();
    appendTimelineEntry({ time: result.scannedAt, operation, actor: adminReference, source: operation === "scan" ? "DekoClean" : "DekoRadar", result: "detected", affectedFiles: result.findings.flatMap((finding) => finding.affectedPaths), healthScoreBefore: before, healthScoreAfter: health.value, detail: `${result.findings.length} grouped findings · cache ${result.cacheHit ? "hit" : "miss"}` });
    await recordDekoIndexSnapshot({ operationId: `${operation}:${result.scannedAt}`, trigger: "scan" }).catch((snapshotError) => console.error("[DekoClean] Mission Control snapshot failed.", snapshotError));
    return { result, summary: getDekoCleanSummary(), health };
  });
}

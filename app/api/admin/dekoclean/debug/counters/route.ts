import { getDekoCleanSummary } from "../../../../../../lib/dekoclean/summary";
import { readFindings } from "../../../../../../lib/dekoclean/findingStore";
import { withDekoCleanAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  return withDekoCleanAdmin(async () => {
    const findings = readFindings();
    return { summary: getDekoCleanSummary(), findings: findings.map((f) => ({ id: f.id, type: f.type, status: f.lifecycle?.status ?? f.status, fingerprint: f.fingerprint, affectedFiles: f.affectedFiles })) };
  });
}

import { analyzeSecurityFindingRootCause } from "../../../../../lib/dekoclean/rootCauseAnalysis";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid security finding id.");
    const input = body as Record<string, unknown>;
    if (typeof input.findingId !== "string" || !/^[a-zA-Z0-9:_-]{1,180}$/.test(input.findingId)) throw new Error("Invalid security finding id.");
    return { analysis: analyzeSecurityFindingRootCause(input.findingId) };
  }, { exposeDomainErrors: true });
}

import { createLocalCleanupPreview, executeLocalSimpleCleanup } from "../../../../../lib/dekoclean/localSimpleCleanup";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async (adminReference) => {
    const body: unknown = await request.json().catch(() => ({}));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid cleanup request.");
    const input = body as Record<string, unknown>;
    if (input.action === "preview") return { preview: createLocalCleanupPreview() };
    if (input.action === "execute" && typeof input.previewId === "string") {
      return { result: executeLocalSimpleCleanup({ previewId: input.previewId, confirmed: input.confirmed === true }, adminReference) };
    }
    throw new Error("Invalid cleanup action.");
  }, { exposeDomainErrors: true });
}

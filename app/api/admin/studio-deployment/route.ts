import { getStudioDeploymentStatus, triggerConfiguredStudioDeployment } from "../../../../lib/deployment/studioDeployment";
import { withDekoCleanAdmin } from "../dekoclean/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withDekoCleanAdmin(async () => getStudioDeploymentStatus());
}

export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body: unknown = await request.json().catch(() => ({}));
    if (!body || typeof body !== "object" || Array.isArray(body) || (body as Record<string, unknown>).confirmed !== true) throw new Error("DEPLOYMENT_CONFIRMATION_REQUIRED");
    return triggerConfiguredStudioDeployment(true);
  }, { exposeDomainErrors: true });
}

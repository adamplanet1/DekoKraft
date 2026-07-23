import { participantAccessResponse, requireAuthenticatedUser } from "../../../../../lib/auth/participantAccess";
import { getStudioDeploymentStatus } from "../../../../../lib/deployment/studioDeployment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuthenticatedUser();
    return Response.json(await getStudioDeploymentStatus());
  } catch (error) { return participantAccessResponse(error); }
}

import {
  approveSecurityFinding,
  inspectSecurityFinding,
  restoreSecurityFinding,
  temporarilyIgnoreSecurityFinding,
  validateSecurityFinding,
} from "../../../../../../../lib/dekoclean/securityFindingActions";
import { withDekoCleanAdmin } from "../../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ findingId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withDekoCleanAdmin(async () => {
    const { findingId } = await context.params;
    return { inspection: inspectSecurityFinding(findingId) };
  }, { exposeDomainErrors: true });
}

export async function POST(request: Request, context: RouteContext) {
  return withDekoCleanAdmin(async (adminReference) => {
    const { findingId } = await context.params;
    const body = await request.json() as {
      action?: "validate" | "approve" | "restore" | "ignore-temporarily";
      confirmed?: boolean;
      reason?: string;
      expiresAt?: string;
    };
    if (body.action === "validate") return { inspection: validateSecurityFinding(findingId, adminReference) };
    if (body.action === "approve") {
      if (!body.reason?.trim()) throw new Error("Approval reason is required.");
      return { inspection: approveSecurityFinding(findingId, body.confirmed === true, body.reason, adminReference) };
    }
    if (body.action === "restore") return { inspection: restoreSecurityFinding(findingId, body.confirmed === true, adminReference) };
    if (body.action === "ignore-temporarily") {
      if (!body.expiresAt || !body.reason?.trim()) throw new Error("Temporary ignore expiration and reason are required.");
      return { inspection: temporarilyIgnoreSecurityFinding(findingId, body.expiresAt, body.reason, adminReference) };
    }
    throw new Error("Unsupported security finding action.");
  }, { exposeDomainErrors: true });
}

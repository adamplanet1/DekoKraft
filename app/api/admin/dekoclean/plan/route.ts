import { createActionPlan } from "../../../../../lib/dekoclean/actionPlans";
import { readFindings } from "../../../../../lib/dekoclean/findingStore";
import type { DekoCleanAction } from "../../../../../lib/dekoclean/types";
import { readStringArray, withDekoCleanAdmin } from "../_shared";

const actions: DekoCleanAction[] = ["scan", "repair", "restore", "recreate", "quarantine", "ignore", "validate", "rollback"];
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withDekoCleanAdmin(async () => {
    const body = await request.json() as { findingIds?: unknown; action?: unknown };
    const findingIds = readStringArray(body.findingIds, "findingIds");
    if (!actions.includes(body.action as DekoCleanAction)) throw new Error("Invalid DekoClean action.");
    const findings = readFindings().filter((finding) => findingIds.includes(finding.id));
    if (findings.length !== findingIds.length) throw new Error("Finding not found.");
    return { plan: createActionPlan(findings, body.action as DekoCleanAction) };
  });
}

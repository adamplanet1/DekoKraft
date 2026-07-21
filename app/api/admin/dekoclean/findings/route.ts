import { readDekoCleanAudit } from "../../../../../lib/dekoclean/auditLog";
import { readFindings } from "../../../../../lib/dekoclean/findingStore";
import { readSecurityMemory } from "../../../../../lib/dekoclean/securityMemory";
import { createDiagnosisCard } from "../../../../../lib/dekoclean/diagnosis";
import { calculateHealthScore, readHealthScoreHistory } from "../../../../../lib/dekoclean/healthScore";
import { getDekoCleanSummary, listDekoCleanManifests } from "../../../../../lib/dekoclean/summary";
import { readMaintenanceTimeline } from "../../../../../lib/dekoclean/timeline";
import { getMissionControlAnalytics } from "../../../../../lib/dekoclean/missionControl";
import { withDekoCleanAdmin } from "../_shared";
import { calculateSecurityScore, selectNeedsReviewFindings, selectSecurityFindings } from "../../../../../lib/dekoclean/findingSelectors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withDekoCleanAdmin(async () => {
    const requestedStatus = new URL(request.url).searchParams.get("status");
    const allFindings = readFindings();
    const selectedReview = selectNeedsReviewFindings(allFindings);
    const findings = requestedStatus === "resolved"
      ? allFindings.filter((finding) => finding.lifecycle?.status === "RESOLVED" || finding.status === "resolved")
      : selectedReview.findings;
    const missionResult = await getMissionControlAnalytics()
      .then((missionControl) => ({ missionControl, missionControlError: null }))
      .catch((error: unknown) => ({ missionControl: null, missionControlError: error instanceof Error ? error.message : "Mission Control unavailable" }));
    return {
    summary: getDekoCleanSummary(), health: calculateHealthScore(), healthHistory: readHealthScoreHistory(),
    findings, total: findings.length, scope: requestedStatus === "resolved" ? "resolved" : "active", needsReviewBreakdown: selectedReview.breakdown, securityFindings: selectSecurityFindings(allFindings), securityScore: calculateSecurityScore(allFindings), diagnoses: Object.fromEntries(findings.map((finding) => [finding.id, createDiagnosisCard(finding)])),
    securityMemory: readSecurityMemory(),
    audit: readDekoCleanAudit().slice(-100).reverse(),
    manifests: listDekoCleanManifests(),
    timeline: readMaintenanceTimeline().slice(0, 500),
    ...missionResult,
  }; });
}

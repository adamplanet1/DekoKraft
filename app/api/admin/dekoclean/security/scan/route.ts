import { saveDetectedFindings } from "../../../../../../lib/dekoclean/findingStore";
import { createLocalStructuredReportConnector } from "../../../../../../lib/dekoradar/securityAlertAdapter";
import { securityFindingsToDekoClean } from "../../../../../../lib/dekoradar/scanProject";
import { recordHealthScore } from "../../../../../../lib/dekoclean/healthScore";
import { appendTimelineEntry } from "../../../../../../lib/dekoclean/timeline";
import { recordDekoIndexSnapshot } from "../../../../../../lib/dekoclean/missionControl";
import { withDekoCleanAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return withDekoCleanAdmin(async (adminReference) => {
    const before = recordHealthScore().value;
    const connector = createLocalStructuredReportConnector();
    const findings = securityFindingsToDekoClean(await connector.scanProject());
    const saved = saveDetectedFindings(findings);
    const health = recordHealthScore();
    const scannedAt = new Date().toISOString();
    appendTimelineEntry({ time: scannedAt, operation: "security-scan", actor: adminReference, source: connector.id, result: "detected", affectedFiles: findings.flatMap((finding) => finding.affectedPaths), healthScoreBefore: before, healthScoreAfter: health.value, detail: `${findings.length} security findings` });
    await recordDekoIndexSnapshot({ operationId: `security-scan:${scannedAt}`, trigger: "security-scan" }).catch((snapshotError) => console.error("[DekoClean] Mission Control snapshot failed.", snapshotError));
    return { available: connector.available, findings: saved, health };
  });
}

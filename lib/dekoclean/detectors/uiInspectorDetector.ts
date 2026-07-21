import { enrichFinding } from "../findingEngine.ts";
import { getUnconnectedUIRecords, uiInspectorFindingId } from "../uiInspector.ts";
import { DEKOCLEAN_UI_REGISTRY } from "../uiRegistry.ts";
import type { DekoCleanFinding } from "../types.ts";
import type { UIInspectorRecord } from "../uiInspectorTypes.ts";

export function detectUIInspectorFindings(records: UIInspectorRecord[] = DEKOCLEAN_UI_REGISTRY): DekoCleanFinding[] {
  return getUnconnectedUIRecords(records).map((record) => {
    const important = ["security", "repair", "restore", "validate", "run-scan", "navigate"].includes(record.expectedAction) || /security|repair|restore|scan/i.test(record.id);
    return enrichFinding({ id: uiInspectorFindingId(record), type: "ui-unconnected", category: "ui-inspector", severity: important ? "high" : "medium", title: "عنصر واجهة غير مربوط", explanation: `العنصر «${record.label}» لا يرتبط بإجراء فعلي.`, affectedPaths: record.source ? [record.source] : [], evidence: [`Label: ${record.label}`, `Kind: ${record.kind}`, `Expected action: ${record.expectedAction}`, `Status: ${record.status}`, `Source: ${record.source ?? "unknown"}`, `Reason: ${record.reason ?? "missing connection"}`], detectedBy: "ui-inspector", detectedAt: record.lastCheckedAt, recommendedActions: ["validate", "ignore"], requiresAdminConfirmation: false, status: "new" });
  });
}

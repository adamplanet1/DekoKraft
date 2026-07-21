import { navigationContracts } from "../../../app/admin/dekoclean/navigation/navigationContracts.ts";
import { enrichFinding } from "../findingEngine.ts";
import type { DekoCleanFinding } from "../types.ts";

export function detectNavigationIntegrity(): DekoCleanFinding[] {
  const seenSources = new Set<string>();
  const seenSections = new Set<string>();
  const findings: DekoCleanFinding[] = [];
  for (const contract of navigationContracts) {
    const duplicate = seenSources.has(contract.sourceId) || seenSections.has(contract.sectionId);
    seenSources.add(contract.sourceId); seenSections.add(contract.sectionId);
    if (!contract.sectionId || duplicate) findings.push(enrichFinding({
      id: `navigation-${contract.sourceId}`, type: duplicate ? "navigation-duplicate-target-id" : "navigation-destination-missing",
      category: "general", severity: contract.severityOnFailure, title: duplicate ? "معرف وجهة تنقل مكرر" : "وجهة تنقل غير مسجلة",
      explanation: "فشل تحقق عقد تنقل لوحة DekoClean.", affectedPaths: [], evidence: [`sourceId=${contract.sourceId}`, `sectionId=${contract.sectionId}`], detectedBy: "dekoclean", detectedAt: new Date().toISOString(), recommendedActions: ["validate", "ignore"], requiresAdminConfirmation: false, status: "new",
    }));
  }
  return findings;
}

export function detectEmptyNavigationDestination(input: { sourceId: string; target: string; expectedCount: number; renderedRecordCount: number; renderedIdentifiableRecordCount: number; loading: boolean; snapshotScanId?: string; securitySensitive?: boolean }): DekoCleanFinding[] {
  if (input.loading || input.expectedCount === 0 || input.renderedIdentifiableRecordCount === input.expectedCount) return [];
  return [enrichFinding({ id: `navigation-content-${input.sourceId}`, type: "navigation-destination-content-empty", category: "general", severity: input.securitySensitive ? "high" : "medium", title: "محتوى وجهة التنقل غير مكتمل", explanation: "الوجهة موجودة، لكن عدد السجلات القابلة للتعريف لا يطابق العدد المتوقع بعد اكتمال التحميل.", affectedPaths: [], evidence: [`sourceId=${input.sourceId}`, `target=${input.target}`, `expectedCount=${input.expectedCount}`, `renderedRecordCount=${input.renderedRecordCount}`, `renderedIdentifiableRecordCount=${input.renderedIdentifiableRecordCount}`, `snapshotScanId=${input.snapshotScanId ?? "unavailable"}`], detectedBy: "dekoclean", detectedAt: new Date().toISOString(), recommendedActions: ["validate", "ignore"], requiresAdminConfirmation: false, status: "new" })];
}

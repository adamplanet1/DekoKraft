import { canonicalStatus, isActionableFinding } from "./findingSelectors.ts";
import type { DekoCleanFinding } from "./types.ts";

export type FindingDisplayStatus = "informational" | "resolved" | "reviewed" | "actionable" | "critical";

export function findingDisplayStatus(finding: DekoCleanFinding): { status: FindingDisplayStatus; label: string } {
  if (finding.severity === "critical") return { status: "critical", label: "حرجة" };
  if (finding.status === "approved" || finding.status === "reviewing") return { status: "reviewed", label: "تمت المراجعة" };
  if (isActionableFinding(finding)) return { status: "actionable", label: "تحتاج إجراء" };
  if (canonicalStatus(finding) === "RESOLVED") return { status: "resolved", label: "لا تحتاج إجراء" };
  return { status: "informational", label: "لا تحتاج إجراء" };
}

export function displayedFindingsLabel(displayed: number, total: number): string {
  return `النتائج المعروضة: ${displayed} من أصل ${total}`;
}

export function noActionableFindingsMessage(actionable: number): string | null {
  return actionable === 0 ? "لا توجد نتائج تحتاج إلى إجراء حاليًا. البطاقات أدناه هي سجل نتائج آخر فحص." : null;
}

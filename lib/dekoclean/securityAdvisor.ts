import type { DekoBrainSecurityRecommendation, DekoCleanAction, DekoCleanFinding } from "./types.ts";
import { readSecurityMemory } from "./securityMemory.ts";

export function recommendSecurityAction(finding: DekoCleanFinding, projectRoot = process.cwd()): DekoBrainSecurityRecommendation {
  const memory = readSecurityMemory(projectRoot).filter((entry) => entry.enabled && entry.result !== "failed");
  const exact = finding.fileHashSha256
    ? memory.find((entry) => entry.fileHashSha256 === finding.fileHashSha256)
    : undefined;
  const similar = !exact ? memory.find((entry) => entry.threatName && entry.threatName === finding.title) : undefined;
  const recommendedAction: DekoCleanAction = finding.severity === "critical" || finding.type === "suspicious-file"
    ? "quarantine"
    : finding.recommendedActions[0] ?? "validate";
  return {
    findingId: finding.id,
    summary: `DekoBrain يوصي بـ${recommendedAction} بعد مراجعة الدليل المتاح.`,
    riskExplanation: finding.explanation,
    recommendedAction,
    alternativeActions: finding.recommendedActions.filter((action) => action !== recommendedAction),
    affectedPaths: finding.affectedPaths,
    securityMemoryMatch: exact
      ? { entryId: exact.id, confidence: 0.98, sameHash: true }
      : similar ? { entryId: similar.id, confidence: 0.4, sameHash: false } : undefined,
    requiresAdminConfirmation: true,
    warnings: [
      "التوصية تفسيرية ولا تستبدل تقرير أداة الحماية الموثوقة.",
      ...(similar && !exact ? ["الاسم متشابه لكن الهاش مختلف؛ يلزم فحص جديد وتأكيد مستقل."] : []),
      ...(finding.affectedPaths.length === 0 ? ["التنبيه لا يحدد مسار ملف؛ الحجر غير متاح قبل تحديد الأصل من الأداة الموثوقة."] : []),
    ],
  };
}

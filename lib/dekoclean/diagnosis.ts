import type { DiagnosisCard, DekoCleanFinding, SeverityExplanation } from "./types.ts";

export const SEVERITY_EXPLANATIONS: Record<DekoCleanFinding["severity"], SeverityExplanation> = {
  critical: { severity: "critical", label: "حرج", explanation: "استقرار المشروع متأثر. يوصى بإجراء فوري." },
  high: { severity: "high", label: "مرتفع", explanation: "تتأثر صفحات أو أنظمة متعددة." },
  medium: { severity: "medium", label: "متوسط", explanation: "تتأثر وحدة واحدة." },
  low: { severity: "low", label: "منخفض", explanation: "مشكلة بسيطة." },
  info: { severity: "info", label: "معلوماتي", explanation: "لا يلزم إصلاح." },
};

export function createDiagnosisCard(finding: DekoCleanFinding): DiagnosisCard {
  const suggestedRepair = finding.recommendedActions[0] ?? "validate";
  const destructive = ["repair", "restore", "recreate", "quarantine"].includes(suggestedRepair);
  const confidence = finding.evidence.length === 0 ? 0.45 : finding.fileHashSha256 ? 0.98 : Math.min(0.92, 0.58 + finding.evidence.length * 0.08);
  return {
    findingId: finding.id,
    problem: finding.title,
    severity: SEVERITY_EXPLANATIONS[finding.severity],
    detectedBy: finding.detectedBy,
    affectedFiles: finding.affectedPaths,
    dependencies: finding.dependencies,
    relatedFindingIds: finding.relatedFindingIds,
    cause: finding.evidence[0] ?? "لم يسجل الكاشف سببًا إضافيًا؛ يلزم التحقق قبل أي إصلاح.",
    analysis: finding.explanation,
    confidence,
    suggestedRepair,
    expectedImpact: destructive
      ? "قد يغيّر ملفات المشروع؛ يلزم snapshot وmanifest وتحقق كامل قبل اعتماد النتيجة."
      : "لا يغيّر ملفات المشروع مباشرة، مع بقاء التحقق مطلوبًا.",
    safetyChecks: { snapshot: destructive, manifest: destructive, rollback: destructive },
    validation: ["lint", "build", "radar"],
    estimatedRisk: finding.severity,
    estimatedTime: finding.affectedPaths.length > 5 ? "5–15 دقيقة" : "أقل من 5 دقائق",
  };
}

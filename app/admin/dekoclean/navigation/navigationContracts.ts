export type DashboardNavigationTarget = "radar" | "needs-review" | "healthy-files" | "recommended-actions" | "current-findings" | "security-reports" | "maintenance-timeline" | "recovery-points" | "finding-plan" | "finding-details";
export type NavigationContract = { sourceId: string; sourceLabel: string; sourceType: "card" | "button" | "link" | "recommendation"; target: DashboardNavigationTarget; sectionId: string; requiresFindingId?: boolean; severityOnFailure: "low" | "medium" | "high" };
export const navigationContracts: NavigationContract[] = [
  { sourceId: "summary-radar", sourceLabel: "تنبيهات الرادار", sourceType: "card", target: "radar", sectionId: "dekoclean-radar-section", severityOnFailure: "high" },
  { sourceId: "summary-needs-review", sourceLabel: "تحتاج مراجعة", sourceType: "card", target: "needs-review", sectionId: "dekoclean-needs-review-section", severityOnFailure: "medium" },
  { sourceId: "summary-healthy", sourceLabel: "ملفات سليمة", sourceType: "card", target: "healthy-files", sectionId: "dekoclean-healthy-files-section", severityOnFailure: "medium" },
  { sourceId: "summary-quarantine", sourceLabel: "الحجر", sourceType: "card", target: "recovery-points", sectionId: "dekoclean-recovery-points-section", severityOnFailure: "medium" },
  { sourceId: "recommended-action-plan", sourceLabel: "عرض الخطة", sourceType: "recommendation", target: "finding-plan", sectionId: "dekoclean-finding-plan", requiresFindingId: true, severityOnFailure: "high" },
];

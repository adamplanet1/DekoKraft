import type { UIInspectorRecord } from "./uiInspectorTypes.ts";

const checkedAt = "2026-07-21T00:00:00.000Z";
const record = (input: Omit<UIInspectorRecord, "lastCheckedAt">): UIInspectorRecord => ({ ...input, lastCheckedAt: checkedAt });

export const DEKOCLEAN_UI_REGISTRY: UIInspectorRecord[] = [
  ...(["overview", "security", "memory", "audit", "timeline", "ui-inspector"] as const).map((id) => record({ id: `tab-${id}`, label: ({ overview: "نظرة عامة", security: "الأمن والحماية", memory: "ذاكرة العمليات", audit: "سجل العمليات", timeline: "الخط الزمني للصيانة", "ui-inspector": "مفتش الواجهة" })[id], kind: "tab", status: "working", expectedAction: "select", target: id, source: "DekoCleanCenter", connected: true })),
  ...(["project-health", "security", "memory-integrity", "ai-stability", "performance"] as const).map((id) => record({ id: `details-${id}`, label: `عرض تفاصيل ${id}`, kind: "button", status: "working", expectedAction: "open-details", target: id === "security" ? "security" : "overview", source: "MissionControlAnalytics", connected: true })),
  record({ id: "quick-scan", label: "فحص المشروع", kind: "button", status: "working", expectedAction: "run-scan", target: "/api/admin/dekoclean/scan", source: "DekoCleanCenter", connected: true }),
  record({ id: "quick-radar", label: "تشغيل DekoRadar", kind: "button", status: "working", expectedAction: "run-scan", target: "/api/admin/dekoclean/scan", source: "DekoCleanCenter", connected: true }),
  record({ id: "quick-security", label: "فحص الأمان", kind: "button", status: "working", expectedAction: "run-scan", target: "/api/admin/dekoclean/security/scan", source: "DekoCleanCenter", connected: true }),
  record({ id: "quick-maintenance-plan", label: "معاينة خطة التنظيف", kind: "button", status: "working", expectedAction: "open-details", target: "findings", source: "DekoCleanCenter", connected: true }),
  record({ id: "summary-radar", label: "تنبيهات الرادار", kind: "card", status: "working", expectedAction: "navigate", target: "security", source: "DekoCleanCenter", connected: true }),
  record({ id: "summary-review", label: "تحتاج مراجعة", kind: "card", status: "working", expectedAction: "navigate", target: "findings", source: "DekoCleanCenter", connected: true }),
  record({ id: "summary-healthy", label: "ملفات سليمة", kind: "card", status: "working", expectedAction: "navigate", target: "scan-results", source: "DekoCleanCenter", connected: true }),
  record({ id: "summary-quarantine", label: "الحجر المؤقت", kind: "card", status: "working", expectedAction: "navigate", target: "recovery-points", source: "DekoCleanCenter", connected: true }),
  record({ id: "finding-card", label: "بطاقة النتيجة", kind: "card", status: "working", expectedAction: "select", target: "findingId", source: "DekoCleanCenter", connected: true }),
  record({ id: "finding-details", label: "عرض التفاصيل", kind: "button", status: "working", expectedAction: "open-details", target: "selectedFindingId", source: "DekoCleanCenter", connected: true }),
  record({ id: "finding-plan", label: "عرض الخطة", kind: "button", status: "working", expectedAction: "open-details", target: "findingId", source: "MissionControlAnalytics", connected: true }),
  ...(["repair", "restore", "validate"] as const).map((action) => record({ id: `finding-${action}`, label: ({ repair: "إصلاح", restore: "استعادة", validate: "تحقق" })[action], kind: "button", status: "working", expectedAction: action, target: `/api/admin/dekoclean/${action}`, source: "DekoCleanCenter", connected: true })),
  record({ id: "finding-recreate", label: "إعادة إنشاء", kind: "button", status: "working", expectedAction: "open-details", target: "repair", source: "DekoCleanCenter", connected: true }),
  record({ id: "finding-cancel", label: "إلغاء", kind: "button", status: "working", expectedAction: "toggle", target: "clear-preview", source: "DekoCleanCenter", connected: true }),
  record({ id: "health-score", label: "درجة صحة المشروع", kind: "card", status: "informational", expectedAction: "none", source: "DekoCleanCenter", connected: false }),
  record({ id: "security-score", label: "درجة الأمان", kind: "card", status: "informational", expectedAction: "none", source: "MissionControlAnalytics", connected: false }),
];

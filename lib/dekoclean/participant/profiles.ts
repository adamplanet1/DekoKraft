import type { ParticipantCleanProfile, ParticipantCleanProfileId, ParticipantScanProfile, ParticipantScanProfileId } from "./types.ts";

export const PARTICIPANT_SCAN_PROFILES: readonly ParticipantScanProfile[] = [
  { id: "quick", icon: "⚡", titleAr: "فحص سريع", titleEn: "Quick Scan", descriptionAr: "يفحص موارد حسابك الجديدة أو المتغيرة فقط باستخدام البصمات المخزنة.", incremental: true, confirmationRequired: false },
  { id: "full", icon: "📁", titleAr: "فحص كامل", titleEn: "Full Scan", descriptionAr: "يفحص جميع المنتجات والصور والموارد المؤهلة المملوكة لحسابك فقط.", incremental: false, confirmationRequired: true },
  { id: "security", icon: "🛡️", titleAr: "فحص الأمان", titleEn: "Security Scan", descriptionAr: "يراجع أدلة سلامة الملفات دون تشغيلها أو استخراج محتواها.", incremental: false, confirmationRequired: true },
  { id: "assets", icon: "📦", titleAr: "فحص المواد والصور", titleEn: "Materials & Images", descriptionAr: "يفحص صور المنتجات ومراجعها وموارد المتجر والمرفقات المملوكة لك.", incremental: false, confirmationRequired: false },
  { id: "performance", icon: "📊", titleAr: "فحص الأداء", titleEn: "Performance Scan", descriptionAr: "يعرض القياسات الفعلية المتاحة فقط، وتبقى القيم غير المقاسة غير متاحة.", incremental: false, confirmationRequired: false },
];

export const PARTICIPANT_CLEAN_PROFILES: readonly ParticipantCleanProfile[] = [
  { id: "quick-clean", icon: "✨", titleAr: "تنظيف سريع", titleEn: "Quick Clean", descriptionAr: "إزالة الملفات المؤقتة وذاكرة المعاينة والملفات القابلة لإعادة الإنشاء.", executable: true },
  { id: "deep-clean", icon: "🧹", titleAr: "تنظيف عميق", titleEn: "Deep Clean", descriptionAr: "مراجعة الموارد غير المستخدمة والنسخ المكررة والملفات القديمة قبل حذفها.", executable: false },
];

export function getParticipantScanProfile(id: string): ParticipantScanProfile {
  const profile = PARTICIPANT_SCAN_PROFILES.find((item) => item.id === id);
  if (!profile) throw new Error("ملف الفحص غير مسموح.");
  return profile;
}

export function getParticipantCleanProfile(id: string): ParticipantCleanProfile {
  const profile = PARTICIPANT_CLEAN_PROFILES.find((item) => item.id === id);
  if (!profile) throw new Error("ملف التنظيف غير مسموح.");
  return profile;
}

export function isParticipantScanProfileId(value: string): value is ParticipantScanProfileId { return PARTICIPANT_SCAN_PROFILES.some((item) => item.id === value); }
export function isParticipantCleanProfileId(value: string): value is ParticipantCleanProfileId { return PARTICIPANT_CLEAN_PROFILES.some((item) => item.id === value); }

import type { DekoScanProfile, DekoScanProfileId } from "./types.ts";

export const DEKO_SCAN_PROFILES: readonly DekoScanProfile[] = [
  { id: "quick", icon: "⚡", titleAr: "فحص سريع", titleEn: "Quick Scan", descriptionAr: "يفحص التغييرات الجديدة فقط لتوفير الوقت.", detectorIds: ["project-core", "invalid-json", "participants"], supportsIncremental: true, requiresSecurityConnector: false, expectedScope: "changed-files", tone: "blue" },
  { id: "full", icon: "📁", titleAr: "فحص كامل", titleEn: "Full Scan", descriptionAr: "يفحص جميع ملفات المشروع المؤهلة. قد يستغرق وقتًا أطول.", detectorIds: ["project-core", "invalid-json", "security", "dekobrain", "translations", "assets", "participants", "performance", "navigation-integrity", "ui-inspector"], supportsIncremental: false, requiresSecurityConnector: false, expectedScope: "entire-project", tone: "indigo" },
  { id: "security", icon: "🛡️", titleAr: "فحص الأمان", titleEn: "Security Scan", descriptionAr: "يفحص أدلة الأمان وسلامة الملفات المحمية دون تنفيذ الملفات.", detectorIds: ["security"], supportsIncremental: false, requiresSecurityConnector: false, expectedScope: "security-only", tone: "red" },
  { id: "dekobrain", icon: "🧠", titleAr: "فحص DekoBrain", titleEn: "DekoBrain Scan", descriptionAr: "يقيس الاستقرار التشغيلي للذكاء الاصطناعي والذاكرة والتكلفة.", detectorIds: ["dekobrain"], supportsIncremental: false, requiresSecurityConnector: false, expectedScope: "ai-only", tone: "violet" },
  { id: "translations", icon: "🌐", titleAr: "فحص الترجمات", titleEn: "Translations Scan", descriptionAr: "يقارن بنية العربية والإنجليزية والألمانية والفرنسية.", detectorIds: ["translations"], supportsIncremental: false, requiresSecurityConnector: false, expectedScope: "translations-only", tone: "cyan" },
  { id: "assets", icon: "📦", titleAr: "فحص الموارد والصور", titleEn: "Assets Scan", descriptionAr: "يفحص مسارات الصور والأزواج والأحجام والموارد اليتيمة.", detectorIds: ["assets"], supportsIncremental: true, requiresSecurityConnector: false, expectedScope: "assets-only", tone: "amber" },
  { id: "participants", icon: "🔗", titleAr: "فحص المشاركين", titleEn: "Participants Scan", descriptionAr: "يفحص اتساق الملكية والربط بسجل participantId المشترك.", detectorIds: ["participants"], supportsIncremental: false, requiresSecurityConnector: false, expectedScope: "participants-only", tone: "teal" },
  { id: "performance", icon: "📊", titleAr: "فحص الأداء", titleEn: "Performance Scan", descriptionAr: "يقرأ قياسات الأداء الفعلية المتاحة دون اختلاق قيم مفقودة.", detectorIds: ["performance"], supportsIncremental: false, requiresSecurityConnector: false, expectedScope: "performance-only", tone: "green" },
] as const;

export function isDekoScanProfileId(value: unknown): value is DekoScanProfileId {
  return typeof value === "string" && DEKO_SCAN_PROFILES.some((profile) => profile.id === value);
}

export function getDekoScanProfile(profileId: DekoScanProfileId): DekoScanProfile {
  const profile = DEKO_SCAN_PROFILES.find((entry) => entry.id === profileId);
  if (!profile) throw new Error("Invalid DekoClean scan profile.");
  return profile;
}

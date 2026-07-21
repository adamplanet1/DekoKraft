export type InstructionClassification = {
  normalized: string;
  backgroundRemoval: boolean;
  cleanup: boolean;
  resize: boolean;
  formatConversion: boolean;
  generation: boolean;
  sceneGeneration: boolean;
  relighting: boolean;
  advertising: boolean;
  objectReplacement: boolean;
  restoration: boolean;
  protectedFeatureRisk: boolean;
  ambiguous: boolean;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[ـًٌٍَُِّْ]/g, "").replace(/\s+/g, " ").trim();
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

export const detectBackgroundRemoval = (text: string) => includesAny(normalize(text), ["ازالة الخلفية", "إزالة الخلفية", "ازل الخلفية", "أزل الخلفية", "خلفية شفافة", "remove background", "transparent background", "isolate product"]);
export const detectCleanup = (text: string) => includesAny(normalize(text), ["تنظيف الحواف", "ازالة الهالة", "إزالة الهالة", "تنظيف الشفافية", "شوائب منفصلة", "clean edges", "remove halo", "alpha cleanup", "detached artifact"]);
export const detectGeneration = (text: string) => includesAny(normalize(text), ["انشاء", "إنشاء", "صمم", "تصميم جديد", "توليد", "create", "generate", "redesign", "mockup"]);
export const detectRelighting = (text: string) => includesAny(normalize(text), ["تغيير الاضاءة", "تغيير الإضاءة", "اضاءة استوديو", "إضاءة استوديو", "relight", "change lighting", "studio lighting"]);
export const detectAdvertising = (text: string) => includesAny(normalize(text), ["اعلان", "إعلان", "صورة اعلانية", "صورة إعلانية", "حملة", "advertising", "product ad", "campaign"]);
export const detectObjectReplacement = (text: string) => includesAny(normalize(text), ["اضافة عنصر", "إضافة عنصر", "حذف عنصر", "استبدال عنصر", "add object", "remove object", "replace object"]);
export const detectProtectedFeatureRisk = (text: string) => includesAny(normalize(text), ["غير المنتج بالكامل", "غيّر المنتج بالكامل", "بدل شكل المنتج", "تغيير الشكل الاصلي", "change product completely", "replace the product", "change exact shape"]);

export function detectAmbiguity(text: string) {
  const value = normalize(text);
  const conflict = includesAny(value, ["غير المنتج بالكامل", "غيّر المنتج بالكامل", "change product completely"])
    && includesAny(value, ["حافظ عليه كما هو", "ابقه كما هو", "keep it unchanged", "preserve it exactly"]);
  return conflict || value.length < 5 || includesAny(value, ["حسنه", "حسّن", "make it better", "do something"]);
}

export function classifyInstruction(text: string): InstructionClassification {
  const normalized = normalize(text);
  const sceneGeneration = includesAny(normalized, ["مشهد", "صالون", "غرفة", "بيئة", "replace background", "new scene", "scene generation", "luxury salon"]);
  return {
    normalized,
    backgroundRemoval: detectBackgroundRemoval(text),
    cleanup: detectCleanup(text),
    resize: includesAny(normalized, ["تغيير الحجم", "قص بسيط", "resize", "simple crop", "crop"]),
    formatConversion: includesAny(normalized, ["تحويل الصيغة", "تحويل الى png", "تحويل إلى png", "format conversion", "convert to png", "convert to webp"]),
    generation: detectGeneration(text) || sceneGeneration,
    sceneGeneration,
    relighting: detectRelighting(text),
    advertising: detectAdvertising(text),
    objectReplacement: detectObjectReplacement(text),
    restoration: includesAny(normalized, ["ترميم", "اصلاح معقد", "إصلاح معقد", "restore", "restoration", "perspective reconstruction"]),
    protectedFeatureRisk: detectProtectedFeatureRisk(text),
    ambiguous: detectAmbiguity(text),
  };
}

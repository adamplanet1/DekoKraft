import type { SmartProductSpecifications } from "./SmartEditLearningStore";

export type ProductCategoryId = "packaging" | "candles" | "gifts" | "kids" | "services";
export type SpecificationField = Exclude<keyof SmartProductSpecifications, "id" | "categoryId" | "categoryName" | "confirmed" | "confirmedAt" | "smartEditProfile">;
export type CategoryDrafts = Partial<Record<ProductCategoryId, SmartProductSpecifications>>;

export const CATEGORY_DRAFTS_SESSION_KEY = "dekokraft.smartEdit.categoryDrafts";

export const categorySpecificationSchema: Record<ProductCategoryId, SpecificationField[]> = {
  packaging: ["productType", "shape", "material", "color", "dimensions", "usage", "lidType", "closureType", "capacity"],
  candles: ["productType", "shape", "material", "color", "background", "dimensions", "usage", "hasWick", "scent", "burnTime", "waxType"],
  gifts: ["productType", "shape", "material", "color", "background", "dimensions", "usage", "personalization", "occasion"],
  kids: ["productType", "shape", "material", "color", "background", "dimensions", "usage", "ageGroup", "educationalGoal", "safetyNotes"],
  services: ["productType", "usage", "serviceType", "inputFileType", "outputFileType", "estimatedDuration"],
};

export function saveCategoryDrafts(drafts: CategoryDrafts) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(CATEGORY_DRAFTS_SESSION_KEY, JSON.stringify(drafts));
  } catch {
    // The editor remains usable in memory when session storage is unavailable.
  }
}

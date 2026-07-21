import type {
  CompatibilityOverride,
  CompatibilityStatus,
  ProvisionalCategory,
} from "../../types/dekobrain";

const compatibleCategories = new Set<ProvisionalCategory>([
  "candles",
  "packaging",
  "gifts",
  "children",
  "decoration",
  "services",
  "gypsum-decor",
]);

export function evaluateCompatibility(
  category: ProvisionalCategory,
  override: CompatibilityOverride = "none"
): CompatibilityStatus {
  if (override === "approved") return "compatible";
  if (override === "rejected") return "incompatible";
  if (category === "other") return "needsReview";
  return compatibleCategories.has(category) ? "compatible" : "unknown";
}

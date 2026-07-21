import type { EchoGuideOperation } from "./types";

/** Advisory estimate only. The execution logger remains authoritative. */
export const SMART_EDIT_IMAGE_ESTIMATE_USD = 0.26;

export function estimateOperationCost(operation: EchoGuideOperation) {
  if (operation === "background-removal" || operation === "edge-cleanup") {
    return { estimatedCostUsd: 0, estimatedCostMinUsd: 0, estimatedCostMaxUsd: 0 };
  }
  return {
    estimatedCostUsd: SMART_EDIT_IMAGE_ESTIMATE_USD,
    estimatedCostMinUsd: SMART_EDIT_IMAGE_ESTIMATE_USD,
    estimatedCostMaxUsd: SMART_EDIT_IMAGE_ESTIMATE_USD,
  };
}

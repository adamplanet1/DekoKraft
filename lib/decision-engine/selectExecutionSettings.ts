import { SMART_EDIT_IMAGE_ESTIMATE_USD } from "../echo-guide/pricing";
import type { DecisionPlanStep, ExecutionProvider } from "./types";

export function selectModel(provider: ExecutionProvider, suggestedModel?: string) {
  if (provider === "local") return "local-pixel-background-removal";
  return suggestedModel === "gpt-image-2" ? suggestedModel : "gpt-image-2";
}

export function selectQuality(provider: ExecutionProvider, suggestedQuality?: string) {
  return provider === "local" ? "low" : suggestedQuality ?? "medium";
}

export function selectSize(suggestedSize?: string) {
  return suggestedSize ?? "1024x1024";
}

export function estimateExecutionCost(provider: ExecutionProvider, plan: DecisionPlanStep[]) {
  if (provider === "local" || provider === "blocked" || provider === "manual-review") return 0;
  const paidSteps = plan.filter((step) => step.provider === "openai").length;
  return paidSteps > 0 ? SMART_EDIT_IMAGE_ESTIMATE_USD * paidSteps : 0;
}

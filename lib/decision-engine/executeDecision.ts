import type { SmartEditExecutionInput } from "../../app/studio/engine/ExecutionPipeline";
import { executeSmartEditPipeline } from "../../app/studio/engine/ExecutionPipeline";
import type { DecisionResult } from "./types";

export async function executeDecision(decision: DecisionResult, input: Omit<SmartEditExecutionInput, "decision" | "executionId" | "decisionId" | "executionProvider" | "executionPlan">) {
  if (!decision.canExecute || decision.provider === "blocked" || decision.provider === "manual-review") {
    throw new Error(decision.reasonText);
  }
  return executeSmartEditPipeline({
    ...input,
    decision,
    executionId: decision.executionId,
    decisionId: decision.id,
    executionProvider: decision.provider,
    executionPlan: decision.plan,
  });
}

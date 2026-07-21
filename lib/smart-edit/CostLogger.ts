import "server-only";

import { addAICostRecord } from "../ai-cost/costStore";
import type { AICostOperation, AICostProvider, AICostRecord } from "../ai-cost/types";
import type { WorkspaceId, WorkspaceToolId } from "../../app/studio/engine/workspaceTypes";
import type { DecisionPlanStep } from "../decision-engine/types";

export type SmartEditAccountingInput = {
  generationId: string;
  createdAt: string;
  workspace: WorkspaceId;
  tool: WorkspaceToolId;
  model: string;
  operation: AICostOperation;
  estimatedCostUsd: number;
  actualCostUsd: number;
  inputTokens?: number;
  outputTokens?: number;
  generationTimeMs: number;
  productId?: string;
  participantId?: string;
  sellerId?: string;
  echoGuideRecommendationId: string;
  quality?: string;
  size?: string;
  ratio?: string;
  decisionId: string;
  executionProvider: AICostProvider;
  executionPlan: DecisionPlanStep[];
};

export async function logSmartEditCost(input: SmartEditAccountingInput) {
  const record: AICostRecord = {
    id: crypto.randomUUID(),
    createdAt: input.createdAt,
    userId: input.participantId ?? "studio-user",
    role: "participant",
    participantId: input.participantId,
    sellerId: input.participantId ? undefined : input.sellerId,
    productId: input.productId,
    operation: input.operation,
    provider: input.executionProvider,
    workspace: input.workspace,
    tool: input.tool,
    model: input.model,
    requestId: input.generationId,
    executionId: input.generationId,
    generationTimeMs: input.generationTimeMs,
    imageCount: input.operation === "image-edit" || input.operation === "background-removal" ? 1 : undefined,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    estimatedCostUsd: input.estimatedCostUsd,
    actualCostUsd: input.actualCostUsd,
    status: "success",
    metadata: {
      generationId: input.generationId,
      sellerId: input.participantId ? undefined : input.sellerId,
      source: input.participantId ? "participant-studio" : "universal-smart-edit-pipeline",
      echoGuideRecommendationId: input.echoGuideRecommendationId,
      quality: input.quality,
      size: input.size,
      ratio: input.ratio,
      decisionId: input.decisionId,
      provider: input.executionProvider,
      steps: input.executionPlan.map((step) => ({ order: step.order, provider: step.provider, action: step.action })),
    },
  };
  if (process.env.NODE_ENV === "development") console.info("[Decision Engine] AI cost record created", { executionId: input.generationId, provider: input.executionProvider, amountUsd: input.actualCostUsd });
  return addAICostRecord(record);
}

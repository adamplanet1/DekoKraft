import { generateEchoSmartEdit, type EchoGenerationPayload } from "../../../lib/echo/generateEchoSmartEdit";
import { recordFailedSmartEdit, recordGeneratedSmartEdit } from "./HistoryLogger";
import type { WorkspaceId } from "./workspaceTypes";
import type { DecisionResult } from "../../../lib/decision-engine/types";

export type SmartEditExecutionInput = EchoGenerationPayload & {
  workspace: WorkspaceId;
  productId?: string;
  participantId?: string;
  sellerId?: string;
  originalSource: string;
  userInstruction: string;
  decision: DecisionResult;
};

export async function executeSmartEditPipeline(input: SmartEditExecutionInput) {
  const fallbackExecutionId = input.decision.executionId;
  try {
    const result = await generateEchoSmartEdit({
      ...input,
      workspace: input.workspace,
      tool: "smart-edit",
      productId: input.productId,
      participantId: input.participantId,
      sellerId: input.participantId ? undefined : input.sellerId,
    });

    if (result.success && result.imageBase64 && result.generationId) {
      recordGeneratedSmartEdit({
        generationId: result.generationId,
        executionId: result.generationId,
        recommendationId: input.echoGuideRecommendationId,
        decisionId: input.decision.id,
        provider: input.decision.provider,
        plan: input.decision.plan,
        workspace: input.workspace,
        tool: "smart-edit",
        operation: input.background === "transparent" ? "background-removal" : "image-edit",
        userInstruction: input.userInstruction,
        finalPrompt: input.instruction,
        model: result.model ?? input.model,
        quality: input.quality,
        size: input.size,
        estimatedCost: input.decision.estimatedCostUsd,
        actualCost: result.actualCostUsd,
        productId: input.productId,
        participantId: input.participantId,
        sellerId: input.participantId ? undefined : input.sellerId,
        original: { source: input.originalSource, mimeType: input.sourceImage.type },
        generated: {
          mimeType: result.mimeType ?? "image/png",
          reference: `generation:${result.generationId}`,
        },
      });
    } else if (!result.success) {
      recordFailedSmartEdit({
        generationId: result.generationId ?? fallbackExecutionId,
        executionId: result.generationId ?? fallbackExecutionId,
        recommendationId: input.echoGuideRecommendationId,
        decisionId: input.decision.id,
        provider: input.decision.provider,
        plan: input.decision.plan,
        workspace: input.workspace,
        tool: "smart-edit",
        operation: input.background === "transparent" ? "background-removal" : "image-edit",
        userInstruction: input.userInstruction,
        finalPrompt: input.instruction,
        model: result.model ?? input.model,
        quality: input.quality,
        size: input.size,
        estimatedCost: input.decision.estimatedCostUsd,
        actualCost: result.actualCostUsd,
        productId: input.productId,
        participantId: input.participantId,
        sellerId: input.participantId ? undefined : input.sellerId,
        original: { source: input.originalSource, mimeType: input.sourceImage.type },
      });
    }

    return result;
  } catch (error) {
    recordFailedSmartEdit({
      generationId: fallbackExecutionId,
      executionId: fallbackExecutionId,
      recommendationId: input.echoGuideRecommendationId,
      decisionId: input.decision.id,
      provider: input.decision.provider,
      plan: input.decision.plan,
      workspace: input.workspace,
      tool: "smart-edit",
      operation: input.background === "transparent" ? "background-removal" : "image-edit",
      userInstruction: input.userInstruction,
      finalPrompt: input.instruction,
      model: input.model,
      quality: input.quality,
      size: input.size,
      estimatedCost: input.decision.estimatedCostUsd,
      productId: input.productId,
      participantId: input.participantId,
      sellerId: input.participantId ? undefined : input.sellerId,
      original: { source: input.originalSource, mimeType: input.sourceImage.type },
    });
    throw error;
  }
}

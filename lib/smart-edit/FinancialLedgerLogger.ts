import "server-only";

import { addFinancialLedgerEntry } from "../financial-ledger/store";
import type { SmartEditAccountingInput } from "./CostLogger";

export async function logSmartEditFinancialEntry(input: SmartEditAccountingInput) {
  return addFinancialLedgerEntry({
    id: crypto.randomUUID(),
    createdAt: input.createdAt,
    type: "ai-consumption",
    referenceId: input.generationId,
    generationId: input.generationId,
    workspace: input.workspace,
    tool: input.tool,
    amountUsd: input.actualCostUsd,
    model: input.model,
    productId: input.productId,
    participantId: input.participantId,
    sellerId: input.participantId ? undefined : input.sellerId,
    metadata: {
      generationTimeMs: input.generationTimeMs,
      echoGuideRecommendationId: input.echoGuideRecommendationId,
      workspace: input.workspace,
      productId: input.productId,
      participantId: input.participantId,
      sellerId: input.participantId ? undefined : input.sellerId,
      quality: input.quality,
      size: input.size,
      ratio: input.ratio,
      decisionId: input.decisionId,
      provider: input.executionProvider,
    },
  });
}

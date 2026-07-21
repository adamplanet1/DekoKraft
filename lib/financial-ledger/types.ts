import type { WorkspaceId, WorkspaceToolId } from "../../app/studio/engine/workspaceTypes";

export type FinancialLedgerEntryType = "ai-consumption";

export type FinancialLedgerEntry = {
  id: string;
  createdAt: string;
  type: FinancialLedgerEntryType;
  referenceId: string;
  generationId: string;
  workspace: WorkspaceId;
  tool: WorkspaceToolId;
  amountUsd: number;
  model: string;
  productId?: string;
  participantId?: string;
  sellerId?: string;
  metadata?: Record<string, unknown>;
};

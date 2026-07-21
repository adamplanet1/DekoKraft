import "server-only";

import { logSmartEditCost, type SmartEditAccountingInput } from "./CostLogger";
import { logSmartEditFinancialEntry } from "./FinancialLedgerLogger";

export async function recordSmartEditAccounting(input: SmartEditAccountingInput) {
  const costRecord = await logSmartEditCost(input);
  if (input.actualCostUsd <= 0) return { costRecordId: costRecord.id };
  const ledgerEntry = await logSmartEditFinancialEntry(input);
  if (process.env.NODE_ENV === "development") console.info("[Decision Engine] ledger record created", { executionId: input.generationId, amountUsd: input.actualCostUsd });
  return { costRecordId: costRecord.id, ledgerEntryId: ledgerEntry.id };
}

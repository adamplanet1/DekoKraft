import "server-only";
import { sellerProducts } from "../../app/data/sellerProducts";
import { listAICostRecords } from "../ai-cost/costStore";
import { listFinancialLedgerEntries } from "../financial-ledger/store";
import { normalizeParticipantId } from "./types";

export type ParticipantOwnershipAudit = {
  productsWithoutOwner: string[];
  ordersWithoutOwner: string[];
  customersWithoutOwner: string[];
  inventoryWithoutOwner: string[];
  aiCostWithoutOwner: string[];
  ledgerWithoutOwner: string[];
  historyWithoutOwner: string[];
  productDNAWithoutOwner: string[];
  echoLearningWithoutOwner: string[];
  legacySellerIdRecords: string[];
  normalizedParticipantIdRecords: number;
  localOnlyStores: string[];
};

export async function auditParticipantOwnership(): Promise<ParticipantOwnershipAudit> {
  const [aiCosts, ledger] = await Promise.all([listAICostRecords(), listFinancialLedgerEntries()]);
  const participantProducts = sellerProducts.filter((record) => record.ownerType !== "admin");
  const legacyProducts = participantProducts.filter((record) => !record.participantId && Boolean(record.sellerId));
  return {
    productsWithoutOwner: participantProducts.filter((record) => !normalizeParticipantId(record)).map((record) => record.id),
    ordersWithoutOwner: [],
    customersWithoutOwner: [],
    inventoryWithoutOwner: [],
    aiCostWithoutOwner: aiCosts.filter((record) => !normalizeParticipantId(record)).map((record) => record.id),
    ledgerWithoutOwner: ledger.filter((record) => !normalizeParticipantId(record)).map((record) => record.id),
    historyWithoutOwner: [],
    productDNAWithoutOwner: [],
    echoLearningWithoutOwner: [],
    legacySellerIdRecords: legacyProducts.map((record) => record.id),
    normalizedParticipantIdRecords: participantProducts.length - participantProducts.filter((record) => !normalizeParticipantId(record)).length + aiCosts.filter((record) => normalizeParticipantId(record)).length + ledger.filter((record) => normalizeParticipantId(record)).length,
    localOnlyStores: ["inventory", "smart-edit-history", "product-dna", "echo-learning"],
  };
}

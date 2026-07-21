export type FinancialOperationStatus = "paid" | "pending" | "refunded";
export type PurchaseInvoiceStatus = "paid" | "pending" | "overdue";

export interface FinancialTransaction {
  id: string;
  date: string;
  participantId: string;
  participantName: string;
  productId: string;
  productName: string;
  orderId: string;
  saleAmountEur: number;
  platformCommissionEur: number;
  participantNetIncomeEur: number;
  originalAICostUsd: number;
  actualAICostUsd: number;
  netProfitEur: number;
  invoiceNumber: string;
  status: FinancialOperationStatus;
}

export interface MaterialConsumptionItem {
  id: string;
  name: string;
  unit: string;
  quantityUsed: number;
  estimatedCostEur: number;
  remainingStock: number;
}

export interface PurchaseInvoice {
  id: string;
  supplier: string;
  invoiceNumber: string;
  date: string;
  amountEur: number;
  attachmentName?: string;
  status: PurchaseInvoiceStatus;
}

export interface MonthlyFinancialPoint {
  month: string;
  salesEur: number;
  platformProfitEur: number;
  openAICostUsd: number;
  echoSavingsUsd: number;
  netProfitEur: number;
}

export interface AIOperationBreakdown {
  images: number;
  edits: number;
  videos: number;
  threeD: number;
  analysis: number;
  prompts: number;
}

export interface FinancialDashboardDevelopmentData {
  participantCount: number;
  publishedProductCount: number;
  transactions: FinancialTransaction[];
  inventory: MaterialConsumptionItem[];
  purchaseInvoices: PurchaseInvoice[];
  monthly: MonthlyFinancialPoint[];
  fallbackAIOperations: AIOperationBreakdown;
  internalBudgetLimitUsd: number;
}

export interface FinancialDashboardSummary {
  participantCount: number;
  productCount: number;
  orderCount: number;
  totalSalesEur: number;
  platformCommissionEur: number;
  participantNetIncomeEur: number;
  openAICostUsd: number;
  echoSavingsUsd: number;
  netProfitEur: number;
  aiOperations: AIOperationBreakdown;
  aiOperationTotal: number;
  internalBudgetLimitUsd: number;
  remainingInternalBudgetUsd: number;
}

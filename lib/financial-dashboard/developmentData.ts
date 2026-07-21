import { sellerProducts } from "../../app/data/sellerProducts";
import { getAllSellers } from "../../app/data/sellers";
import type {
  FinancialDashboardDevelopmentData,
  FinancialTransaction,
  MonthlyFinancialPoint,
} from "./types";

// Phase 2 local-only fixtures. Replace these collections with repository calls
// when the financial database and accounting service are introduced.
const transactions: FinancialTransaction[] = [
  { id: "fin-001", date: "2026-07-16T11:25:00.000Z", participantId: "seller-001", participantName: "DekoKraft التجريبي", productId: "candle-001", productName: "شمعة العسل الفاخرة", orderId: "DK-ORD-2026-0716", saleAmountEur: 64.5, platformCommissionEur: 7.74, participantNetIncomeEur: 56.76, originalAICostUsd: 0.52, actualAICostUsd: 0.26, netProfitEur: 7.48, invoiceNumber: "DK-S-260716-01", status: "paid" },
  { id: "fin-002", date: "2026-07-13T14:10:00.000Z", participantId: "seller-002", participantName: "صناديق الحرفة", productId: "box-001", productName: "علبة هدية خشبية", orderId: "DK-ORD-2026-0713", saleAmountEur: 99.5, platformCommissionEur: 11.94, participantNetIncomeEur: 87.56, originalAICostUsd: 0.78, actualAICostUsd: 0.39, netProfitEur: 11.55, invoiceNumber: "DK-S-260713-02", status: "paid" },
  { id: "fin-003", date: "2026-07-08T09:35:00.000Z", participantId: "seller-001", participantName: "DekoKraft التجريبي", productId: "candle-002", productName: "شمعة زهرية", orderId: "DK-ORD-2026-0708", saleAmountEur: 46.5, platformCommissionEur: 5.58, participantNetIncomeEur: 40.92, originalAICostUsd: 0.31, actualAICostUsd: 0.18, netProfitEur: 5.4, invoiceNumber: "DK-S-260708-03", status: "pending" },
  { id: "fin-004", date: "2026-06-27T16:40:00.000Z", participantId: "seller-006", participantName: "خشب وحكاية", productId: "wood-demo-01", productName: "لوح ديكور خشبي", orderId: "DK-ORD-2026-0627", saleAmountEur: 148, platformCommissionEur: 17.76, participantNetIncomeEur: 130.24, originalAICostUsd: 0.66, actualAICostUsd: 0.32, netProfitEur: 17.44, invoiceNumber: "DK-S-260627-04", status: "paid" },
  { id: "fin-005", date: "2026-06-12T10:05:00.000Z", participantId: "seller-004", participantName: "ألوان البيت", productId: "decor-demo-02", productName: "قطعة ديكور ملونة", orderId: "DK-ORD-2026-0612", saleAmountEur: 82, platformCommissionEur: 9.84, participantNetIncomeEur: 72.16, originalAICostUsd: 0.4, actualAICostUsd: 0.24, netProfitEur: 9.6, invoiceNumber: "DK-S-260612-05", status: "paid" },
  { id: "fin-006", date: "2026-05-29T08:30:00.000Z", participantId: "seller-009", participantName: "طباعة مبتكرة", productId: "print-demo-01", productName: "مجسم مطبوع", orderId: "DK-ORD-2026-0529", saleAmountEur: 124, platformCommissionEur: 14.88, participantNetIncomeEur: 109.12, originalAICostUsd: 1.2, actualAICostUsd: 0.8, netProfitEur: 14.08, invoiceNumber: "DK-S-260529-06", status: "paid" },
  { id: "fin-007", date: "2026-04-18T12:20:00.000Z", participantId: "seller-002", participantName: "صناديق الحرفة", productId: "box-001", productName: "علبة هدية خشبية", orderId: "DK-ORD-2026-0418", saleAmountEur: 59.7, platformCommissionEur: 7.16, participantNetIncomeEur: 52.54, originalAICostUsd: 0.26, actualAICostUsd: 0.13, netProfitEur: 7.03, invoiceNumber: "DK-S-260418-07", status: "refunded" },
  { id: "fin-008", date: "2026-03-09T15:00:00.000Z", participantId: "seller-001", participantName: "DekoKraft التجريبي", productId: "candle-001", productName: "شمعة العسل الفاخرة", orderId: "DK-ORD-2026-0309", saleAmountEur: 38.7, platformCommissionEur: 4.64, participantNetIncomeEur: 34.06, originalAICostUsd: 0.22, actualAICostUsd: 0.12, netProfitEur: 4.52, invoiceNumber: "DK-S-260309-08", status: "paid" },
];

function monthlyPoint(month: string, rows: FinancialTransaction[]): MonthlyFinancialPoint {
  const active = rows.filter((row) => row.status !== "refunded");
  return {
    month,
    salesEur: active.reduce((sum, row) => sum + row.saleAmountEur, 0),
    platformProfitEur: active.reduce((sum, row) => sum + row.platformCommissionEur, 0),
    openAICostUsd: active.reduce((sum, row) => sum + row.actualAICostUsd, 0),
    echoSavingsUsd: active.reduce((sum, row) => sum + Math.max(0, row.originalAICostUsd - row.actualAICostUsd), 0),
    netProfitEur: active.reduce((sum, row) => sum + row.netProfitEur, 0),
  };
}

const monthly = ["2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07"].map((month) =>
  monthlyPoint(month, transactions.filter((row) => row.date.startsWith(month))),
);

export const financialDashboardDevelopmentData: FinancialDashboardDevelopmentData = {
  participantCount: getAllSellers().length,
  publishedProductCount: sellerProducts.filter((product) => product.status === "published").length,
  transactions,
  inventory: [
    { id: "wax", name: "الشمع", unit: "كغ", quantityUsed: 18.5, estimatedCostEur: 148, remainingStock: 42 },
    { id: "wood", name: "الخشب", unit: "لوح", quantityUsed: 24, estimatedCostEur: 216, remainingStock: 31 },
    { id: "boxes", name: "الصناديق", unit: "قطعة", quantityUsed: 86, estimatedCostEur: 103.2, remainingStock: 144 },
    { id: "cotton-bags", name: "أكياس القطن", unit: "قطعة", quantityUsed: 54, estimatedCostEur: 64.8, remainingStock: 96 },
    { id: "fragrance", name: "العطور", unit: "مل", quantityUsed: 740, estimatedCostEur: 88.8, remainingStock: 1260 },
    { id: "labels", name: "الملصقات", unit: "قطعة", quantityUsed: 192, estimatedCostEur: 38.4, remainingStock: 408 },
    { id: "packaging", name: "مواد التغليف", unit: "قطعة", quantityUsed: 112, estimatedCostEur: 78.4, remainingStock: 188 },
    { id: "ribbon", name: "الأشرطة", unit: "متر", quantityUsed: 67, estimatedCostEur: 33.5, remainingStock: 133 },
  ],
  purchaseInvoices: [
    { id: "pur-001", supplier: "Berlin Wax GmbH", invoiceNumber: "BW-2026-0711", date: "2026-07-11", amountEur: 286.4, attachmentName: "BW-2026-0711.pdf", status: "paid" },
    { id: "pur-002", supplier: "Nordholz Handel", invoiceNumber: "NH-84721", date: "2026-07-06", amountEur: 412.8, attachmentName: "NH-84721.pdf", status: "pending" },
    { id: "pur-003", supplier: "EcoPack Berlin", invoiceNumber: "EP-260629", date: "2026-06-29", amountEur: 194.3, status: "paid" },
    { id: "pur-004", supplier: "Duftwerk Hamburg", invoiceNumber: "DW-2026-553", date: "2026-06-18", amountEur: 167.9, attachmentName: "DW-2026-553.pdf", status: "overdue" },
  ],
  monthly,
  fallbackAIOperations: { images: 18, edits: 27, videos: 2, threeD: 4, analysis: 14, prompts: 31 },
  internalBudgetLimitUsd: 100,
};

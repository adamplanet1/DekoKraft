"use client";

import {
  Bot,
  Boxes,
  CircleDollarSign,
  Download,
  FileBarChart,
  FileText,
  PackageCheck,
  Printer,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import VideoBackground from "../../../src/components/VideoBackground";
import { useLanguage } from "../../components/LanguageProvider";
import { DkBrand, DkButton, DkGlassPanel } from "../../components/ui";
import { publicPath } from "../../lib/publicPath";
import type { AICostApiPayload, AICostRecord } from "../../../lib/ai-cost/types";
import { financialDashboardDevelopmentData as localData } from "../../../lib/financial-dashboard/developmentData";
import type {
  AIOperationBreakdown,
  FinancialDashboardSummary,
  MonthlyFinancialPoint,
} from "../../../lib/financial-dashboard/types";
import type { FinancialLedgerEntry } from "../../../lib/financial-ledger/types";
import AdminFooter from "../components/layout/AdminFooter";
import StudioTopToolbar from "../components/layout/StudioTopToolbar";
import FinancialBarChart from "./FinancialBarChart";

const activeTransactions = localData.transactions.filter((transaction) => transaction.status !== "refunded");

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function operationBreakdown(records: AICostRecord[]): AIOperationBreakdown {
  return records.reduce<AIOperationBreakdown>((result, record) => {
    if (record.operation === "image-generation") result.images += 1;
    else if (record.operation === "image-edit" || record.operation === "background-removal") result.edits += 1;
    else if (record.operation === "video-generation") result.videos += 1;
    else if (record.operation === "3d-generation") result.threeD += 1;
    else if (record.operation === "image-analysis") result.analysis += 1;
    else if (record.operation === "prompt-generation") result.prompts += 1;
    return result;
  }, { images: 0, edits: 0, videos: 0, threeD: 0, analysis: 0, prompts: 0 });
}

function echoSavings(records: AICostRecord[]) {
  return sum(records
    .filter((record) => record.status !== "refunded" && record.status !== "cancelled")
    .map((record) => Math.max(0, record.estimatedCostUsd - (record.actualCostUsd ?? record.estimatedCostUsd))));
}

function localSummary(): FinancialDashboardSummary {
  const openAICostUsd = sum(activeTransactions.map((row) => row.actualAICostUsd));
  const echoSavingsUsd = sum(activeTransactions.map((row) => Math.max(0, row.originalAICostUsd - row.actualAICostUsd)));
  const aiOperations = localData.fallbackAIOperations;
  return {
    participantCount: localData.participantCount,
    productCount: localData.publishedProductCount,
    orderCount: localData.transactions.length,
    totalSalesEur: sum(activeTransactions.map((row) => row.saleAmountEur)),
    platformCommissionEur: sum(activeTransactions.map((row) => row.platformCommissionEur)),
    participantNetIncomeEur: sum(activeTransactions.map((row) => row.participantNetIncomeEur)),
    openAICostUsd,
    echoSavingsUsd,
    netProfitEur: sum(activeTransactions.map((row) => row.netProfitEur)),
    aiOperations,
    aiOperationTotal: Object.values(aiOperations).reduce((total, value) => total + value, 0),
    internalBudgetLimitUsd: localData.internalBudgetLimitUsd,
    remainingInternalBudgetUsd: Math.max(0, localData.internalBudgetLimitUsd - openAICostUsd),
  };
}

function mergeAICostData(base: FinancialDashboardSummary, payload: AICostApiPayload | null) {
  if (!payload || payload.records.length === 0) return base;
  const aiOperations = operationBreakdown(payload.records);
  return {
    ...base,
    openAICostUsd: payload.summary.totalCostUsd,
    echoSavingsUsd: echoSavings(payload.records),
    aiOperations,
    aiOperationTotal: Object.values(aiOperations).reduce((total, value) => total + value, 0),
    internalBudgetLimitUsd: payload.summary.internalBudgetLimitUsd,
    remainingInternalBudgetUsd: payload.summary.remainingInternalBudgetUsd,
  };
}

function mergeMonthlyAI(points: MonthlyFinancialPoint[], payload: AICostApiPayload | null) {
  if (!payload || payload.records.length === 0) return points;
  return points.map((point) => {
    const records = payload.records.filter((record) => record.createdAt.startsWith(point.month));
    return {
      ...point,
      openAICostUsd: sum(records.map((record) => record.actualCostUsd ?? record.estimatedCostUsd)),
      echoSavingsUsd: echoSavings(records),
    };
  });
}

const statusLabels = {
  paid: "مدفوعة",
  pending: "قيد الانتظار",
  refunded: "مستردة",
  overdue: "متأخرة",
} as const;

export default function FinancialDashboard() {
  const { lang, setLang, t } = useLanguage();
  const [aiPayload, setAIPayload] = useState<AICostApiPayload | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>([]);
  const [aiDataSource, setAIDataSource] = useState<"phase-one" | "local">("local");
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  const baseSummary = useMemo(() => localSummary(), []);
  const summary = useMemo(() => mergeAICostData(baseSummary, aiPayload), [aiPayload, baseSummary]);
  const monthly = useMemo(() => mergeMonthlyAI(localData.monthly, aiPayload), [aiPayload]);
  const financialRows = useMemo(() => [
    ...ledgerEntries.map((entry) => ({
      id: entry.id,
      date: entry.createdAt,
      participantId: entry.participantId ?? "studio-user",
      participantName: entry.participantId ?? "Echo Studio",
      productId: entry.productId ?? "—",
      productName: entry.productId ?? "Smart Edit",
      orderId: entry.generationId,
      saleAmountEur: 0,
      platformCommissionEur: 0,
      participantNetIncomeEur: 0,
      originalAICostUsd: entry.amountUsd,
      actualAICostUsd: entry.amountUsd,
      netProfitEur: 0,
      invoiceNumber: `AI-${entry.generationId.slice(0, 8)}`,
      status: "paid" as const,
    })),
    ...localData.transactions,
  ], [ledgerEntries]);
  const euro = useMemo(() => new Intl.NumberFormat("ar-DE", { style: "currency", currency: "EUR" }), []);
  const usd = useMemo(() => new Intl.NumberFormat("ar-DE", { style: "currency", currency: "USD" }), []);
  const number = useMemo(() => new Intl.NumberFormat("ar"), []);

  const loadAICost = useCallback(async () => {
    try {
      const response = await fetch(publicPath("/api/ai-cost/"), { cache: "no-store" });
      if (!response.ok) throw new Error(`AI cost API ${response.status}`);
      const payload = await response.json() as AICostApiPayload;
      setAIPayload(payload);
      setAIDataSource(payload.records.length > 0 ? "phase-one" : "local");
    } catch {
      setAIPayload(null);
      setAIDataSource("local");
    }
    try {
      const ledgerResponse = await fetch(publicPath("/api/financial-ledger/"), { cache: "no-store" });
      if (!ledgerResponse.ok) throw new Error(`Financial ledger API ${ledgerResponse.status}`);
      const ledgerPayload = await ledgerResponse.json() as { entries?: FinancialLedgerEntry[] };
      setLedgerEntries(Array.isArray(ledgerPayload.entries) ? ledgerPayload.entries : []);
    } catch {
      setLedgerEntries([]);
    }
  }, []);

  useEffect(() => {
    void loadAICost();
  }, [loadAICost]);

  const summaryCards = [
    { id: "participants", label: "عدد المشاركين", value: number.format(summary.participantCount), note: "إجمالي المشاركين المسجلين", icon: UsersRound },
    { id: "products", label: "عدد المنتجات", value: number.format(summary.productCount), note: "المنتجات المنشورة", icon: PackageCheck },
    { id: "orders", label: "عدد الطلبات", value: number.format(summary.orderCount), note: "إجمالي طلبات العملاء", icon: ShoppingCart },
    { id: "sales", label: "إجمالي المبيعات", value: euro.format(summary.totalSalesEur), note: "باستثناء المبالغ المستردة", icon: TrendingUp },
    { id: "commission", label: "إجمالي عمولة المنصة", value: euro.format(summary.platformCommissionEur), note: "عمولة DekoKraft", icon: CircleDollarSign },
    { id: "participant-income", label: "صافي أرباح المشاركين", value: euro.format(summary.participantNetIncomeEur), note: "بعد عمولة المنصة", icon: WalletCards },
    { id: "openai", label: "تكلفة OpenAI", value: usd.format(summary.openAICostUsd), note: aiDataSource === "phase-one" ? "من لوحة تكلفة الذكاء" : "بيانات تطوير محلية", icon: Bot },
    { id: "echo", label: "إجمالي التوفير بواسطة Echo", value: usd.format(summary.echoSavingsUsd), note: "التكلفة الأصلية − الفعلية", icon: Sparkles },
  ];

  const generateReport = () => {
    const timestamp = new Date().toISOString();
    setReportGeneratedAt(timestamp);
    setActionMessage("تم إعداد التقرير الشهري من بيانات التطوير الحالية.");
    requestAnimationFrame(() => document.getElementById("monthly-financial-report")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const printReport = (pdfMode = false) => {
    if (!reportGeneratedAt) setReportGeneratedAt(new Date().toISOString());
    setActionMessage(pdfMode ? "اختر «حفظ كملف PDF» من نافذة الطباعة." : "تم فتح معاينة الطباعة.");
    requestAnimationFrame(() => window.print());
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const summaryRows = [
        ["البند", "القيمة"],
        ["المبيعات", summary.totalSalesEur], ["الطلبات", summary.orderCount], ["المشاركون", summary.participantCount],
        ["المنتجات", summary.productCount], ["عمولة المنصة", summary.platformCommissionEur], ["تكلفة OpenAI", summary.openAICostUsd],
        ["توفير Echo", summary.echoSavingsUsd], ["صافي الربح", summary.netProfitEur],
      ];
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), "الملخص");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(financialRows), "العمليات المالية");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(localData.inventory), "المواد المستهلكة");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(localData.purchaseInvoices), "فواتير الشراء");
      XLSX.writeFile(workbook, `dekokraft-financial-${new Date().toISOString().slice(0, 7)}.xlsx`);
      setActionMessage("تم تصدير تقرير Excel بنجاح.");
    } catch (error) {
      setActionMessage(error instanceof Error ? `تعذر تصدير Excel: ${error.message}` : "تعذر تصدير Excel.");
    } finally {
      setExporting(false);
    }
  };

  const materialCost = sum(localData.inventory.map((item) => item.estimatedCostEur));
  const purchaseTotal = sum(localData.purchaseInvoices.map((invoice) => invoice.amountEur));

  return (
    <main className="admin-video-page dk-studio-page adminSectionPage financialPage" dir="rtl">
      <VideoBackground src={publicPath("/videos/backgrounds/creator-bg.mp4")} />
      <div className="admin-video-overlay dk-video-overlay" aria-hidden="true" />
      <div className="admin-video-content dk-studio-content adminSectionPageContent financialPageContent">
        <StudioTopToolbar lang={lang} setLang={setLang} menuHref="/admin" settingsHref="/admin/settings" />

        <header className="financialHeader">
          <DkBrand
            name={t("header.brand")}
            subtitle="التحليلات المالية"
            mediaSrc={publicPath("/videos/logo/logo.mp4")}
            mediaType="video"
            mediaAlt="DekoKraft"
            fallbackImageSrc={publicPath("/logo-dekokraft-600.webp")}
            href="/admin"
          />
          <div className="financialHeading">
            <h1>التحليلات المالية</h1>
            <p>نظرة موحدة على المبيعات والعمولات وتكاليف الذكاء والمخزون ضمن بيانات التطوير المحلية.</p>
          </div>
        </header>

        <div className="financialDashboardBody">
          <section className="financialReportActions" aria-label="إجراءات التقرير المالي">
            <DkButton variant="primary" icon={<FileBarChart />} onClick={generateReport}>إنشاء التقرير الشهري</DkButton>
            <DkButton variant="glass" icon={<FileText />} onClick={() => printReport(true)}>إنشاء PDF</DkButton>
            <DkButton variant="glass" icon={<Download />} disabled={exporting} onClick={() => void exportExcel()}>{exporting ? "جارٍ التصدير..." : "تصدير Excel"}</DkButton>
            <DkButton variant="glass" icon={<Printer />} onClick={() => printReport(false)}>طباعة التقرير</DkButton>
          </section>
          {actionMessage && <p className="financialActionMessage" role="status">{actionMessage}</p>}

          <section className="financialSummaryGrid" aria-label="الملخص المالي">
            {summaryCards.map(({ id, label, value, note, icon: Icon }) => (
              <DkGlassPanel as="article" strength="normal" className="financialSummaryCard" key={id}>
                <span className="financialSummaryIcon"><Icon aria-hidden="true" /></span>
                <div><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
              </DkGlassPanel>
            ))}
            <DkGlassPanel as="article" strength="normal" className="financialSummaryCard financialOperationsCard">
              <span className="financialSummaryIcon"><Boxes aria-hidden="true" /></span>
              <div className="financialOperationContent">
                <span>عدد عمليات الذكاء الاصطناعي</span><strong>{number.format(summary.aiOperationTotal)}</strong>
                <dl>
                  <div><dt>صور</dt><dd>{summary.aiOperations.images}</dd></div><div><dt>تعديلات</dt><dd>{summary.aiOperations.edits}</dd></div>
                  <div><dt>فيديو</dt><dd>{summary.aiOperations.videos}</dd></div><div><dt>3D</dt><dd>{summary.aiOperations.threeD}</dd></div>
                  <div><dt>تحليل</dt><dd>{summary.aiOperations.analysis}</dd></div><div><dt>Prompt</dt><dd>{summary.aiOperations.prompts}</dd></div>
                </dl>
              </div>
            </DkGlassPanel>
            <DkGlassPanel as="article" strength="normal" className="financialSummaryCard financialBudgetCard">
              <span className="financialSummaryIcon"><WalletCards aria-hidden="true" /></span>
              <div><span>الرصيد الداخلي</span><strong>{usd.format(summary.remainingInternalBudgetUsd)}</strong><small>الحالي: {usd.format(summary.internalBudgetLimitUsd)} · المستخدم: {usd.format(summary.openAICostUsd)}</small></div>
            </DkGlassPanel>
          </section>

          <DkGlassPanel as="section" strength="normal" className="financialPanel financialChartsPanel">
            <header><div><h2>الاتجاهات الشهرية</h2><p>مقارنة آخر ستة أشهر من بيانات التطوير.</p></div></header>
            <div className="financialChartsGrid">
              <FinancialBarChart title="المبيعات الشهرية" points={monthly} metric="salesEur" formatValue={euro.format} tone="blue" />
              <FinancialBarChart title="ربح المنصة الشهري" points={monthly} metric="platformProfitEur" formatValue={euro.format} tone="green" />
              <FinancialBarChart title="تكلفة OpenAI الشهرية" points={monthly} metric="openAICostUsd" formatValue={usd.format} tone="purple" />
              <FinancialBarChart title="توفير Echo الشهري" points={monthly} metric="echoSavingsUsd" formatValue={usd.format} tone="amber" />
              <FinancialBarChart title="صافي الربح الشهري" points={monthly} metric="netProfitEur" formatValue={euro.format} tone="navy" />
            </div>
          </DkGlassPanel>

          <DkGlassPanel as="section" strength="normal" className="financialPanel">
            <header><div><h2>آخر العمليات المالية</h2><p>المبيعات والعمولات وتكلفة الذكاء لكل عملية محلية.</p></div><ReceiptText aria-hidden="true" /></header>
            <div className="financialTableScroll"><table>
              <thead><tr>{["التاريخ", "المشارك", "المنتج", "الطلب", "المبيعات", "عمولة المنصة", "تكلفة OpenAI", "توفير Echo", "صافي الربح", "رقم الفاتورة", "الحالة"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
              <tbody>{financialRows.map((row) => <tr key={row.id}>
                <td><time dateTime={row.date}>{new Date(row.date).toLocaleDateString("ar-DE")}</time></td><td>{row.participantName}</td><td>{row.productName}</td><td><code>{row.orderId}</code></td>
                <td>{euro.format(row.saleAmountEur)}</td><td>{euro.format(row.platformCommissionEur)}</td><td>{usd.format(row.actualAICostUsd)}</td>
                <td>{usd.format(Math.max(0, row.originalAICostUsd - row.actualAICostUsd))}</td><td>{euro.format(row.netProfitEur)}</td><td>{row.invoiceNumber}</td>
                <td><span className={`financialStatus financialStatus--${row.status}`}>{statusLabels[row.status]}</span></td>
              </tr>)}</tbody>
            </table></div>
          </DkGlassPanel>

          <div className="financialTwoColumn">
            <DkGlassPanel as="section" strength="normal" className="financialPanel">
              <header><div><h2>المواد المستهلكة</h2><p>الاستهلاك والتكلفة والمخزون المتبقي.</p></div><Boxes aria-hidden="true" /></header>
              <div className="financialInventoryList">{localData.inventory.map((item) => <article key={item.id}>
                <strong>{item.name}</strong><dl><div><dt>المستخدم</dt><dd>{number.format(item.quantityUsed)} {item.unit}</dd></div><div><dt>التكلفة</dt><dd>{euro.format(item.estimatedCostEur)}</dd></div><div><dt>المتبقي</dt><dd>{number.format(item.remainingStock)} {item.unit}</dd></div></dl>
              </article>)}</div>
            </DkGlassPanel>

            <DkGlassPanel as="section" strength="normal" className="financialPanel">
              <header><div><h2>فواتير الشراء</h2><p>الموردون والمبالغ وحالة السداد.</p></div><ReceiptText aria-hidden="true" /></header>
              <div className="financialPurchaseList">{localData.purchaseInvoices.map((invoice) => <article key={invoice.id}>
                <div><strong>{invoice.supplier}</strong><span>{invoice.invoiceNumber} · <time dateTime={invoice.date}>{new Date(invoice.date).toLocaleDateString("ar-DE")}</time></span></div>
                <div><strong>{euro.format(invoice.amountEur)}</strong><span>{invoice.attachmentName ?? "لا يوجد مرفق"}</span><span className={`financialStatus financialStatus--${invoice.status}`}>{statusLabels[invoice.status]}</span></div>
              </article>)}</div>
            </DkGlassPanel>
          </div>

          {reportGeneratedAt && (
            <DkGlassPanel as="section" strength="strong" className="financialMonthlyReport" aria-label="التقرير الشهري" >
              <div id="monthly-financial-report">
                <header><div><h2>تقرير DekoKraft المالي الشهري</h2><p>تاريخ الإنشاء: {new Date(reportGeneratedAt).toLocaleString("ar-DE")}</p></div></header>
                <dl>
                  <div><dt>المبيعات</dt><dd>{euro.format(summary.totalSalesEur)}</dd></div><div><dt>الطلبات</dt><dd>{number.format(summary.orderCount)}</dd></div>
                  <div><dt>المشاركون</dt><dd>{number.format(summary.participantCount)}</dd></div><div><dt>المنتجات</dt><dd>{number.format(summary.productCount)}</dd></div>
                  <div><dt>عمولة المنصة</dt><dd>{euro.format(summary.platformCommissionEur)}</dd></div><div><dt>تكلفة OpenAI</dt><dd>{usd.format(summary.openAICostUsd)}</dd></div>
                  <div><dt>توفير Echo</dt><dd>{usd.format(summary.echoSavingsUsd)}</dd></div><div><dt>استهلاك المواد</dt><dd>{euro.format(materialCost)}</dd></div>
                  <div><dt>فواتير الشراء</dt><dd>{localData.purchaseInvoices.length} · {euro.format(purchaseTotal)}</dd></div><div><dt>صافي الربح</dt><dd>{euro.format(summary.netProfitEur)}</dd></div>
                </dl>
              </div>
            </DkGlassPanel>
          )}
        </div>

        <AdminFooter lang={lang} version={t("admin.version")} rights={t("admin.rights")} />
      </div>
    </main>
  );
}

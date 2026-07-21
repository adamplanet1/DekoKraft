"use client";

import {
  Activity,
  AlertTriangle,
  Bot,
  CircleDollarSign,
  ImageIcon,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import VideoBackground from "../../../src/components/VideoBackground";
import { useLanguage } from "../../components/LanguageProvider";
import { DkBrand, DkButton, DkGlassPanel } from "../../components/ui";
import { publicPath } from "../../lib/publicPath";
import type {
  AICostApiPayload,
  AICostOperation,
  AICostRecord,
  AICostRole,
  AICostStatus,
  AICostSummary,
} from "../../../lib/ai-cost/types";
import AdminFooter from "../components/layout/AdminFooter";
import StudioTopToolbar from "../components/layout/StudioTopToolbar";
import { getParticipantRegistry } from "../../../lib/participants/registry";

const emptySummary: AICostSummary = {
  totalCostUsd: 0,
  todayCostUsd: 0,
  currentMonthCostUsd: 0,
  successfulOperations: 0,
  failedOperations: 0,
  generatedImages: 0,
  averageCostPerImage: 0,
  averageCostPerOperation: 0,
  remainingInternalBudgetUsd: 100,
  internalBudgetLimitUsd: 100,
  apiStatus: "local-file",
  localOperations: 0,
  openAIOperations: 0,
  hybridOperations: 0,
};

const copy = {
  ar: {
    title: "لوحة تكلفة الذكاء الاصطناعي",
    subtitle: "تتبّع استهلاك أدوات DekoKraft الذكية وتكاليفها التقديرية ضمن الميزانية الداخلية.",
    refresh: "تحديث البيانات",
    addSample: "إضافة عملية تجريبية",
    addingSample: "جارٍ إضافة العملية...",
    retry: "إعادة المحاولة",
    loading: "جارٍ تحميل بيانات التكلفة...",
    emptyTitle: "لا توجد عمليات مسجلة بعد",
    emptyText: "ستظهر هنا عمليات الذكاء الاصطناعي بعد تسجيلها، أو أضف عملية تجريبية في بيئة التطوير.",
    errorTitle: "تعذر تحميل بيانات التكلفة",
    storageFile: "API يعمل · تخزين محلي",
    storageMemory: "API يعمل · ذاكرة مؤقتة",
    budgetTitle: "استخدام الميزانية الداخلية",
    budgetUsed: "مستخدم",
    budgetOf: "من",
    recordsTitle: "سجل استخدام الذكاء الاصطناعي",
    estimatedNote: "القيم تقديرية ومحلية ولا تمثل حد منصة OpenAI الفعلي.",
    remaining: "الرصيد الداخلي المتبقي",
    today: "تكلفة اليوم",
    month: "تكلفة هذا الشهر",
    total: "إجمالي التكلفة",
    images: "الصور المولدة",
    averageImage: "متوسط تكلفة الصورة",
    success: "العمليات الناجحة",
    failed: "العمليات الفاشلة",
    date: "التاريخ",
    user: "المستخدم",
    role: "الدور",
    product: "المنتج",
    operation: "العملية",
    model: "النموذج",
    imageCount: "عدد الصور",
    cost: "التكلفة",
    status: "الحالة",
    noValue: "—",
    localOperations: "عمليات محلية", openAIOperations: "عمليات OpenAI", hybridOperations: "عمليات هجينة", provider: "مصدر التنفيذ", allProviders: "كل المصادر", localProvider: "محلي", openAIProvider: "OpenAI", hybridProvider: "هجين", participant: "المشارك", allParticipants: "كل المشاركين", store: "المتجر",
  },
  en: {
    title: "AI Cost Dashboard",
    subtitle: "Track estimated DekoKraft AI usage against the internal development budget.",
    refresh: "Refresh data", addSample: "Add test operation", addingSample: "Adding operation...", retry: "Retry",
    loading: "Loading cost data...", emptyTitle: "No operations recorded", emptyText: "AI operations will appear here after they are recorded.", errorTitle: "Unable to load cost data",
    storageFile: "API online · local file", storageMemory: "API online · memory fallback", budgetTitle: "Internal budget usage", budgetUsed: "Used", budgetOf: "of", recordsTitle: "AI usage records", estimatedNote: "Values are local estimates and are separate from the OpenAI platform limit.",
    remaining: "Internal budget remaining", today: "Today's cost", month: "This month's cost", total: "Total cost", images: "Generated images", averageImage: "Average image cost", success: "Successful operations", failed: "Failed operations",
    date: "Date", user: "User", role: "Role", product: "Product", operation: "Operation", model: "Model", imageCount: "Images", cost: "Cost", status: "Status", noValue: "—",
    localOperations: "Local operations", openAIOperations: "OpenAI operations", hybridOperations: "Hybrid operations", provider: "Provider", allProviders: "All providers", localProvider: "Local", openAIProvider: "OpenAI", hybridProvider: "Hybrid", participant: "Participant", allParticipants: "All participants", store: "Store",
  },
  de: {
    title: "KI-Kostenübersicht",
    subtitle: "Geschätzte DekoKraft-KI-Nutzung innerhalb des internen Entwicklungsbudgets verfolgen.",
    refresh: "Daten aktualisieren", addSample: "Testvorgang hinzufügen", addingSample: "Vorgang wird hinzugefügt...", retry: "Erneut versuchen",
    loading: "Kostendaten werden geladen...", emptyTitle: "Noch keine Vorgänge", emptyText: "Erfasste KI-Vorgänge werden hier angezeigt.", errorTitle: "Kostendaten konnten nicht geladen werden",
    storageFile: "API aktiv · lokale Datei", storageMemory: "API aktiv · Arbeitsspeicher", budgetTitle: "Internes Budget", budgetUsed: "Verwendet", budgetOf: "von", recordsTitle: "KI-Nutzungsprotokoll", estimatedNote: "Lokale Schätzwerte, getrennt vom tatsächlichen OpenAI-Plattformlimit.",
    remaining: "Verbleibendes Budget", today: "Kosten heute", month: "Kosten diesen Monat", total: "Gesamtkosten", images: "Generierte Bilder", averageImage: "Durchschnitt pro Bild", success: "Erfolgreiche Vorgänge", failed: "Fehlgeschlagene Vorgänge",
    date: "Datum", user: "Benutzer", role: "Rolle", product: "Produkt", operation: "Vorgang", model: "Modell", imageCount: "Bilder", cost: "Kosten", status: "Status", noValue: "—",
    localOperations: "Lokale Vorgänge", openAIOperations: "OpenAI-Vorgänge", hybridOperations: "Hybride Vorgänge", provider: "Anbieter", allProviders: "Alle Anbieter", localProvider: "Lokal", openAIProvider: "OpenAI", hybridProvider: "Hybrid", participant: "Teilnehmer", allParticipants: "Alle Teilnehmer", store: "Shop",
  },
  fr: {
    title: "Tableau des coûts IA",
    subtitle: "Suivez la consommation IA estimée de DekoKraft dans le budget interne de développement.",
    refresh: "Actualiser", addSample: "Ajouter une opération test", addingSample: "Ajout en cours...", retry: "Réessayer",
    loading: "Chargement des coûts...", emptyTitle: "Aucune opération enregistrée", emptyText: "Les opérations IA enregistrées apparaîtront ici.", errorTitle: "Impossible de charger les coûts",
    storageFile: "API active · fichier local", storageMemory: "API active · mémoire temporaire", budgetTitle: "Utilisation du budget interne", budgetUsed: "Utilisé", budgetOf: "sur", recordsTitle: "Historique d’utilisation IA", estimatedNote: "Estimations locales distinctes de la limite réelle de la plateforme OpenAI.",
    remaining: "Budget interne restant", today: "Coût du jour", month: "Coût du mois", total: "Coût total", images: "Images générées", averageImage: "Coût moyen par image", success: "Opérations réussies", failed: "Opérations échouées",
    date: "Date", user: "Utilisateur", role: "Rôle", product: "Produit", operation: "Opération", model: "Modèle", imageCount: "Images", cost: "Coût", status: "Statut", noValue: "—",
    localOperations: "Opérations locales", openAIOperations: "Opérations OpenAI", hybridOperations: "Opérations hybrides", provider: "Fournisseur", allProviders: "Tous", localProvider: "Local", openAIProvider: "OpenAI", hybridProvider: "Hybride", participant: "Participant", allParticipants: "Tous les participants", store: "Boutique",
  },
} as const;

const operationLabels: Record<AICostOperation, Record<"ar" | "en" | "de" | "fr", string>> = {
  "image-generation": { ar: "توليد صورة", en: "Image generation", de: "Bildgenerierung", fr: "Génération d’image" },
  "image-edit": { ar: "تعديل صورة", en: "Image edit", de: "Bildbearbeitung", fr: "Modification d’image" },
  "background-removal": { ar: "إزالة الخلفية", en: "Background removal", de: "Hintergrund entfernen", fr: "Suppression d’arrière-plan" },
  "prompt-generation": { ar: "توليد التعليمات", en: "Prompt generation", de: "Prompt-Erstellung", fr: "Génération de prompt" },
  "image-analysis": { ar: "تحليل صورة", en: "Image analysis", de: "Bildanalyse", fr: "Analyse d’image" },
  "video-generation": { ar: "توليد فيديو", en: "Video generation", de: "Videogenerierung", fr: "Génération vidéo" },
  "3d-generation": { ar: "توليد ثلاثي الأبعاد", en: "3D generation", de: "3D-Generierung", fr: "Génération 3D" },
};

const statusLabels: Record<AICostStatus, Record<"ar" | "en" | "de" | "fr", string>> = {
  pending: { ar: "قيد الانتظار", en: "Pending", de: "Ausstehend", fr: "En attente" },
  success: { ar: "ناجحة", en: "Success", de: "Erfolgreich", fr: "Réussie" },
  failed: { ar: "فاشلة", en: "Failed", de: "Fehlgeschlagen", fr: "Échouée" },
  refunded: { ar: "مستردة", en: "Refunded", de: "Erstattet", fr: "Remboursée" },
  cancelled: { ar: "ملغاة", en: "Cancelled", de: "Storniert", fr: "Annulée" },
};

const roleLabels: Record<AICostRole, Record<"ar" | "en" | "de" | "fr", string>> = {
  admin: { ar: "مدير", en: "Admin", de: "Admin", fr: "Admin" },
  participant: { ar: "مشارك", en: "Participant", de: "Teilnehmer", fr: "Participant" },
  visitor: { ar: "زائر", en: "Visitor", de: "Besucher", fr: "Visiteur" },
};

async function readError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || `Request failed (${response.status}).`;
}

export default function AICostDashboard() {
  const { lang, setLang, direction, t } = useLanguage();
  const locale = lang === "ar" ? "ar" : lang === "de" ? "de" : lang === "fr" ? "fr" : "en";
  const text = copy[locale];
  const [records, setRecords] = useState<AICostRecord[]>([]);
  const [summary, setSummary] = useState<AICostSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingSample, setAddingSample] = useState(false);
  const [error, setError] = useState("");
  const [providerFilter, setProviderFilter] = useState<"all" | "local" | "openai" | "hybrid">("all");
  const [participantFilter, setParticipantFilter] = useState("all");
  const participants = useMemo(() => getParticipantRegistry(), []);
  const apiUrl = publicPath("/api/ai-cost/");

  const money = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2 }),
    [locale],
  );

  const loadData = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const requestUrl = participantFilter === "all" ? apiUrl : `${apiUrl}?participantId=${encodeURIComponent(participantFilter)}`;
      const response = await fetch(requestUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json() as AICostApiPayload;
      setRecords(data.records);
      setSummary(data.summary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : text.errorTitle);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiUrl, participantFilter, text.errorTitle]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("participantId");
    if (requested && participants.some((participant) => participant.participantId === requested)) setParticipantFilter(requested);
  }, [participants]);

  const addSample = async () => {
    setAddingSample(true);
    setError("");
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "development-admin",
          userName: "DekoKraft Admin",
          role: "admin",
          productId: "development-sample",
          productName: "AI Cost Test",
          operation: "image-edit",
          model: "development-sample",
          imageCount: 1,
          estimatedCostUsd: 0.26,
          status: "success",
          metadata: { source: "ai-cost-dashboard-test" },
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      await loadData(true);
    } catch (sampleError) {
      setError(sampleError instanceof Error ? sampleError.message : text.errorTitle);
    } finally {
      setAddingSample(false);
    }
  };

  const budgetUsed = summary.totalCostUsd;
  const budgetPercent = summary.internalBudgetLimitUsd > 0
    ? (summary.totalCostUsd / summary.internalBudgetLimitUsd) * 100
    : 0;
  const budgetState = budgetPercent >= 100 ? "critical" : budgetPercent >= 80 ? "warning" : "normal";
  const summaryCards = [
    { label: text.remaining, value: money.format(summary.remainingInternalBudgetUsd), icon: ShieldCheck },
    { label: text.today, value: money.format(summary.todayCostUsd), icon: Activity },
    { label: text.month, value: money.format(summary.currentMonthCostUsd), icon: TrendingUp },
    { label: text.total, value: money.format(summary.totalCostUsd), icon: CircleDollarSign },
    { label: text.images, value: String(summary.generatedImages), icon: ImageIcon },
    { label: text.averageImage, value: money.format(summary.averageCostPerImage), icon: Bot },
    { label: text.success, value: String(summary.successfulOperations), icon: ShieldCheck },
    { label: text.failed, value: String(summary.failedOperations), icon: AlertTriangle },
    { label: text.localOperations, value: String(summary.localOperations), icon: Activity },
    { label: text.openAIOperations, value: String(summary.openAIOperations), icon: Bot },
    { label: text.hybridOperations, value: String(summary.hybridOperations), icon: RefreshCw },
  ];
  const recordProvider = (record: AICostRecord) => record.provider
    ?? (record.metadata?.provider === "local" || record.metadata?.provider === "openai" || record.metadata?.provider === "hybrid" ? record.metadata.provider : record.model.startsWith("local-") ? "local" : "openai");
  const filteredRecords = providerFilter === "all" ? records : records.filter((record) => recordProvider(record) === providerFilter);
  const participantFor = (record: AICostRecord) => participants.find((participant) => participant.participantId === (record.participantId ?? record.sellerId));

  return (
    <main className="admin-video-page dk-studio-page adminSectionPage aiCostPage" dir={direction}>
      <VideoBackground src={publicPath("/videos/backgrounds/creator-bg.mp4")} />
      <div className="admin-video-overlay dk-video-overlay" aria-hidden="true" />
      <div className="admin-video-content dk-studio-content adminSectionPageContent aiCostPageContent">
        <StudioTopToolbar lang={lang} setLang={setLang} menuHref="/admin" settingsHref="/admin/settings" />

        <header className="aiCostHeader">
          <DkBrand
            name={t("header.brand")}
            subtitle={text.title}
            mediaSrc={publicPath("/videos/logo/logo.mp4")}
            mediaType="video"
            mediaAlt="DekoKraft"
            fallbackImageSrc={publicPath("/logo-dekokraft-600.webp")}
            href="/admin"
          />
          <div className="aiCostHeadingCopy">
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>
          <div className="aiCostHeaderActions">
            <span className={`aiCostApiBadge ${summary.apiStatus}`}>
              <span aria-hidden="true" />
              {summary.apiStatus === "local-file" ? text.storageFile : text.storageMemory}
            </span>
            <DkButton
              variant="glass"
              size="md"
              icon={<RefreshCw className={refreshing ? "isSpinning" : ""} />}
              disabled={refreshing}
              onClick={() => void loadData(true)}
            >
              {text.refresh}
            </DkButton>
            {process.env.NODE_ENV === "development" && (
              <DkButton variant="primary" size="md" disabled={addingSample} onClick={() => void addSample()}>
                {addingSample ? text.addingSample : text.addSample}
              </DkButton>
            )}
          </div>
        </header>

        <div className="aiCostDashboardBody">
          {error && (
            <div className="aiCostError" role="alert">
              <div><strong>{text.errorTitle}</strong><span>{error}</span></div>
              <DkButton variant="glass" size="sm" onClick={() => void loadData()}>{text.retry}</DkButton>
            </div>
          )}

          {loading ? (
            <div className="aiCostLoading" role="status" aria-live="polite">
              <span className="aiCostSpinner" aria-hidden="true" />
              {text.loading}
            </div>
          ) : (
            <>
              <section className="aiCostSummaryGrid" aria-label={text.title}>
                {summaryCards.map(({ label, value, icon: Icon }) => (
                  <DkGlassPanel as="article" strength="normal" className="aiCostSummaryCard" key={label}>
                    <span className="aiCostSummaryIcon"><Icon aria-hidden="true" /></span>
                    <div><span>{label}</span><strong>{value}</strong></div>
                  </DkGlassPanel>
                ))}
              </section>

              <DkGlassPanel as="section" strength="normal" className={`aiCostBudget aiCostBudget--${budgetState}`}>
                <div className="aiCostSectionTitle">
                  <div><h2>{text.budgetTitle}</h2><p>{text.estimatedNote}</p></div>
                  <strong>{Math.round(budgetPercent)}%</strong>
                </div>
                <div
                  className="aiCostBudgetTrack"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(100, Math.round(budgetPercent))}
                >
                  <span style={{ width: `${Math.min(100, budgetPercent)}%` }} />
                </div>
                <p className="aiCostBudgetValue">{text.budgetUsed}: {money.format(budgetUsed)} {text.budgetOf} {money.format(summary.internalBudgetLimitUsd)}</p>
              </DkGlassPanel>

              <DkGlassPanel as="section" strength="normal" className="aiCostRecords">
                <div className="aiCostSectionTitle"><div><h2>{text.recordsTitle}</h2><p>{text.estimatedNote}</p></div><div className="aiCostRecordsFilter"><label>{text.participant}<select value={participantFilter} onChange={(event) => setParticipantFilter(event.target.value)}><option value="all">{text.allParticipants}</option>{participants.map((participant) => <option value={participant.participantId} key={participant.participantId}>{participant.storeName ?? participant.name} · {participant.participantId}</option>)}</select></label><label>{text.provider}<select value={providerFilter} onChange={(event) => setProviderFilter(event.target.value as typeof providerFilter)}><option value="all">{text.allProviders}</option><option value="local">{text.localProvider}</option><option value="openai">{text.openAIProvider}</option><option value="hybrid">{text.hybridProvider}</option></select></label><span>{filteredRecords.length}</span></div></div>
                {filteredRecords.length === 0 ? (
                  <div className="aiCostEmpty"><Bot aria-hidden="true" /><h3>{text.emptyTitle}</h3><p>{text.emptyText}</p></div>
                ) : (
                  <div className="aiCostTableScroll">
                    <table>
                      <thead><tr>
                        {[text.date, text.participant, text.store, text.user, text.role, text.product, text.operation, text.provider, text.model, text.imageCount, text.cost, text.status].map((heading) => <th key={heading} scope="col">{heading}</th>)}
                      </tr></thead>
                      <tbody>
                        {filteredRecords.map((record) => (
                          <tr key={record.id}>
                            <td><time dateTime={record.createdAt}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.createdAt))}</time></td>
                            <td>{record.participantId ?? record.sellerId ?? text.noValue}</td>
                            <td>{participantFor(record)?.storeName ?? text.noValue}</td>
                            <td>{record.userName || record.userId}</td>
                            <td>{record.role ? roleLabels[record.role][locale] : text.noValue}</td>
                            <td>{record.productName || record.productId || text.noValue}</td>
                            <td>{operationLabels[record.operation][locale]}</td>
                            <td>{recordProvider(record) === "local" ? text.localProvider : recordProvider(record) === "hybrid" ? text.hybridProvider : text.openAIProvider}</td>
                            <td><code>{record.model}</code></td>
                            <td>{record.imageCount ?? text.noValue}</td>
                            <td>{money.format(record.actualCostUsd ?? record.estimatedCostUsd)}</td>
                            <td><span className={`aiCostStatus aiCostStatus--${record.status}`}>{statusLabels[record.status][locale]}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DkGlassPanel>
            </>
          )}
        </div>

        <AdminFooter lang={lang} version={t("admin.version")} rights={t("admin.rights")} />
      </div>
    </main>
  );
}

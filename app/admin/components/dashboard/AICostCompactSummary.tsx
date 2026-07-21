"use client";

import { AlertTriangle, Bot, Gauge, ImageIcon, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AICostApiPayload, AICostSummary } from "../../../../lib/ai-cost/types";
import { publicPath } from "../../../lib/publicPath";
import { useLanguage } from "../../../components/LanguageProvider";
import { DkButton, DkGlassPanel } from "../../../components/ui";

const copy = {
  ar: {
    title: "ملخص تكلفة الذكاء الاصطناعي",
    subtitle: "مؤشرات مباشرة من سجل تكلفة DekoKraft الحالي.",
    remaining: "الرصيد الداخلي المتبقي",
    today: "تكلفة اليوم",
    month: "تكلفة هذا الشهر",
    total: "إجمالي التكلفة",
    images: "عدد الصور المولدة",
    success: "العمليات الناجحة",
    failed: "العمليات الفاشلة",
    service: "حالة الخدمة",
    serviceReady: "تعمل · تخزين محلي",
    serviceFallback: "تعمل · ذاكرة مؤقتة",
    loading: "جاري تحميل بيانات التكلفة...",
    error: "تعذر تحميل بيانات التكلفة",
    retry: "إعادة المحاولة",
    open: "فتح لوحة التكلفة",
    used: "المستخدم من الميزانية الداخلية",
    from: "من",
  },
  en: {
    title: "AI cost summary", subtitle: "Live indicators from the current DekoKraft cost log.", remaining: "Internal balance remaining", today: "Today's cost", month: "This month's cost", total: "Total cost", images: "Generated images", success: "Successful operations", failed: "Failed operations", service: "Service status", serviceReady: "Online · local file", serviceFallback: "Online · memory fallback", loading: "Loading cost data...", error: "Unable to load cost data", retry: "Retry", open: "Open cost dashboard", used: "Used from the internal budget", from: "of",
  },
  de: {
    title: "KI-Kostenübersicht", subtitle: "Live-Kennzahlen aus dem aktuellen DekoKraft-Kostenprotokoll.", remaining: "Verbleibendes internes Guthaben", today: "Kosten heute", month: "Kosten diesen Monat", total: "Gesamtkosten", images: "Generierte Bilder", success: "Erfolgreiche Vorgänge", failed: "Fehlgeschlagene Vorgänge", service: "Dienststatus", serviceReady: "Aktiv · lokale Datei", serviceFallback: "Aktiv · Arbeitsspeicher", loading: "Kostendaten werden geladen...", error: "Kostendaten konnten nicht geladen werden", retry: "Erneut versuchen", open: "Kostenübersicht öffnen", used: "Vom internen Budget verwendet", from: "von",
  },
  fr: {
    title: "Résumé des coûts IA", subtitle: "Indicateurs directs du registre de coûts DekoKraft actuel.", remaining: "Solde interne restant", today: "Coût du jour", month: "Coût du mois", total: "Coût total", images: "Images générées", success: "Opérations réussies", failed: "Opérations échouées", service: "État du service", serviceReady: "Actif · fichier local", serviceFallback: "Actif · mémoire temporaire", loading: "Chargement des coûts...", error: "Impossible de charger les coûts", retry: "Réessayer", open: "Ouvrir le tableau des coûts", used: "Utilisé sur le budget interne", from: "sur",
  },
} as const;

async function responseError(response: Response) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return payload?.error || `AI cost request failed (${response.status}).`;
}

export default function AICostCompactSummary() {
  const { lang, direction } = useLanguage();
  const locale = lang === "ar" ? "ar" : lang === "de" ? "de" : lang === "fr" ? "fr" : "en";
  const text = copy[locale];
  const [summary, setSummary] = useState<AICostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const money = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2 }),
    [locale],
  );

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(publicPath("/api/ai-cost/"), { cache: "no-store" });
      if (!response.ok) throw new Error(await responseError(response));
      const payload = await response.json() as AICostApiPayload;
      setSummary(payload.summary);
    } catch (loadError) {
      setSummary(null);
      setError(loadError instanceof Error ? loadError.message : text.error);
    } finally {
      setLoading(false);
    }
  }, [text.error]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const percentage = summary && summary.internalBudgetLimitUsd > 0
    ? (summary.totalCostUsd / summary.internalBudgetLimitUsd) * 100
    : 0;
  const progressState = percentage >= 100 ? "critical" : percentage >= 80 ? "warning" : "normal";
  const cards = summary ? [
    { label: text.remaining, value: money.format(summary.remainingInternalBudgetUsd), icon: Gauge },
    { label: text.today, value: money.format(summary.todayCostUsd), icon: Bot },
    { label: text.month, value: money.format(summary.currentMonthCostUsd), icon: Bot },
    { label: text.total, value: money.format(summary.totalCostUsd), icon: Gauge },
    { label: text.images, value: String(summary.generatedImages), icon: ImageIcon },
    { label: text.success, value: String(summary.successfulOperations), icon: ShieldCheck },
    { label: text.failed, value: String(summary.failedOperations), icon: AlertTriangle },
    { label: text.service, value: summary.apiStatus === "local-file" ? text.serviceReady : text.serviceFallback, icon: ShieldCheck },
  ] : [];

  return (
    <DkGlassPanel as="section" strength="normal" className="adminAICostSummary" aria-label={text.title}>
      <header className="adminAICostSummary__header" dir={direction}>
        <div><h2>{text.title}</h2><p>{text.subtitle}</p></div>
        {!loading && !error && <DkButton href="/admin/ai-cost" variant="primary" size="md">{text.open}</DkButton>}
      </header>

      {loading && <div className="adminAICostSummary__state" role="status"><span className="adminAICostSummary__spinner" aria-hidden="true" />{text.loading}</div>}
      {!loading && error && <div className="adminAICostSummary__state adminAICostSummary__state--error" role="alert"><span>{text.error}</span><small>{error}</small><DkButton variant="glass" size="sm" onClick={() => void loadSummary()}>{text.retry}</DkButton></div>}
      {!loading && summary && (
        <>
          <div className="adminAICostSummary__grid">
            {cards.map(({ label, value, icon: Icon }) => <article key={label}><span className="adminAICostSummary__icon"><Icon aria-hidden="true" /></span><div><small>{label}</small><strong>{value}</strong></div></article>)}
          </div>
          <div className={`adminAICostSummary__budget adminAICostSummary__budget--${progressState}`}>
            <div><span>{text.used}</span><strong>{money.format(summary.totalCostUsd)} {text.from} {money.format(summary.internalBudgetLimitUsd)}</strong></div>
            <div className="adminAICostSummary__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(percentage))}><span style={{ width: `${Math.min(100, percentage)}%` }} /></div>
          </div>
          <DkButton href="/admin/ai-cost" variant="primary" size="md" className="adminAICostSummary__mobileAction">{text.open}</DkButton>
        </>
      )}
    </DkGlassPanel>
  );
}

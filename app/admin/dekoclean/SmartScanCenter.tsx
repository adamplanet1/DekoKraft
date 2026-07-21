"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, LoaderCircle, RotateCcw } from "lucide-react";

import type { DekoScanOverview, DekoScanProfile, DekoScanProfileId, DekoScanRun } from "../../../lib/dekoclean/scan/types";

const statusLabels: Record<DekoScanRun["status"], string> = {
  idle: "لم يبدأ", queued: "في قائمة الانتظار", running: "جارٍ الفحص", completed: "مكتمل",
  "partially-completed": "مكتمل جزئيًا", cancelled: "ملغى", failed: "فشل",
};

const scopeLabels: Record<DekoScanProfile["expectedScope"], string> = {
  "changed-files": "الملفات المتغيرة", "entire-project": "المشروع كاملًا", "security-only": "الأمان فقط",
  "ai-only": "أنظمة AI", "translations-only": "اللغات الأربع", "assets-only": "الموارد العامة",
  "participants-only": "participantId", "performance-only": "القياسات الفعلية",
};

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "تعذر تنفيذ الفحص.");
  return payload;
}

function formatDuration(duration?: number): string {
  if (duration === undefined) return "غير متاح";
  return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(1)}s`;
}

export default function SmartScanCenter({ onResultsChanged, onShowResults, onActiveStateChange }: {
  onResultsChanged: (run: DekoScanRun) => Promise<void>;
  onShowResults: (profileId: DekoScanProfileId, findingIds: string[]) => void;
  onActiveStateChange?: (active: boolean) => void;
}) {
  const [overview, setOverview] = useState<DekoScanOverview | null>(null);
  const [activeRun, setActiveRun] = useState<DekoScanRun | null>(null);
  const [pendingProfile, setPendingProfile] = useState<DekoScanProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    try {
      const next = await requestJson<DekoScanOverview>("/api/admin/dekoclean/scans");
      setOverview(next);
      setActiveRun((current) => next.activeRun ?? (current && !['queued', 'running'].includes(current.status) ? current : null));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "تعذر تحميل مركز الفحص الذكي.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadOverview(); }, [loadOverview]);
  const isRunning = Boolean(activeRun && ['queued', 'running'].includes(activeRun.status));
  useEffect(() => { onActiveStateChange?.(isRunning || Boolean(pendingProfile)); }, [isRunning, onActiveStateChange, pendingProfile]);

  useEffect(() => {
    if (!activeRun || !['queued', 'running'].includes(activeRun.status)) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await requestJson<{ run: DekoScanRun }>(`/api/admin/dekoclean/scans/${activeRun.scanId}`);
        setActiveRun(response.run);
        if (!['queued', 'running'].includes(response.run.status)) {
          window.clearInterval(timer);
          await loadOverview();
          await onResultsChanged(response.run);
        }
      } catch (pollError) { setError(pollError instanceof Error ? pollError.message : "تعذر متابعة تقدم الفحص."); }
    }, 700);
    return () => window.clearInterval(timer);
  }, [activeRun, loadOverview, onResultsChanged]);

  const runsByProfile = useMemo(() => {
    const result = new Map<DekoScanProfileId, DekoScanRun>();
    for (const run of overview?.runs ?? []) if (!result.has(run.profileId)) result.set(run.profileId, run);
    return result;
  }, [overview?.runs]);
  const latest = overview?.latestRun ?? null;

  async function executeStart(profile: DekoScanProfile) {
    setError("");
    try {
      const response = await requestJson<{ run: DekoScanRun }>("/api/admin/dekoclean/scans", { method: "POST", body: JSON.stringify({ profileId: profile.id, forceFull: profile.id === "full" }) });
      setActiveRun(response.run);
    } catch (startError) { setError(startError instanceof Error ? startError.message : "تعذر بدء الفحص."); }
  }

  function start(profile: DekoScanProfile) {
    if (["full", "security"].includes(profile.id)) { setPendingProfile(profile); return; }
    void executeStart(profile);
  }

  async function cancel() {
    if (!activeRun) return;
    try {
      const response = await requestJson<{ run: DekoScanRun }>(`/api/admin/dekoclean/scans/${activeRun.scanId}/cancel`, { method: "POST" });
      setActiveRun(response.run);
    } catch (cancelError) { setError(cancelError instanceof Error ? cancelError.message : "تعذر إلغاء الفحص."); }
  }

  return <section className="dkSmartScanCenter" aria-label="ملفات الفحص الذكي">
    <div className="dkSmartScanSummary" aria-live="polite">
      <span><small>آخر نوع فحص</small><strong>{latest ? overview?.profiles.find((profile) => profile.id === latest.profileId)?.titleAr : "غير متاح"}</strong></span>
      <span><small>آخر وقت فحص</small><strong>{latest ? new Date(latest.startedAt).toLocaleString("ar") : "غير متاح"}</strong></span>
      <span><small>حالة الفحص</small><strong>{latest ? statusLabels[latest.status] : "لم يبدأ"}</strong></span>
      <span><small>إجمالي النتائج</small><strong>{latest?.groupedFindings ?? 0}</strong></span>
      <span><small>الملفات ضمن النتائج</small><strong>{latest?.findingsFound ?? 0}</strong></span>
    </div>
    {loading && <p className="dkSmartScanState"><LoaderCircle className="is-spinning" /> جارٍ تحميل ملفات الفحص...</p>}
    {error && <p className="dkSmartScanError" role="alert">{error} <button type="button" onClick={() => void loadOverview()}>إعادة المحاولة</button></p>}

    {activeRun && <div className={`dkSmartScanProgress status-${activeRun.status}`}>
          <div><strong>{overview?.profiles.find((profile) => profile.id === activeRun.profileId)?.titleAr ?? activeRun.profileId}</strong><span>{statusLabels[activeRun.status]}</span></div>
          <p>{activeRun.phase}</p><div className="dkSmartScanProgressBar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={activeRun.progress}><i style={{ width: `${activeRun.progress}%` }} /></div>
          <dl><div><dt>الملفات المفحوصة</dt><dd>{activeRun.scannedFiles}</dd></div><div><dt>المتخطاة</dt><dd>{activeRun.skippedFiles}</dd></div><div><dt>إجمالي النتائج</dt><dd>{activeRun.groupedFindings}</dd></div><div><dt>الملفات ضمن النتائج</dt><dd>{activeRun.findingsFound}</dd></div><div><dt>الوقت</dt><dd>{formatDuration(activeRun.durationMs ?? new Date(activeRun.updatedAt).getTime() - new Date(activeRun.startedAt).getTime())}</dd></div></dl>
          {activeRun.summary && <p>{activeRun.summary}</p>}
          {activeRun.error && <p className="dkSmartScanError" role="alert">{activeRun.error}</p>}
          {['queued', 'running'].includes(activeRun.status) ? <button type="button" className="dkSmartScanCancel" onClick={() => void cancel()}>إلغاء الفحص بأمان</button> : activeRun.findingIds.length > 0 && <button type="button" className="dkSmartScanPrimary" onClick={() => onShowResults(activeRun.profileId, activeRun.findingIds)}>عرض النتائج</button>}
        </div>}
    <div className="dkSmartScanProfiles">
          {overview?.profiles.map((profile) => { const last = runsByProfile.get(profile.id); const running = activeRun?.profileId === profile.id && ['queued', 'running'].includes(activeRun.status); return <article key={profile.id} data-tone={profile.tone} className={running ? "active" : ""}>
            <header><span aria-hidden="true">{profile.icon}</span><div><h3>{profile.titleAr}</h3><small dir="ltr">{profile.titleEn}</small></div><b>{scopeLabels[profile.expectedScope]}</b></header>
            <p>{profile.descriptionAr}</p>
            <dl><div><dt>آخر فحص</dt><dd>{last ? new Date(last.startedAt).toLocaleString("ar") : "لم يُشغّل"}</dd></div><div><dt>آخر نتيجة</dt><dd>{last ? statusLabels[last.status] : "غير متاح"}</dd></div><div><dt>النتائج</dt><dd>{last?.groupedFindings ?? 0}</dd></div><div><dt>المدة</dt><dd>{formatDuration(last?.durationMs)}</dd></div></dl>
            <div>{last?.findingIds.length ? <button type="button" className="is-secondary" onClick={() => onShowResults(profile.id, last.findingIds)}>عرض النتائج</button> : null}<button type="button" className="is-primary" onClick={() => start(profile)} disabled={Boolean(activeRun && ['queued', 'running'].includes(activeRun.status))}>{last ? <RotateCcw /> : <Clock3 />}{last ? "إعادة الفحص" : "بدء الفحص"}</button></div>
          </article>; })}
    </div>
    {pendingProfile && <div className="dkSmartScanConfirmOverlay" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) setPendingProfile(null); }}>
      <section className="dkSmartScanConfirmDialog" role="alertdialog" aria-modal="true" aria-labelledby="dk-smart-scan-confirm-title" aria-describedby="dk-smart-scan-confirm-description" onKeyDown={(event) => { if (event.key === "Escape") setPendingProfile(null); }}>
        <h2 id="dk-smart-scan-confirm-title">تأكيد بدء الفحص</h2>
        <p id="dk-smart-scan-confirm-description">سيتم فحص {pendingProfile.id === "full" ? "المشروع بالكامل" : "نطاقات الأمان الحساسة"}. قد تستغرق العملية عدة دقائق حسب حجم المشروع. لن يتم تعديل أي ملف أثناء الفحص.</p>
        <div><button type="button" className="is-secondary" onClick={() => setPendingProfile(null)}>إلغاء</button><button type="button" className="is-primary" autoFocus onClick={() => { const profile = pendingProfile; setPendingProfile(null); void executeStart(profile); }}>بدء الفحص</button></div>
      </section>
    </div>}
  </section>;
}

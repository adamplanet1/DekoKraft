"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Archive, CheckCircle2, ChevronDown, Clock3, FileSearch, HardDrive, LoaderCircle, RotateCcw, ShieldAlert, ShieldCheck, Sparkles, Trash2, Upload } from "lucide-react";

import type { ParticipantCleanPreview, ParticipantCleanProfile, ParticipantFinding, ParticipantMaintenanceOperation, ParticipantMaintenanceSummary, ParticipantQuarantineRecord, ParticipantScanProfile, ParticipantScanRun } from "../../../lib/dekoclean/participant/types";

type SafeQuarantine = Omit<ParticipantQuarantineRecord, "storageReference" | "checksum" | "participantId">;
type MaintenanceData = {
  participantId: string;
  summary: ParticipantMaintenanceSummary;
  profiles: ParticipantScanProfile[];
  scans: ParticipantScanRun[];
  findings: ParticipantFinding[];
  quarantine: SafeQuarantine[];
  operations: ParticipantMaintenanceOperation[];
  cleaning: { profiles: ParticipantCleanProfile[]; latestPreview: ParticipantCleanPreview | null };
};

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "تعذر تنفيذ عملية الصيانة.");
  return payload;
}

function bytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function MaintenanceSection({ title, subtitle, icon, defaultOpen = false, children }: { title: string; subtitle: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `participant-maintenance-${title.replace(/\s+/g, "-")}`;
  return <section className={`participantMaintenanceSection ${open ? "is-open" : ""}`}><button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}><span>{icon}<span><strong>{title}</strong><small>{subtitle}</small></span></span><ChevronDown aria-hidden="true" /></button><div id={id} hidden={!open}><div>{children}</div></div></section>;
}

export default function ParticipantMaintenanceCenter({ participant, apiBase = "/api/participant/maintenance" }: { participant: { participantId: string; name: string; storeName: string }; apiBase?: string }) {
  const [data, setData] = useState<MaintenanceData | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [pendingProfile, setPendingProfile] = useState<ParticipantScanProfile | null>(null);
  const [preview, setPreview] = useState<ParticipantCleanPreview | null>(null);
  const [pendingClean, setPendingClean] = useState<ParticipantCleanPreview | null>(null);

  const load = useCallback(async () => {
    try { setData(await requestJson<MaintenanceData>(apiBase)); setError(""); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "تعذر تحميل مركز الصيانة."); }
  }, [apiBase]);
  useEffect(() => { void load(); }, [load]);
  const activeScan = data?.summary.activeScan ?? null;
  useEffect(() => {
    if (!activeScan) return;
    const timer = window.setInterval(async () => {
      try {
        const result = await requestJson<{ run: ParticipantScanRun }>(`${apiBase}/scans/${activeScan.scanId}`);
        if (!["queued", "running"].includes(result.run.status)) { window.clearInterval(timer); setMessage(result.run.status === "completed" ? "اكتمل الفحص وأصبحت النتائج جاهزة." : "توقف الفحص بأمان."); await load(); }
      } catch { window.clearInterval(timer); await load(); }
    }, 800);
    return () => window.clearInterval(timer);
  }, [activeScan, apiBase, load]);

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label); setError(""); setMessage("");
    try { await action(); await load(); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "تعذر تنفيذ العملية."); }
    finally { setBusy(""); }
  }

  async function startScan(profile: ParticipantScanProfile) {
    if (profile.confirmationRequired) { setPendingProfile(profile); return; }
    await executeScan(profile);
  }

  async function executeScan(profile: ParticipantScanProfile) {
    await run(`scan-${profile.id}`, async () => { await requestJson(`${apiBase}/scans`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId: profile.id }) }); setMessage("بدأ الفحص داخل موارد حسابك فقط."); });
  }

  async function cancelScan() {
    if (!activeScan) return;
    await run("cancel", async () => { await requestJson(`${apiBase}/scans/${activeScan.scanId}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); setMessage("طُلب إلغاء الفحص بأمان."); });
  }

  async function createCleanPreview(profile: ParticipantCleanProfile) {
    await run(`clean-${profile.id}`, async () => { const result = await requestJson<{ preview: ParticipantCleanPreview }>(`${apiBase}/clean/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profileId: profile.id }) }); setPreview(result.preview); setMessage(profile.executable ? "معاينة التنظيف جاهزة. لم يتغير أي ملف." : "معاينة التنظيف العميق جاهزة للمراجعة فقط في v1."); });
  }

  async function executeClean(cleanPreview: ParticipantCleanPreview) {
    await run("clean-execute", async () => { const result = await requestJson<{ reclaimedBytes: number }>(`${apiBase}/clean/execute`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ previewId: cleanPreview.previewId, candidateIds: cleanPreview.candidates.map((item) => item.id), confirmed: true }) }); setPreview(null); setPendingClean(null); setMessage(`اكتمل التنظيف ونُقلت العناصر إلى سلة الاسترجاع. المساحة: ${bytes(result.reclaimedBytes)}`); });
  }

  async function uploadForInspection(file: File) {
    await run("upload", async () => { const form = new FormData(); form.set("file", file); const result = await requestJson<{ quarantine: SafeQuarantine }>(`${apiBase}/intake`, { method: "POST", body: form }); setMessage(result.quarantine.status === "released" ? "اكتمل فحص الملف المختار قبل إضافته إلى مساحة العمل." : "بقي الملف في الحجر وتم إرسال الحالة للمراجعة."); });
  }

  async function requestReview(id: string) {
    await run(`review-${id}`, async () => { await requestJson(`${apiBase}/quarantine/${id}/request-review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); setMessage("تم إرسال طلب المراجعة إلى المدير."); });
  }

  const statusLabel = data?.summary.status === "containment" ? "وضع الاحتواء" : data?.summary.status === "scanning" ? "جارٍ الفحص" : data?.summary.status === "review" ? "يحتاج مراجعة" : "مستقر";
  const groupedFindings = useMemo(() => data?.findings ?? [], [data?.findings]);
  const latestScanFor = useCallback((profileId: ParticipantScanProfile["id"]) => data?.scans.find((scan) => scan.profileId === profileId), [data?.scans]);
  const scanStatus = (scan?: ParticipantScanRun) => scan?.status === "completed" ? "مكتمل" : scan?.status === "running" ? "جارٍ الفحص" : scan?.status === "queued" ? "في الانتظار" : scan?.status === "cancelled" ? "ملغى" : scan?.status === "failed" ? "فشل" : "لم يُنفذ";

  return <main className="participantMaintenance" dir="rtl">
    <header className="participantMaintenanceHero"><div><span><ShieldCheck aria-hidden="true" /> الصيانة · Maintenance</span><h1 dir="ltr">DekoClean Security &amp; Repair Center</h1><p>مركز فحص وتنظيف وصيانة مساحة المشارك.</p></div><div className={`status-${data?.summary.status ?? "stable"}`}><strong>{statusLabel}</strong><small>حالة الصيانة</small></div></header>
    <aside className="participantMaintenanceScope"><ShieldCheck aria-hidden="true" /><div><strong>نطاق آمن ومعزول</strong><p>يعمل هذا المركز داخل مساحة حسابك فقط، ولا يصل إلى ملفات النظام أو بيانات المشاركين الآخرين.</p></div></aside>
    <section className="participantMaintenanceIdentity"><span><small>المشارك</small><strong>{participant.name}</strong></span><span><small>participantId</small><strong dir="ltr">{participant.participantId}</strong></span><span><small>المتجر</small><strong>{participant.storeName}</strong></span><span><small>آخر صيانة</small><strong>{data?.summary.lastScanAt ? new Date(data.summary.lastScanAt).toLocaleString("ar") : "لم تبدأ"}</strong></span></section>
    {data?.summary.containment.active && <aside className="participantMaintenanceContainment" role="alert"><ShieldAlert /><div><strong>وضع الاحتواء نشط</strong><p>{data.summary.containment.reason} · الموارد المتأثرة: {data.summary.containment.affectedResourceCount} · مراجعة المدير: {data.summary.containment.adminReviewStatus}</p></div></aside>}
    <section className="participantMaintenanceStats"><article><Clock3 /><small>آخر فحص</small><strong>{data?.summary.lastScanAt ? new Date(data.summary.lastScanAt).toLocaleDateString("ar") : "لم يُنفذ بعد"}</strong></article><article><AlertTriangle /><small>تحتاج مراجعة</small><strong>{data?.summary.reviewCount ?? 0}</strong></article><article><Archive /><small>في الحجر المؤقت</small><strong>{data?.summary.quarantineCount ?? 0}</strong></article><article><HardDrive /><small>مساحة قابلة للتنظيف</small><strong>{data?.cleaning.latestPreview ? bytes(data.summary.cleanableBytes) : "لم تُحسب بعد"}</strong></article></section>
    {message && <p className="participantMaintenanceMessage" role="status">{message}</p>}{error && <p className="participantMaintenanceError" role="alert">{error} <button type="button" onClick={() => void load()}>إعادة المحاولة</button></p>}

    <MaintenanceSection title="الفحص الذكي" subtitle="خمسة ملفات فحص مقيدة بموارد حسابك" icon={<FileSearch />} defaultOpen>
      {activeScan && <div className="participantMaintenanceProgress"><div><strong>{data?.profiles.find((item) => item.id === activeScan.profileId)?.titleAr}</strong><span>{activeScan.progress}%</span></div><p>{activeScan.phase}</p><i><b style={{ width: `${activeScan.progress}%` }} /></i><button type="button" onClick={() => void cancelScan()} disabled={Boolean(busy)}>إلغاء الفحص بأمان</button></div>}
      <div className="participantMaintenanceProfiles">{data?.profiles.map((profile) => { const latest = latestScanFor(profile.id); const findingCount = latest ? data.findings.filter((finding) => finding.scanId === latest.scanId).length : 0; return <article key={profile.id}><span aria-hidden="true">{profile.icon}</span><h3>{profile.titleAr}</h3><small dir="ltr">{profile.titleEn}</small><p>{profile.descriptionAr}</p><dl><div><dt>آخر فحص</dt><dd>{latest?.completedAt ? new Date(latest.completedAt).toLocaleDateString("ar") : "لم يُنفذ بعد"}</dd></div><div><dt>الحالة</dt><dd>{scanStatus(latest)}</dd></div><div><dt>النتائج</dt><dd>{findingCount}</dd></div></dl><button type="button" onClick={() => void startScan(profile)} disabled={Boolean(busy) || Boolean(activeScan)}>{busy === `scan-${profile.id}` ? <LoaderCircle className="is-spinning" /> : <FileSearch />} بدء الفحص</button></article>; })}</div>
      <label className="participantMaintenanceUpload"><Upload aria-hidden="true" /><span><strong>فحص ملف من جهاز أو USB</strong><small>يتم فحص الملفات المختارة قبل إضافتها إلى مساحة العمل. لن نصل إلى أي ملف لم تختره.</small></span><input type="file" disabled={Boolean(busy)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadForInspection(file); event.target.value = ""; }} /></label>
    </MaintenanceSection>

    <MaintenanceSection title="التنظيف" subtitle="المعاينة أولًا، ولا حذف نهائي في الإصدار الأول" icon={<Sparkles />}>
      <div className="participantMaintenanceCleanProfiles">{data?.cleaning.profiles.map((profile) => <article key={profile.id}><span>{profile.icon}</span><div><h3>{profile.titleAr}</h3><small dir="ltr">{profile.titleEn}</small><p>{profile.descriptionAr}</p></div><button type="button" onClick={() => void createCleanPreview(profile)} disabled={Boolean(busy)}>{profile.executable ? "معاينة التنظيف" : "بدء المراجعة"}</button></article>)}</div>
      {preview && <article className="participantMaintenancePreview"><header><div><h3>{preview.profileId === "quick-clean" ? "معاينة التنظيف السريع" : "معاينة التنظيف العميق"}</h3><p>{preview.candidates.length} عنصر · {bytes(preview.estimatedBytes)} · لم يتغير أي مورد بعد.</p></div><span>{preview.executable ? "قابل للتنفيذ بعد التأكيد" : "معاينة فقط"}</span></header><div>{preview.candidates.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.category}</span><small>{item.reason}</small><small>{bytes(item.sizeBytes)} · المخاطر: {item.risk} · الاستعادة: {item.restoreAvailable ? "متاحة" : "غير متاحة"}</small></article>)}</div>{!preview.candidates.length && <p>لا توجد ملفات مؤقتة آمنة قابلة للتنظيف حاليًا.</p>}{preview.executable && preview.candidates.length > 0 && <button type="button" onClick={() => setPendingClean(preview)}>تأكيد ونقل إلى سلة الاسترجاع</button>}</article>}
    </MaintenanceSection>

    <MaintenanceSection title="النتائج" subtitle="ملخص آمن بأسماء الموارد دون مسارات الخادم" icon={<CheckCircle2 />}>
      <div className="participantMaintenanceFindings">{groupedFindings.map((finding) => <article key={finding.id} className={`severity-${finding.severity}`}><header><strong>{finding.title}</strong><span>{finding.severity}</span></header><p>{finding.reason}</p><small>{finding.affectedResourceIds.length} مورد · {finding.recommendedAction}</small><details><summary>عرض التفاصيل</summary><ul>{finding.affectedResourceNames.map((name) => <li key={name}>{name}</li>)}</ul></details></article>)}{!groupedFindings.length && <p>لا توجد نتائج صيانة مسجلة.</p>}</div>
    </MaintenanceSection>

    <MaintenanceSection title="الحجر المؤقت" subtitle="الملفات غير المؤكدة تبقى خارج المنتجات والتنزيلات" icon={<ShieldAlert />}>
      <div className="participantMaintenanceQuarantine">{data?.quarantine.map((item) => <article key={item.id}><header><strong>{item.displayName}</strong><span>{item.status}</span></header><p>{item.safeReason}</p><small>{bytes(item.sizeBytes)} · {item.classification}</small>{!["released", "deleted-by-admin"].includes(item.status) && <button type="button" onClick={() => void requestReview(item.id)} disabled={Boolean(item.reviewRequestedAt) || Boolean(busy)}>{item.reviewRequestedAt ? "تم طلب المراجعة" : "طلب مراجعة المدير"}</button>}</article>)}{!data?.quarantine.length && <p>لا توجد ملفات في الحجر.</p>}</div>
    </MaintenanceSection>

    <MaintenanceSection title="سجل الصيانة" subtitle="عمليات الفحص والتنظيف والمراجعة الخاصة بحسابك" icon={<RotateCcw />}>
      <div className="participantMaintenanceHistory">{data?.operations.map((operation) => <article key={operation.operationId}><CheckCircle2 /><div><strong>{operation.summary}</strong><span>{operation.type} · {operation.status}</span><small>{new Date(operation.createdAt).toLocaleString("ar")} · {operation.affectedResourceCount} مورد</small></div></article>)}{!data?.operations.length && <p>لا توجد عمليات صيانة بعد.</p>}</div>
    </MaintenanceSection>

    {pendingProfile && <div className="participantMaintenanceDialogBackdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) setPendingProfile(null); }}><section role="alertdialog" aria-modal="true" aria-labelledby="participant-scan-confirm-title"><h2 id="participant-scan-confirm-title">تأكيد بدء الفحص</h2><p>{pendingProfile.id === "full" ? "سيتم فحص جميع ملفات وموارد حسابك. لن يتم تعديل أي ملف أثناء الفحص." : "سيتم فحص الموارد المرفوعة في حسابك دون تشغيل الملفات أو تعديلها."}</p><div><button type="button" onClick={() => setPendingProfile(null)}>إلغاء</button><button type="button" autoFocus onClick={() => { const profile = pendingProfile; setPendingProfile(null); void executeScan(profile); }}>بدء الفحص</button></div></section></div>}
    {pendingClean && <div className="participantMaintenanceDialogBackdrop" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) setPendingClean(null); }}><section role="alertdialog" aria-modal="true" aria-labelledby="participant-clean-confirm-title"><h2 id="participant-clean-confirm-title">تأكيد التنظيف الآمن</h2><p>سيتم إنشاء manifest استرجاع ونقل العناصر المؤقتة المحددة إلى سلة الاسترجاع. لن تُحذف المنتجات أو السجلات المحمية.</p><div><button type="button" onClick={() => setPendingClean(null)}>إلغاء</button><button type="button" autoFocus onClick={() => void executeClean(pendingClean)}><Trash2 /> تنظيف</button></div></section></div>}
  </main>;
}

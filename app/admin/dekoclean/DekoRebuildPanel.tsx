"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArchiveRestore, CheckCircle2, DatabaseBackup, History, LoaderCircle, RotateCcw, ShieldCheck } from "lucide-react";

import type { DekoRebuildSummary, RecoveryManifest, RecoveryOperation, RecoveryPoint, RecoveryPreview } from "../../../lib/dekorebuild/types";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "تعذر تنفيذ عملية DekoRebuild.");
  return payload;
}

function bytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export default function DekoRebuildPanel({ suggestedFile, detectedProblem, onActiveStateChange }: { suggestedFile?: string; detectedProblem?: string; onActiveStateChange?: (active: boolean) => void }) {
  const [points, setPoints] = useState<RecoveryPoint[]>([]);
  const [summary, setSummary] = useState<DekoRebuildSummary | null>(null);
  const [manifest, setManifest] = useState<RecoveryManifest | null>(null);
  const [selectedPointId, setSelectedPointId] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [preview, setPreview] = useState<RecoveryPreview | null>(null);
  const [operation, setOperation] = useState<RecoveryOperation | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [protectedConfirmed, setProtectedConfirmed] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await requestJson<{ points: RecoveryPoint[]; summary: DekoRebuildSummary }>("/api/admin/dekorebuild/recovery-points");
      setPoints(result.points); setSummary(result.summary); setError("");
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "تعذر تحميل DekoRebuild."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { onActiveStateChange?.(Boolean(busy) || Boolean(operation && !["accepted", "rolled-back", "cancelled"].includes(operation.status))); }, [busy, onActiveStateChange, operation]);

  const verified = useMemo(() => points.filter((point) => point.status === "verified"), [points]);

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label); setError(""); setMessage("");
    try { await action(); await load(); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "تعذر تنفيذ عملية DekoRebuild."); }
    finally { setBusy(""); }
  }

  async function createPoint() {
    await run("create", async () => {
      const result = await requestJson<{ point: RecoveryPoint }>("/api/admin/dekorebuild/recovery-points", { method: "POST", body: JSON.stringify({ type: "manual", operationId: `manual-${Date.now()}` }) });
      setMessage(result.point.status === "verified" ? "تم إنشاء نقطة استعادة سليمة وموثقة." : "أُنشئت النقطة لكنها لم تُعتمد لأن التحقق لم ينجح بالكامل.");
    });
  }

  async function selectRecoveryPoint(point: RecoveryPoint) {
    await run("details", async () => {
      const result = await requestJson<{ manifest: RecoveryManifest }>(`/api/admin/dekorebuild/recovery-points/${point.recoveryPointId}`);
      setSelectedPointId(point.recoveryPointId); setManifest(result.manifest); setPreview(null); setOperation(null);
      const eligible = result.manifest.entries.filter((entry) => entry.restoreEligible);
      setSelectedPath(eligible.some((entry) => entry.path === suggestedFile) ? suggestedFile ?? "" : eligible[0]?.path ?? "");
    });
  }

  async function createPreview() {
    if (!selectedPointId || !selectedPath) { setError("اختر نقطة استعادة وملفًا أولًا."); return; }
    await run("preview", async () => {
      const result = await requestJson<{ preview: RecoveryPreview }>("/api/admin/dekorebuild/preview", { method: "POST", body: JSON.stringify({ recoveryPointId: selectedPointId, selectedPath, detectedProblem }) });
      setPreview(result.preview); setOperation(null); setProtectedConfirmed(false); setMessage("اكتملت معاينة الاسترجاع. لم يتغير أي ملف بعد.");
    });
  }

  async function execute() {
    if (!preview || !window.confirm("سيتم إنشاء نسخة طوارئ وحجر النسخة الحالية ثم تشغيل validation الكامل. هل تريد المتابعة؟")) return;
    await run("execute", async () => {
      const result = await requestJson<{ operation: RecoveryOperation }>("/api/admin/dekorebuild/execute", { method: "POST", body: JSON.stringify({ operationId: preview.operationId, confirmed: true, protectedConfirmation: protectedConfirmed }) });
      setOperation(result.operation); setMessage(result.operation.status === "awaiting-acceptance" ? "نجحت الاستعادة والتحقق. اختر قبول النسخة أو التراجع." : "لم ينجح التحقق الكامل. النسخة السابقة محفوظة ويمكن التراجع فورًا.");
    });
  }

  async function accept() {
    if (!operation) return;
    await run("accept", async () => { const result = await requestJson<{ operation: RecoveryOperation }>("/api/admin/dekorebuild/accept", { method: "POST", body: JSON.stringify({ operationId: operation.operationId, confirmed: true }) }); setOperation(result.operation); setMessage("تم قبول النسخة المستعادة وتسجيل نقطة ما بعد الإصلاح."); });
  }

  async function rollback() {
    if (!operation || !window.confirm("هل تريد استعادة النسخة التي سبقت عملية DekoRebuild؟")) return;
    await run("rollback", async () => { const result = await requestJson<{ operation: RecoveryOperation }>("/api/admin/dekorebuild/rollback", { method: "POST", body: JSON.stringify({ operationId: operation.operationId, confirmed: true }) }); setOperation(result.operation); setMessage("تم التراجع إلى الحالة السابقة وتشغيل التحقق مجددًا."); });
  }

  return <section className="dkRebuild" aria-labelledby="dk-rebuild-title">
    <header><div><span><DatabaseBackup aria-hidden="true" /> DekoRebuild</span><h3 id="dk-rebuild-title">نظام إعادة البناء والاسترجاع</h3><p>استعادة أصغر نطاق آمن من نقطة سليمة موثقة، مع Emergency Snapshot وRollback.</p></div><button type="button" className="is-primary" onClick={() => void createPoint()} disabled={Boolean(busy)}>{busy === "create" ? <LoaderCircle className="is-spinning" /> : <DatabaseBackup />} إنشاء نقطة استعادة</button></header>
    <div className="dkRebuildStats"><article><ShieldCheck /><small>آخر نسخة سليمة</small><strong>{summary?.latestVerified ? new Date(summary.latestVerified.createdAt).toLocaleString("ar") : "غير متاحة"}</strong></article><article><ArchiveRestore /><small>نقاط الاستعادة</small><strong>{summary?.recoveryPointCount ?? 0}</strong></article><article><DatabaseBackup /><small>مساحة التخزين</small><strong>{bytes(summary?.storageUsedBytes ?? 0)}</strong></article><article><CheckCircle2 /><small>حالة التحقق</small><strong>{summary?.verificationStatus === "verified" ? "موثقة" : "تحتاج نقطة سليمة"}</strong></article></div>
    <div className="dkRebuildActions"><button type="button" onClick={() => { const latest = verified[0]; if (latest) void selectRecoveryPoint(latest); else setError("لا توجد نقطة استعادة موثقة بعد."); }} disabled={Boolean(busy) || !verified.length}><ArchiveRestore /> معاينة الاسترجاع</button><button type="button" onClick={() => setShowHistory((value) => !value)}><History /> سجل الاسترجاع</button></div>
    {message && <p className="dkRebuildMessage" role="status">{message}</p>}{error && <p className="dkRebuildError" role="alert">{error}</p>}
    {showHistory && <div className="dkRebuildPoints">{points.length ? points.map((point) => <article key={point.recoveryPointId} className={`status-${point.status}`}><header><strong>{new Date(point.createdAt).toLocaleString("ar")}</strong><span>{point.status}</span></header><dl><div><dt>النوع</dt><dd>{point.type}</dd></div><div><dt>Health</dt><dd>{point.healthScore}%</dd></div><div><dt>Deko Index</dt><dd>{point.dekoIndex ?? "غير متاح"}</dd></div><div><dt>Lint / Build</dt><dd>{point.validation.lintPassed ? "✓" : "✕"} / {point.validation.buildPassed ? "✓" : "✕"}</dd></div><div><dt>الملفات المتغيرة</dt><dd>{point.changedFiles.length}</dd></div><div><dt>التخزين الجديد</dt><dd>{bytes(point.storageBytesAdded)}</dd></div></dl><div><button type="button" onClick={() => void selectRecoveryPoint(point)} disabled={point.status !== "verified" || Boolean(busy)}>عرض التفاصيل واستخدامها</button></div></article>) : <p>لا توجد نقاط استعادة بعد.</p>}</div>}
    {manifest && <div className="dkRebuildPreviewBuilder"><label>نقطة الاستعادة<select value={selectedPointId} onChange={(event) => { const point = points.find((item) => item.recoveryPointId === event.target.value); if (point) void selectRecoveryPoint(point); }}>{verified.map((point) => <option key={point.recoveryPointId} value={point.recoveryPointId}>{new Date(point.createdAt).toLocaleString("ar")} · {point.type}</option>)}</select></label><label>الملف المؤهل<select dir="ltr" value={selectedPath} onChange={(event) => setSelectedPath(event.target.value)}>{manifest.entries.filter((entry) => entry.restoreEligible).map((entry) => <option key={entry.path} value={entry.path}>{entry.path}{entry.protected ? " · protected" : ""}</option>)}</select></label><button type="button" className="is-primary" onClick={() => void createPreview()} disabled={Boolean(busy)}>إنشاء معاينة الاسترجاع</button></div>}
    {preview && <article className="dkRebuildPreview"><header><div><h4>معاينة الاسترجاع</h4><p>{preview.detectedProblem}</p></div><span className={`severity-${preview.risk}`}>{preview.risk}</span></header><dl><div><dt>النطاق</dt><dd>{preview.scope.level} · {preview.scope.affectedFiles.join("، ")}</dd></div><div><dt>ما سيُستعاد</dt><dd>{preview.filesToRestore.join("، ") || "لا شيء"}</dd></div><div><dt>ما سيُنقل للحجر</dt><dd>{preview.filesToDelete.join("، ") || preview.scope.affectedFiles.join("، ")}</dd></div><div><dt>ما لن يتغير</dt><dd>{preview.scope.relatedFiles.length} ملف مرتبط</dd></div><div><dt>الثقة</dt><dd>{Math.round(preview.confidence * 100)}%</dd></div><div><dt>Rollback</dt><dd>متاح</dd></div></dl><p>{preview.diffSummary}</p>{preview.requiresProtectedConfirmation && <label className="dkRebuildProtected"><input type="checkbox" checked={protectedConfirmed} onChange={(event) => setProtectedConfirmed(event.target.checked)} /> أؤكد استعادة الملف المحمي بعد مراجعة النطاق</label>}<div className="dkRebuildActions"><button type="button" className="is-primary" onClick={() => void execute()} disabled={Boolean(busy) || (preview.requiresProtectedConfirmation && !protectedConfirmed)}>{busy === "execute" ? <LoaderCircle className="is-spinning" /> : <ArchiveRestore />} تنفيذ استعادة الملف</button></div></article>}
    {operation && <article className={`dkRebuildOperation status-${operation.status}`}><strong>حالة العملية: {operation.status}</strong><span>Emergency Point: {operation.emergencyRecoveryPointId ?? "لم يُنشأ"}</span>{operation.error && <p>{operation.error}</p>}<div className="dkRebuildActions">{operation.status === "awaiting-acceptance" && <button type="button" className="is-primary" onClick={() => void accept()} disabled={Boolean(busy)}><CheckCircle2 /> قبول النسخة المستعادة</button>}{operation.rollbackAvailable && !["accepted", "rolled-back"].includes(operation.status) && <button type="button" onClick={() => void rollback()} disabled={Boolean(busy)}><RotateCcw /> التراجع إلى الحالة السابقة</button>}</div></article>}
  </section>;
}

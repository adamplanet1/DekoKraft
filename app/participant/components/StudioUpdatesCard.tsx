"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudUpload, ExternalLink, RefreshCw } from "lucide-react";
import { DkButton } from "../../components/ui";

type Status = { configured: boolean; status: "unavailable" | "queued" | "in_progress" | "success" | "failure"; startedAt?: string; completedAt?: string; version?: string };
const labels: Record<Status["status"], string> = { unavailable: "ربط GitHub غير مكتمل", queued: "في قائمة الانتظار", in_progress: "جاري البناء والنشر", success: "تم نشر التحديث", failure: "فشل التحديث" };

export default function StudioUpdatesCard({ viewerRole }: { viewerRole: "participant" | "admin" }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const statusUrl = viewerRole === "admin" ? "/api/admin/studio-deployment" : "/api/participant/studio-update/status";
  const refresh = useCallback(async () => {
    setError("");
    const response = await fetch(statusUrl, { cache: "no-store" });
    const body = await response.json() as Status & { error?: string };
    if (!response.ok) throw new Error(body.error ?? "تعذر تحميل حالة النشر.");
    setStatus(body);
  }, [statusUrl]);
  useEffect(() => { void refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "تعذر تحميل حالة النشر.")); }, [refresh]);
  async function deploy() {
    if (!window.confirm("هل تريد بدء بناء ونشر الإصدار الحالي من الاستوديو؟")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/studio-deployment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmed: true }) });
      const body = await response.json() as Status & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "تعذر بدء النشر.");
      setStatus(body);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر بدء النشر."); }
    finally { setBusy(false); }
  }
  return <section className="participantSecurityCard" aria-labelledby="studio-updates-title"><header><CloudUpload aria-hidden="true" /><div><h3 id="studio-updates-title">تحديثات الاستوديو</h3><p>الوصول إلى الاستوديو وحالة النسخة المنشورة دون منح صلاحية GitHub.</p></div></header><div><DkButton href="/studio" aria-label="فتح الاستوديو" icon={<ExternalLink />}>فتح الاستوديو</DkButton><button type="button" onClick={() => void refresh().catch((cause) => setError(cause instanceof Error ? cause.message : "تعذر تحميل الحالة."))}><RefreshCw aria-hidden="true" />حالة تحديث الاستوديو</button>{viewerRole === "admin" && <button type="button" onClick={() => void deploy()} disabled={busy || !status?.configured}><CloudUpload aria-hidden="true" />نشر تحديث الاستوديو</button>}</div>{status && <dl className="participantStudioUpdateStatus"><div><dt>حالة النشر</dt><dd>{labels[status.status]}</dd></div><div><dt>آخر تحديث منشور</dt><dd>{status.completedAt ?? "غير متاح"}</dd></div><div><dt>وقت بدء النشر</dt><dd>{status.startedAt ?? "غير متاح"}</dd></div><div><dt>وقت اكتمال النشر</dt><dd>{status.completedAt ?? "غير متاح"}</dd></div>{status.version && <div><dt>الإصدار</dt><dd dir="ltr">{status.version}</dd></div>}</dl>}{status && !status.configured && <p role="status">ربط GitHub غير مكتمل</p>}{error && <p role="alert">{error}</p>}</section>;
}

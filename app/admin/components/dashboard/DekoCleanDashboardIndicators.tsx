"use client";

import { useEffect, useState } from "react";
import type { DekoCleanSummary, HealthScore } from "../../../../lib/dekoclean/types";
import type { MissionControlAnalytics } from "../../../../lib/dekoclean/missionControlTypes";

const statusLabels: Record<DekoCleanSummary["status"], string> = {
  stable: "مستقر", review: "يحتاج مراجعة", warning: "تحذير", danger: "خطر", scanning: "جارٍ الفحص",
};

export default function DekoCleanDashboardIndicators() {
  const [summary, setSummary] = useState<DekoCleanSummary | null>(null);
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [mission, setMission] = useState<MissionControlAnalytics | null>(null);
  useEffect(() => {
    let active = true;
    void fetch("/api/admin/dekoclean/findings", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("summary unavailable")))
      .then((data: { summary?: DekoCleanSummary; health?: HealthScore; missionControl?: MissionControlAnalytics }) => { if (active) { if (data.summary) setSummary(data.summary); if (data.health) setHealth(data.health); if (data.missionControl) setMission(data.missionControl); } })
      .catch(() => { if (active) { setSummary(null); setHealth(null); setMission(null); } });
    return () => { active = false; };
  }, []);

  return (
    <span className="dkCleanCardIndicators" aria-label="ملخص DekoClean">
      <span>{summary ? statusLabels[summary.status] : "لا توجد بيانات فحص"}</span>
      <span>Deko Index: {mission?.snapshot.score == null ? "غير متاح" : `${mission.snapshot.score}%${mission.snapshot.isProvisional ? " مؤقت" : ""}`}</span>
      <span>صحة المشروع: {health?.value ?? 0}%</span>
      <span>الأداء: {mission?.snapshot.domains.find((domain) => domain.key === "performance")?.score ?? "غير متاح"}</span>
      <span>الأمان: {mission?.snapshot.domains.find((domain) => domain.key === "security")?.status ?? "غير متاح"}</span>
      <span>الرادار: {summary?.radarAlerts ?? 0}</span>
      <span>حرج: {summary?.criticalAlerts ?? 0}</span>
      <span>المراجعة: {summary?.reviewItems ?? 0}</span>
      <span>الحجر: {summary?.quarantinedFiles ?? 0}</span>
      <span>آخر فحص: {summary?.lastScanAt ? new Date(summary.lastScanAt).toLocaleDateString("ar") : "—"}</span>
    </span>
  );
}

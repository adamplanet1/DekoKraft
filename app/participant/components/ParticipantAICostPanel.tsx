"use client";

import { useEffect, useState } from "react";
import type { AICostApiPayload } from "../../../lib/ai-cost/types";
import { DkGlassPanel } from "../../components/ui";

export default function ParticipantAICostPanel() {
  const [data, setData] = useState<AICostApiPayload | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/ai-cost", { cache: "no-store" }).then(async (response) => { const body = await response.json() as AICostApiPayload & { error?: string }; if (!response.ok) throw new Error(body.error); setData(body); }).catch((cause) => setError(cause instanceof Error ? cause.message : "تعذر تحميل التكلفة.")); }, []);
  return <DkGlassPanel as="section" className="participantInventory__panel"><h2>تكلفة الذكاء الاصطناعي</h2>{error && <p role="alert">{error}</p>}{data && <><div className="participantInventory__grid"><article><strong>تكلفة الشهر</strong><span>${data.summary.currentMonthCostUsd.toFixed(4)}</span></article><article><strong>إجمالي العمليات</strong><span>{data.records.length}</span></article><article><strong>العمليات الناجحة</strong><span>{data.summary.successfulOperations}</span></article></div><div className="participantInventory__movements">{data.records.map((record) => <article key={record.id}><strong>{record.operation}</strong><span>{record.productId ?? "—"}</span><span>${(record.actualCostUsd ?? record.estimatedCostUsd).toFixed(4)}</span><time>{new Date(record.createdAt).toLocaleDateString("ar")}</time></article>)}</div></>}</DkGlassPanel>;
}


import { createHash } from "node:crypto";
import type { UIElementKind, UIInspectionSummary, UIInspectorRecord } from "./uiInspectorTypes.ts";

function isConnected(record: UIInspectorRecord): boolean {
  if (record.status === "disabled" || record.status === "informational") return true;
  if (record.expectedAction === "none") return false;
  if (["navigate", "open-details", "select", "toggle"].includes(record.expectedAction)) return record.connected === true && Boolean(record.target?.trim());
  return record.connected === true;
}
export function inspectUIRegistry(records: UIInspectorRecord[]): UIInspectorRecord[] {
  const unique = new Map<string, UIInspectorRecord>();
  for (const record of records) if (!unique.has(record.id)) unique.set(record.id, isConnected(record) ? record : { ...record, status: "unconnected", reason: record.reason ?? "العنصر تفاعلي لكنه لا يملك إجراءً أو وجهة صالحة." });
  return [...unique.values()].sort((a, b) => a.id.localeCompare(b.id));
}
export function summarizeUIInspection(records: UIInspectorRecord[]): UIInspectionSummary {
  const inspected = inspectUIRegistry(records); const count = (status: UIInspectorRecord["status"]) => inspected.filter((record) => record.status === status).length;
  const working = count("working"), unconnected = count("unconnected"), disabled = count("disabled"), informational = count("informational"), unknown = count("unknown");
  const actionable = Math.max(1, inspected.length - informational - disabled);
  return { total: inspected.length, working, unconnected, disabled, informational, unknown, healthPercent: Math.round((working / actionable) * 100), lastCheckedAt: inspected.map((record) => record.lastCheckedAt).sort().at(-1) };
}
export function groupUIRecordsByKind(records: UIInspectorRecord[]): Record<UIElementKind, UIInspectorRecord[]> { const inspected = inspectUIRegistry(records); return { button: inspected.filter((r) => r.kind === "button"), card: inspected.filter((r) => r.kind === "card"), link: inspected.filter((r) => r.kind === "link"), tab: inspected.filter((r) => r.kind === "tab"), control: inspected.filter((r) => r.kind === "control") }; }
export function getUnconnectedUIRecords(records: UIInspectorRecord[]): UIInspectorRecord[] { return inspectUIRegistry(records).filter((record) => record.status === "unconnected"); }
export function uiInspectorFindingId(record: UIInspectorRecord): string { return `ui-inspector-${createHash("sha256").update([record.id, record.kind, record.expectedAction].join("::")).digest("hex").slice(0, 16)}`; }

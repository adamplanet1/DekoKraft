import type { DekoBrainEventRecord, DekoBrainEventType } from "../../types/dekobrain";

const STORAGE_KEY = "dekokraft:dekobrain:event-log";
const MAX_RECORDS = 100;

export function logDekoBrainEvent(
  type: DekoBrainEventType,
  details: Pick<DekoBrainEventRecord, "mediaId" | "filename" | "designType" | "textLength" | "backgroundMode"> = {}
) {
  if (typeof window === "undefined") return;
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as DekoBrainEventRecord[];
    const record: DekoBrainEventRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      ...details,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([record, ...current].slice(0, MAX_RECORDS)));
  } catch {
    // Logging must never block the local media workflow.
  }
}

export function readDekoBrainEventLog(): DekoBrainEventRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as DekoBrainEventRecord[];
  } catch {
    return [];
  }
}

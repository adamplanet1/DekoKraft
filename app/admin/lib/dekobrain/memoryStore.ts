import type { DekoBrainMemoryRecord } from "../../types/dekobrainMemory";

const DB_NAME = "dekokraft-dekobrain";
const STORE = "media-memory";
const MAX_RECORDS = 300;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("fingerprint", "fingerprint", { unique: true });
      store.createIndex("similarityKey", "similarityKey");
      store.createIndex("lastUsedAt", "lastUsedAt");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("memory-open-failed"));
  });
}

async function request<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const operation = action(transaction.objectStore(STORE));
    operation.onsuccess = () => resolve(operation.result);
    operation.onerror = () => reject(operation.error);
    transaction.oncomplete = () => db.close();
  });
}

export const getMemoryRecord = (id: string) => request<DekoBrainMemoryRecord | undefined>("readonly", (store) => store.get(id));
export const findByFingerprint = (fingerprint: string) => request<DekoBrainMemoryRecord | undefined>("readonly", (store) => store.index("fingerprint").get(fingerprint));
export const findRelatedRecords = (key: string) => request<DekoBrainMemoryRecord[]>("readonly", (store) => store.index("similarityKey").getAll(key));

export async function listRecentMemoryRecords(limit = 300) {
  const records = await request<DekoBrainMemoryRecord[]>("readonly", (store) => store.getAll());
  return records.sort((a, b) => b.lastUsedAt.localeCompare(a.lastUsedAt)).slice(0, limit);
}

export async function saveMemoryRecord(record: DekoBrainMemoryRecord) {
  await request("readwrite", (store) => store.put(record));
  const records = await listRecentMemoryRecords(1000);
  await Promise.all(records.slice(MAX_RECORDS).map((item) => deleteMemoryRecord(item.id)));
  return record;
}

export async function updateMemoryRecord(id: string, patch: Partial<DekoBrainMemoryRecord>) {
  const record = await getMemoryRecord(id);
  if (!record) return undefined;
  const updated = { ...record, ...patch, id, updatedAt: new Date().toISOString() };
  await saveMemoryRecord(updated);
  return updated;
}

export const deleteMemoryRecord = (id: string) => request("readwrite", (store) => store.delete(id));
export const clearMemory = () => request("readwrite", (store) => store.clear());
export const touchMemoryRecord = (id: string) => updateMemoryRecord(id, { lastUsedAt: new Date().toISOString() });
export async function exportMemoryMetadata() { return JSON.stringify({ version: 1, records: await listRecentMemoryRecords() }, null, 2); }

function isRecord(value: unknown): value is DekoBrainMemoryRecord {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DekoBrainMemoryRecord>;
  const categories = ["candles","packaging","gifts","children","decoration","services","gypsum-decor","other"];
  const verdicts = ["ready","readyWithImprovements","reviewRequired","notReady"];
  const backgrounds = ["original","white","transparent","blur","remove"];
  const compatibility = ["compatible","needsReview","incompatible","unknown"];
  return typeof item.id === "string" && typeof item.fingerprint === "string" && /^[a-f0-9]{64}$/.test(item.fingerprint)
    && typeof item.similarityKey === "string" && typeof item.originalFileName === "string" && typeof item.normalizedFileName === "string"
    && typeof item.mimeType === "string" && typeof item.originalSizeBytes === "number" && typeof item.width === "number" && typeof item.height === "number"
    && typeof item.aspectRatio === "number" && typeof item.megapixels === "number" && categories.includes(item.category ?? "")
    && typeof item.categoryConfirmed === "boolean" && compatibility.includes(item.compatibilityStatus ?? "")
    && verdicts.includes(item.advisorVerdict ?? "") && typeof item.advisorScore === "number" && backgrounds.includes(item.backgroundMode ?? "")
    && typeof item.convertedToWebP === "boolean" && Array.isArray(item.recommendedUses) && item.recommendedUses.every(use => typeof use === "string")
    && typeof item.duplicateDetections === "number" && typeof item.createdAt === "string" && typeof item.updatedAt === "string"
    && typeof item.lastUsedAt === "string" && item.analysisVersion === 1;
}

export async function importMemoryMetadata(json: string) {
  const parsed: unknown = JSON.parse(json);
  const records = typeof parsed === "object" && parsed && Array.isArray((parsed as { records?: unknown }).records) ? (parsed as { records: unknown[] }).records : null;
  if (!records || !records.every(isRecord)) throw new Error("invalid-memory-file");
  let imported = 0, updated = 0;
  for (const incoming of records) {
    // Reconstruct the object explicitly so unknown fields (including binary-like payloads)
    // can never be persisted through an imported file.
    const clean: DekoBrainMemoryRecord = {
      id: incoming.id, fingerprint: incoming.fingerprint, similarityKey: incoming.similarityKey,
      originalFileName: incoming.originalFileName, normalizedFileName: incoming.normalizedFileName,
      mimeType: incoming.mimeType, originalSizeBytes: incoming.originalSizeBytes, width: incoming.width,
      height: incoming.height, aspectRatio: incoming.aspectRatio, megapixels: incoming.megapixels,
      category: incoming.category, categoryConfirmed: incoming.categoryConfirmed,
      compatibilityStatus: incoming.compatibilityStatus, compatibilityOverride: incoming.compatibilityOverride,
      advisorVerdict: incoming.advisorVerdict, advisorScore: incoming.advisorScore,
      backgroundMode: incoming.backgroundMode, convertedToWebP: incoming.convertedToWebP,
      backgroundProcessingStatus: incoming.backgroundProcessingStatus,
      backgroundThreshold: incoming.backgroundThreshold, backgroundSoftness: incoming.backgroundSoftness,
      backgroundProtection: incoming.backgroundProtection, backgroundProcessedAt: incoming.backgroundProcessedAt,
      backgroundOutputMimeType: incoming.backgroundOutputMimeType,
      compositionBackgroundType: incoming.compositionBackgroundType,
      compositionSettings: incoming.compositionSettings,
      compositionApproved: incoming.compositionApproved,
      webpQuality: incoming.webpQuality, convertedSizeBytes: incoming.convertedSizeBytes,
      recommendedUses: [...incoming.recommendedUses], duplicateDetections: incoming.duplicateDetections,
      createdAt: incoming.createdAt, updatedAt: incoming.updatedAt, lastUsedAt: incoming.lastUsedAt,
      analysisVersion: incoming.analysisVersion,
    };
    const existing = await findByFingerprint(clean.fingerprint) ?? await getMemoryRecord(clean.id);
    if (existing) { await saveMemoryRecord({ ...existing, ...clean, id: existing.id, createdAt: existing.createdAt }); updated++; }
    else { await saveMemoryRecord(clean); imported++; }
  }
  return { imported, updated };
}

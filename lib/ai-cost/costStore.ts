import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  AICostApiStatus,
  AICostRecord,
  AICostRecordPatch,
  AICostSummary,
} from "./types";

const INTERNAL_BUDGET_LIMIT_USD = 100;
const dataDirectory = path.join(process.cwd(), "data");
const recordsFile = path.join(dataDirectory, "ai-cost-records.json");

let memoryRecords: AICostRecord[] = [];
let storageStatus: AICostApiStatus = "local-file";
let writeQueue: Promise<void> = Promise.resolve();

function normalizeMoney(value: number) {
  return Number(value.toFixed(6));
}

function recordCost(record: AICostRecord) {
  if (record.status === "refunded" || record.status === "cancelled") return 0;
  return record.actualCostUsd ?? record.estimatedCostUsd;
}

function isAICostRecord(value: unknown): value is AICostRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<AICostRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.userId === "string" &&
    typeof record.operation === "string" &&
    typeof record.model === "string" &&
    typeof record.estimatedCostUsd === "number" &&
    typeof record.status === "string"
  );
}

async function ensureStorageFile() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(recordsFile, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") throw error;
    await writeFile(recordsFile, "[]\n", { encoding: "utf8", flag: "wx" }).catch(
      (writeError: unknown) => {
        const writeCode = writeError instanceof Error && "code" in writeError
          ? String(writeError.code)
          : "";
        if (writeCode !== "EEXIST") throw writeError;
      },
    );
  }
}

async function readRecordsFromFile() {
  await ensureStorageFile();
  const raw = await readFile(recordsFile, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("AI cost data file must contain an array.");
  return parsed.filter(isAICostRecord);
}

async function readRecords() {
  if (storageStatus === "memory-fallback") return [...memoryRecords];
  try {
    const records = await readRecordsFromFile();
    memoryRecords = records;
    return records;
  } catch (error) {
    storageStatus = "memory-fallback";
    console.error("[AI Cost] Local file storage unavailable; using in-memory fallback.", error);
    return [...memoryRecords];
  }
}

async function persistRecords(records: AICostRecord[]) {
  memoryRecords = [...records];
  if (storageStatus === "memory-fallback") return;

  try {
    await ensureStorageFile();
    const temporaryFile = `${recordsFile}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(records, null, 2)}\n`, "utf8");
    await rename(temporaryFile, recordsFile);
  } catch (error) {
    storageStatus = "memory-fallback";
    console.error("[AI Cost] Failed to persist records; continuing in memory.", error);
  }
}

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task, task);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

export async function listAICostRecords() {
  const records = await readRecords();
  return records.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function addAICostRecord(record: AICostRecord) {
  return enqueueWrite(async () => {
    const records = await readRecords();
    const existing = records.find((item) => (record.requestId && item.requestId === record.requestId) || (record.executionId && item.executionId === record.executionId && item.provider === record.provider));
    if (existing) return existing;
    records.push(record);
    await persistRecords(records);
    return record;
  });
}

export async function updateAICostRecord(id: string, patch: AICostRecordPatch) {
  return enqueueWrite(async () => {
    const records = await readRecords();
    const index = records.findIndex((record) => record.id === id);
    if (index < 0) return null;
    const updated = { ...records[index], ...patch };
    records[index] = updated;
    await persistRecords(records);
    return updated;
  });
}

export async function getAICostSummary(participantId?: string): Promise<AICostSummary> {
  const allRecords = await readRecords();
  const records = participantId ? allRecords.filter((record) => (record.participantId ?? record.sellerId) === participantId) : allRecords;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const totalCostUsd = records.reduce((total, record) => total + recordCost(record), 0);
  const todayCostUsd = records.reduce(
    (total, record) => total + (record.createdAt.slice(0, 10) === today ? recordCost(record) : 0),
    0,
  );
  const currentMonthCostUsd = records.reduce(
    (total, record) => total + (record.createdAt.slice(0, 7) === currentMonth ? recordCost(record) : 0),
    0,
  );
  const successfulRecords = records.filter((record) => record.status === "success");
  const generatedImages = successfulRecords.reduce(
    (total, record) => total + (record.imageCount ?? 0),
    0,
  );
  const imageCost = successfulRecords.reduce(
    (total, record) => total + ((record.imageCount ?? 0) > 0 ? recordCost(record) : 0),
    0,
  );
  const providerFor = (record: AICostRecord) => record.provider
    ?? (record.metadata?.provider === "local" || record.metadata?.provider === "hybrid" || record.metadata?.provider === "openai"
      ? record.metadata.provider
      : record.model.startsWith("local-") ? "local" : "openai");

  return {
    totalCostUsd: normalizeMoney(totalCostUsd),
    todayCostUsd: normalizeMoney(todayCostUsd),
    currentMonthCostUsd: normalizeMoney(currentMonthCostUsd),
    successfulOperations: successfulRecords.length,
    failedOperations: records.filter((record) => record.status === "failed").length,
    generatedImages,
    averageCostPerImage: generatedImages > 0 ? normalizeMoney(imageCost / generatedImages) : 0,
    averageCostPerOperation: records.length > 0 ? normalizeMoney(totalCostUsd / records.length) : 0,
    remainingInternalBudgetUsd: normalizeMoney(
      Math.max(0, INTERNAL_BUDGET_LIMIT_USD - totalCostUsd),
    ),
    internalBudgetLimitUsd: INTERNAL_BUDGET_LIMIT_USD,
    apiStatus: storageStatus,
    localOperations: records.filter((record) => providerFor(record) === "local").length,
    openAIOperations: records.filter((record) => providerFor(record) === "openai").length,
    hybridOperations: records.filter((record) => providerFor(record) === "hybrid").length,
  };
}

export async function clearAICostRecordsForDevelopment() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("AI cost records can only be cleared in development.");
  }
  return enqueueWrite(async () => {
    await persistRecords([]);
  });
}

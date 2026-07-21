import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FinancialLedgerEntry } from "./types";

const dataDirectory = path.join(process.cwd(), "data");
const ledgerFile = path.join(dataDirectory, "financial-ledger.json");
let memoryEntries: FinancialLedgerEntry[] = [];
let useMemoryFallback = false;
let writeQueue: Promise<void> = Promise.resolve();

function isEntry(value: unknown): value is FinancialLedgerEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<FinancialLedgerEntry>;
  return typeof entry.id === "string"
    && typeof entry.createdAt === "string"
    && entry.type === "ai-consumption"
    && typeof entry.referenceId === "string"
    && typeof entry.generationId === "string"
    && typeof entry.amountUsd === "number";
}

async function ensureFile() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    await readFile(ledgerFile, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") throw error;
    await writeFile(ledgerFile, "[]\n", { encoding: "utf8", flag: "wx" }).catch((writeError: unknown) => {
      const writeCode = writeError instanceof Error && "code" in writeError ? String(writeError.code) : "";
      if (writeCode !== "EEXIST") throw writeError;
    });
  }
}

async function readEntries() {
  if (useMemoryFallback) return [...memoryEntries];
  try {
    await ensureFile();
    const parsed: unknown = JSON.parse(await readFile(ledgerFile, "utf8"));
    if (!Array.isArray(parsed)) throw new Error("Financial ledger must contain an array.");
    memoryEntries = parsed.filter(isEntry);
    return [...memoryEntries];
  } catch (error) {
    useMemoryFallback = true;
    console.error("[Financial Ledger] Local storage unavailable; using memory fallback.", error);
    return [...memoryEntries];
  }
}

async function persistEntries(entries: FinancialLedgerEntry[]) {
  memoryEntries = [...entries];
  if (useMemoryFallback) return;
  try {
    await ensureFile();
    const temporaryFile = `${ledgerFile}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
    await rename(temporaryFile, ledgerFile);
  } catch (error) {
    useMemoryFallback = true;
    console.error("[Financial Ledger] Failed to persist entries; continuing in memory.", error);
  }
}

export async function listFinancialLedgerEntries() {
  return (await readEntries()).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function addFinancialLedgerEntry(entry: FinancialLedgerEntry) {
  const task = writeQueue.then(async () => {
    const entries = await readEntries();
    const existing = entries.find((item) => item.referenceId === entry.referenceId);
    if (existing) return existing;
    entries.push(entry);
    await persistEntries(entries);
    return entry;
  });
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}


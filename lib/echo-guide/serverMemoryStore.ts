import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type { EchoGuideWorkspace } from "./types";

const memoryPath = path.join(process.cwd(), "data", "echo-guide-accepted-memory.json");

export type AcceptedEchoGuideMemoryRecord = {
  id: string;
  participantId?: string;
  productId: string;
  workspace: EchoGuideWorkspace;
  acceptedPreference: string;
  promptRecipe: string;
  correction?: string;
  model: string;
  quality?: string;
  size?: string;
  successfulSettings: Record<string, string | number | boolean>;
  accepted: true;
  acceptedAt: string;
};

async function readRecords(): Promise<AcceptedEchoGuideMemoryRecord[]> {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(memoryPath, "utf8"));
    return Array.isArray(parsed)
      ? parsed.filter((item): item is AcceptedEchoGuideMemoryRecord => Boolean(item && typeof item === "object" && (item as { accepted?: unknown }).accepted === true))
      : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[Echo Guide] Failed to read accepted memory.", error);
    }
    return [];
  }
}

export async function addAcceptedEchoGuideMemory(record: AcceptedEchoGuideMemoryRecord) {
  const records = await readRecords();
  await fs.mkdir(path.dirname(memoryPath), { recursive: true });
  await fs.writeFile(memoryPath, JSON.stringify([...records.filter((item) => item.id !== record.id), record], null, 2), "utf8");
  return record;
}

export async function findAcceptedEchoGuideMemory(participantId: string | undefined, productId: string | undefined, workspace: EchoGuideWorkspace) {
  const records = await readRecords();
  return records.filter((record) =>
    record.workspace === workspace
    && (!productId || record.productId === productId)
    && (!participantId || record.participantId === participantId));
}

import type { WorkspaceId, WorkspaceToolId } from "./workspaceTypes";
import type { DecisionPlanStep, ExecutionProvider } from "../../../lib/decision-engine/types";

export const SMART_EDIT_HISTORY_KEY = "dekokraft.smartEdit.executionHistory";

export type SmartEditHistoryStatus = "decision-ready" | "executing" | "pending-review" | "accepted" | "rejected" | "failed" | "blocked" | "cancelled";

export type SmartEditHistoryRecord = {
  generationId: string;
  executionId: string;
  recommendationId: string;
  decisionId: string;
  provider: ExecutionProvider;
  plan: DecisionPlanStep[];
  createdAt: string;
  updatedAt: string;
  workspace: WorkspaceId;
  tool: WorkspaceToolId;
  productId?: string;
  participantId?: string;
  sellerId?: string;
  operation: string;
  userInstruction: string;
  finalPrompt: string;
  model: string;
  quality?: string;
  size?: string;
  estimatedCost?: number;
  actualCost?: number;
  original: { source: string; mimeType?: string };
  generated?: { mimeType: string; reference: string };
  status: SmartEditHistoryStatus;
};

function readHistory(): SmartEditHistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(SMART_EDIT_HISTORY_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as SmartEditHistoryRecord[] : [];
  } catch (error) {
    console.error("[Smart Edit History] Failed to read history.", error);
    return [];
  }
}

function writeHistory(records: SmartEditHistoryRecord[]) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(SMART_EDIT_HISTORY_KEY, JSON.stringify(records.slice(-100)));
    window.dispatchEvent(new CustomEvent("dekokraft-smart-edit-history-change"));
    return true;
  } catch (error) {
    console.error("[Smart Edit History] Failed to persist history.", error);
    return false;
  }
}

export function recordGeneratedSmartEdit(input: Omit<SmartEditHistoryRecord, "createdAt" | "updatedAt" | "status">) {
  const timestamp = new Date().toISOString();
  const record: SmartEditHistoryRecord = {
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "pending-review",
  };
  writeHistory([...readHistory().filter((item) => item.generationId !== record.generationId), record]);
  return record;
}

export function recordDecisionSmartEdit(input: Omit<SmartEditHistoryRecord, "createdAt" | "updatedAt" | "status" | "generated" | "actualCost">, blocked: boolean) {
  const timestamp = new Date().toISOString();
  const record: SmartEditHistoryRecord = {
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: blocked ? "blocked" : "decision-ready",
  };
  writeHistory([...readHistory().filter((item) => item.executionId !== record.executionId), record]);
  if (process.env.NODE_ENV === "development") console.info("[Decision Engine] history record created", { executionId: record.executionId, status: record.status });
  return record;
}

export function recordFailedSmartEdit(input: Omit<SmartEditHistoryRecord, "createdAt" | "updatedAt" | "status" | "generated">) {
  const timestamp = new Date().toISOString();
  const record: SmartEditHistoryRecord = {
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "failed",
  };
  writeHistory([...readHistory().filter((item) => item.executionId !== record.executionId), record]);
  return record;
}

export function updateSmartEditHistoryStatus(generationId: string, status: SmartEditHistoryStatus, ownership?: { participantId?: string; productId?: string }) {
  const records = readHistory();
  const record = records.find((item) => item.generationId === generationId);
  if (!record) return false;
  if (ownership?.participantId && (record.participantId ?? record.sellerId) !== ownership.participantId) return false;
  if (ownership?.productId && record.productId !== ownership.productId) return false;
  return writeHistory(records.map((item) => item.generationId === generationId
    ? { ...item, status, updatedAt: new Date().toISOString() }
    : item));
}

export function loadSmartEditHistory() {
  return readHistory().sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

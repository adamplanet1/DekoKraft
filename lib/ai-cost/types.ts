export type AICostOperation =
  | "image-generation"
  | "image-edit"
  | "background-removal"
  | "prompt-generation"
  | "image-analysis"
  | "video-generation"
  | "3d-generation";

export type AICostStatus =
  | "pending"
  | "success"
  | "failed"
  | "refunded"
  | "cancelled";

export type AICostRole = "admin" | "participant" | "visitor";
export type AICostProvider = "local" | "openai" | "hybrid";

export interface AICostRecord {
  id: string;
  createdAt: string;
  userId: string;
  userName?: string;
  role?: AICostRole;
  productId?: string;
  productName?: string;
  participantId?: string;
  sellerId?: string;
  operation: AICostOperation;
  provider?: AICostProvider;
  workspace?: string;
  tool?: string;
  model: string;
  requestId?: string;
  executionId?: string;
  generationTimeMs?: number;
  imageCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCostUsd: number;
  actualCostUsd?: number;
  status: AICostStatus;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export type AICostRecordInput = Omit<AICostRecord, "id" | "createdAt">;

export type AICostRecordPatch = Partial<
  Pick<AICostRecord, "status" | "actualCostUsd" | "requestId" | "errorMessage">
>;

export type AICostApiStatus = "local-file" | "memory-fallback";

export interface AICostSummary {
  totalCostUsd: number;
  todayCostUsd: number;
  currentMonthCostUsd: number;
  successfulOperations: number;
  failedOperations: number;
  generatedImages: number;
  averageCostPerImage: number;
  averageCostPerOperation: number;
  remainingInternalBudgetUsd: number;
  internalBudgetLimitUsd: number;
  apiStatus: AICostApiStatus;
  localOperations: number;
  openAIOperations: number;
  hybridOperations: number;
}

export interface AICostApiPayload {
  records: AICostRecord[];
  summary: AICostSummary;
}

export const AI_COST_OPERATIONS: readonly AICostOperation[] = [
  "image-generation",
  "image-edit",
  "background-removal",
  "prompt-generation",
  "image-analysis",
  "video-generation",
  "3d-generation",
];

export const AI_COST_STATUSES: readonly AICostStatus[] = [
  "pending",
  "success",
  "failed",
  "refunded",
  "cancelled",
];

export const AI_COST_ROLES: readonly AICostRole[] = [
  "admin",
  "participant",
  "visitor",
];

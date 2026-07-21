export const EXECUTION_PROVIDERS = ["local", "openai", "hybrid", "manual-review", "blocked"] as const;
export type ExecutionProvider = (typeof EXECUTION_PROVIDERS)[number];
export type DecisionConfidence = "low" | "medium" | "high";

export type DecisionReasonCode =
  | "simple-background-removal"
  | "simple-edge-cleanup"
  | "simple-resize"
  | "simple-format-conversion"
  | "requires-generative-edit"
  | "requires-object-generation"
  | "requires-relighting"
  | "requires-scene-generation"
  | "requires-product-ad"
  | "requires-complex-restoration"
  | "unsupported-workspace"
  | "missing-image"
  | "missing-user-instruction"
  | "protected-feature-risk"
  | "low-confidence"
  | "manual-review-required";

export type DecisionPlanAction =
  | "background-removal"
  | "edge-cleanup"
  | "format-conversion"
  | "resize"
  | "image-edit"
  | "image-generation"
  | "relighting"
  | "scene-generation"
  | "product-ad"
  | "restoration";

export interface DecisionInput {
  participantId?: string;
  productId?: string;
  workspace: string;
  operation: string;
  userInstruction: string;
  currentImageId?: string;
  echoGuideRecommendationId?: string;
  finalPrompt: string;
  preserve: string[];
  avoid: string[];
  suggestedModel?: string;
  suggestedQuality?: string;
  suggestedSize?: string;
  suggestedRatio?: string;
  productDNAAvailable: boolean;
  echoMemoryAvailable: boolean;
}

export interface DecisionPlanStep {
  id: string;
  order: number;
  provider: "local" | "openai";
  action: DecisionPlanAction;
  processorId?: string;
  model?: string;
  quality?: string;
  size?: string;
  estimatedCostUsd?: number;
}

export interface DecisionResult {
  id: string;
  executionId: string;
  createdAt: string;
  provider: ExecutionProvider;
  confidence: DecisionConfidence;
  reasonCode: DecisionReasonCode;
  reasonText: string;
  requiresConfirmation: boolean;
  requiresManualReview: boolean;
  estimatedCostUsd: number;
  estimatedCostMinUsd?: number;
  estimatedCostMaxUsd?: number;
  plan: DecisionPlanStep[];
  warnings: string[];
  canExecute: boolean;
}

export function isExecutionProvider(value: unknown): value is ExecutionProvider {
  return typeof value === "string" && EXECUTION_PROVIDERS.includes(value as ExecutionProvider);
}

export const ECHO_GUIDE_WORKSPACES = [
  "image",
  "video",
  "3d",
  "laser",
  "coloring",
  "embroidery",
  "cnc",
  "printing",
  "vector",
  "audio",
] as const;

export type EchoGuideWorkspace = (typeof ECHO_GUIDE_WORKSPACES)[number];

export const ECHO_GUIDE_OPERATIONS = [
  "smart-edit",
  "image-generation",
  "image-edit",
  "background-removal",
  "edge-cleanup",
  "enhancement",
  "product-ad",
  "custom",
] as const;

export type EchoGuideOperation = (typeof ECHO_GUIDE_OPERATIONS)[number];
export type EchoGuideRiskLevel = "low" | "medium" | "high";
export type EchoGuideUiState =
  | "idle"
  | "loading-context"
  | "recommendation-ready"
  | "executing"
  | "result-ready"
  | "accepting"
  | "accepted"
  | "rejecting"
  | "rejected"
  | "error";

export interface EchoGuideProductContext {
  productId?: string;
  productName?: string;
  productType?: string;
  material?: string;
  dimensions?: string;
  protectedFeatures: string[];
  preferredBackground?: string;
  preferredLighting?: string;
  preferredRatio?: string;
  preferredQuality?: string;
}

export interface EchoGuideMemoryContext {
  acceptedPreferences: string[];
  rejectedPatterns: string[];
  successfulSettings: Record<string, string | number | boolean>;
  previousCorrections: string[];
}

export interface EchoGuideRequest {
  participantId?: string;
  productId?: string;
  workspace: EchoGuideWorkspace;
  operation: EchoGuideOperation;
  userInstruction: string;
  productContext?: EchoGuideProductContext;
  memoryContext?: EchoGuideMemoryContext;
  currentImageId?: string;
}

export interface EchoGuideRecommendation {
  id: string;
  createdAt: string;
  workspace: EchoGuideWorkspace;
  operation: EchoGuideOperation;
  interpretedGoal: string;
  finalPrompt: string;
  preserve: string[];
  changes: string[];
  avoid: string[];
  suggestedModel: string;
  suggestedQuality?: string;
  suggestedSize?: string;
  suggestedRatio?: string;
  suggestedBackground?: string;
  suggestedLighting?: string;
  estimatedCostUsd?: number;
  estimatedCostMinUsd?: number;
  estimatedCostMaxUsd?: number;
  warnings: string[];
  riskLevel: EchoGuideRiskLevel;
  requiresConfirmation: boolean;
  contextSources: {
    productDNAUsed: boolean;
    echoMemoryUsed: boolean;
    userInstructionUsed: boolean;
  };
}

export function isEchoGuideWorkspace(value: unknown): value is EchoGuideWorkspace {
  return typeof value === "string" && ECHO_GUIDE_WORKSPACES.includes(value as EchoGuideWorkspace);
}

export function isEchoGuideOperation(value: unknown): value is EchoGuideOperation {
  return typeof value === "string" && ECHO_GUIDE_OPERATIONS.includes(value as EchoGuideOperation);
}

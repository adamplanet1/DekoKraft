import type { DekoCleanSeverity } from "./types.ts";

export type DekoDomainKey = "health" | "performance" | "security" | "ai" | "memory";
export type DekoScoreStatus = "excellent" | "very-good" | "good" | "needs-attention" | "warning" | "critical" | "unavailable";
export type DekoTrend = "improving" | "stable" | "declining" | "unknown";

export interface DekoDomainFactor {
  id: string;
  label: string;
  value: number | boolean | string | null;
  impact: number;
  explanation: string;
}

export interface DekoDomainScore {
  key: DekoDomainKey;
  score: number | null;
  status: DekoScoreStatus;
  trend: DekoTrend;
  previousScore?: number | null;
  measuredAt?: string;
  sourceUpdatedAt?: string;
  contributingFactors: DekoDomainFactor[];
  unavailableReason?: string;
}

export interface DekoIndexCalculation {
  score: number | null;
  isProvisional: boolean;
  coveragePercent: number;
  missingDomains: DekoDomainKey[];
}

export interface DekoIndexSnapshot extends DekoIndexCalculation {
  status: DekoScoreStatus;
  trend: DekoTrend;
  domains: DekoDomainScore[];
  weights: Record<DekoDomainKey, number>;
  calculatedAt: string;
  dataFreshness: "fresh" | "partially-stale" | "stale" | "unavailable";
}

export type DekoIndexTrigger = "scan" | "repair" | "restore" | "recreate" | "quarantine" | "rollback" | "build" | "security-scan" | "performance-measurement" | "scheduled-snapshot";

export interface DekoIndexHistoryPoint {
  operationId: string;
  timestamp: string;
  dekoIndex: number | null;
  health: number | null;
  performance: number | null;
  security: number | null;
  ai: number | null;
  memory: number | null;
  trigger: DekoIndexTrigger;
}

export interface MissionControlRecommendation {
  findingId: string;
  problem: string;
  domain: DekoDomainKey;
  currentImpact: number;
  suggestedAction: string;
  estimatedImprovement: string | null;
  risk: DekoCleanSeverity;
}

export interface MissionControlAnalytics {
  snapshot: DekoIndexSnapshot;
  history: DekoIndexHistoryPoint[];
  findingsBySeverity: Record<DekoCleanSeverity, number>;
  maintenanceOutcomes: { successful: number; failed: number; rolledBack: number; awaitingConfirmation: number };
  insight: string[];
  recommendations: MissionControlRecommendation[];
}

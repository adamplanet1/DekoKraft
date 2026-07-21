import type { DekoCleanFinding } from "../types.ts";

export type DekoScanProfileId =
  | "quick"
  | "full"
  | "security"
  | "dekobrain"
  | "translations"
  | "assets"
  | "participants"
  | "performance";

export type DekoScanStatus =
  | "idle"
  | "queued"
  | "running"
  | "completed"
  | "partially-completed"
  | "cancelled"
  | "failed";

export type DekoScanScope =
  | "changed-files"
  | "entire-project"
  | "security-only"
  | "ai-only"
  | "translations-only"
  | "assets-only"
  | "participants-only"
  | "performance-only";

export type DekoScanDetectorId =
  | "navigation-integrity"
  | "ui-inspector"
  | "project-core"
  | "invalid-json"
  | "security"
  | "dekobrain"
  | "translations"
  | "assets"
  | "participants"
  | "performance";

export interface DekoScanProfile {
  id: DekoScanProfileId;
  icon: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  detectorIds: DekoScanDetectorId[];
  supportsIncremental: boolean;
  requiresSecurityConnector: boolean;
  expectedScope: DekoScanScope;
  tone: "blue" | "indigo" | "red" | "violet" | "cyan" | "amber" | "teal" | "green";
}

export interface DekoScanRun {
  scanId: string;
  profileId: DekoScanProfileId;
  status: DekoScanStatus;
  phase: string;
  progress: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  scannedFiles: number;
  skippedFiles: number;
  findingsFound: number;
  groupedFindings: number;
  durationMs?: number;
  error?: string;
  detectorFailures: Array<{ detectorId: DekoScanDetectorId; error: string }>;
  findingIds: string[];
  changedFiles: number;
  deletedFiles: number;
  securityConnectorAvailable?: boolean;
  performanceMeasurementsAvailable?: boolean;
  healthBefore?: number;
  healthAfter?: number;
  summary?: string;
  cancellationRequested?: boolean;
  forceFull?: boolean;
}

export interface DekoScanDetectorResult {
  findings: DekoCleanFinding[];
  scannedFiles?: number;
  skippedFiles?: number;
  securityConnectorAvailable?: boolean;
  performanceMeasurementsAvailable?: boolean;
}

export interface DekoScanOverview {
  profiles: DekoScanProfile[];
  runs: DekoScanRun[];
  latestRun: DekoScanRun | null;
  activeRun: DekoScanRun | null;
}

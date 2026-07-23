export type DekoCleanRisk = "safe" | "review" | "protected" | "unknown";

export type DekoCleanReason =
  | "temporary-file"
  | "build-output"
  | "cache-file"
  | "duplicate-content"
  | "unused-source"
  | "unused-image"
  | "orphan-json"
  | "backup-copy"
  | "large-log"
  | "generated-file"
  | "protected-business-data"
  | "dynamic-reference-risk";

export type DekoCleanRecommendation =
  | "delete"
  | "quarantine"
  | "review"
  | "keep";

export type DekoCleanSeverity = "info" | "low" | "medium" | "high" | "critical";
export type ProtectedFileChangeClassification = "authorized-project-change" | "unverified-change" | "unexpected-change" | "integrity-failure";
export type SecurityFindingReviewClassification =
  | "expected_project_change"
  | "unexpected_safe_change"
  | "suspicious_change"
  | "stale_finding"
  | "missing_file"
  | "invalid_baseline";
export interface SecurityFindingVerification {
  classification: SecurityFindingReviewClassification;
  verifiedAt: string;
  filePath: string;
  previousHash?: string;
  currentHash?: string;
  gitTracked: boolean;
  latestCommit?: string;
  reason: string;
}

export type DekoCleanAction =
  | "scan"
  | "repair"
  | "restore"
  | "recreate"
  | "quarantine"
  | "ignore"
  | "validate"
  | "rollback";

export type DekoCleanFindingType =
  | "missing-file"
  | "broken-import"
  | "broken-route"
  | "broken-asset-reference"
  | "invalid-json"
  | "duplicate-file"
  | "unused-file"
  | "unexpected-file-change"
  | "ownership-inconsistency"
  | "build-error"
  | "lint-error"
  | "security-alert"
  | "suspicious-file"
  | "integrity-mismatch"
  | "navigation-missing-handler"
  | "navigation-destination-missing"
  | "navigation-wrong-target"
  | "navigation-exact-finding-missing"
  | "navigation-required-param-missing"
  | "navigation-count-mismatch"
  | "navigation-duplicate-target-id"
  | "navigation-stale-count"
  | "navigation-label-action-mismatch"
  | "navigation-target-not-focusable"
  | "navigation-destination-content-empty"
  | "ui-unconnected"
  | "unknown";

export type FindingStatus = "OPEN" | "IN_PROGRESS" | "VALIDATING" | "RESOLVED" | "FAILED" | "IGNORED";
export type FindingLifecycleAction = "validate" | "restore" | "recreate" | "repair" | "ignore";
export interface FindingLifecycle {
  status: FindingStatus;
  lastAction?: FindingLifecycleAction;
  updatedAt: string;
  resolvedAt?: string;
  failureReason?: string;
}
export interface FindingLifecycleEvent {
  id: string;
  findingId: string;
  action: FindingLifecycleAction;
  previousStatus: FindingStatus;
  nextStatus: FindingStatus;
  startedAt: string;
  completedAt?: string;
  success: boolean;
  message?: string;
  executionLogId?: string;
}
export type EchoMemorySchemaVersion = 1;
export interface EchoEvidenceSnapshot { id: string; findingId: string; scanId?: string; capturedAt: string; evidenceHash: string; evidence: unknown; changedFromPrevious: boolean; }
export type FindingTimelineEventType = "detected" | "seen-again" | "evidence-changed" | "validate-started" | "validate-completed" | "restore-started" | "restore-completed" | "recreate-started" | "recreate-completed" | "repair-preview-created" | "repair-accepted" | "repair-started" | "repair-completed" | "repair-rolled-back" | "resolved" | "reopened" | "failed" | "ignored";
export interface FindingTimelineEvent { id: string; findingId: string; type: FindingTimelineEventType; action?: FindingLifecycleAction; statusBefore?: FindingStatus; statusAfter?: FindingStatus; startedAt: string; completedAt?: string; success?: boolean; message?: string; reason?: string; scanId?: string; evidenceHash?: string; executionLogId?: string; repairRecipeId?: string; metadata?: Record<string, unknown>; repeatCount?: number; lastRepeatedAt?: string; }

export type DekoCleanFindingCategory =
  | "integrity-issues"
  | "ownership-issues"
  | "missing-references"
  | "duplicate-components"
  | "unused-files"
  | "unused-routes"
  | "broken-imports"
  | "missing-translations"
  | "security-issues"
  | "api-inconsistencies"
  | "general"
  | "ui-inspector";

export interface DekoCleanFinding {
  id: string;
  type: DekoCleanFindingType;
  category: DekoCleanFindingCategory;
  severity: DekoCleanSeverity;
  title: string;
  description: string;
  explanation: string;
  affectedFiles: string[];
  affectedPaths: string[];
  count: number;
  evidence: string[];
  dependencies: string[];
  relatedFindingIds: string[];
  detectedBy: "dekoclean" | "dekoradar" | "security-connector" | "lint" | "build" | "integrity-check" | "ui-inspector";
  source: DekoCleanFinding["detectedBy"];
  detectedAt: string;
  recommendedAction: DekoCleanAction;
  recommendedActions: DekoCleanAction[];
  repairAvailable: boolean;
  canRollback: boolean;
  canValidate: boolean;
  requiresAdminConfirmation: boolean;
  status: "new" | "reviewing" | "approved" | "resolved" | "ignored" | "failed";
  lifecycle?: FindingLifecycle;
  findingId?: string;
  fingerprint?: string;
  detector?: string;
  scope?: string;
  normalizedTarget?: string;
  evidenceKey?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  occurrenceCount?: number;
  scanIds?: string[];
  currentEvidence?: unknown;
  evidenceHistory?: EchoEvidenceSnapshot[];
  timeline?: FindingTimelineEvent[];
  lastAction?: FindingLifecycleAction;
  lastResult?: "success" | "failed" | "still-present" | "resolved";
  failureReason?: string;
  schemaVersion?: EchoMemorySchemaVersion;
  fileHashSha256?: string;
  sourceReference?: string;
  protectedChangeClassification?: ProtectedFileChangeClassification;
  baselineApprovalStatus?: "pending-baseline-approval" | "baseline-approved";
  previousFileHashSha256?: string;
  migratedFromLegacy?: boolean;
  migrationVersion?: number;
  migrationReason?: string;
  securityVerification?: SecurityFindingVerification;
  temporaryIgnoreUntil?: string;
}

export interface DekoCleanActionPlan {
  id: string;
  findingIds: string[];
  action: DekoCleanAction;
  affectedPaths: string[];
  risk: DekoCleanSeverity;
  snapshotRequired: boolean;
  validationCommands: string[];
  rollbackAvailable: boolean;
  explanation: string;
  createdAt: string;
}

export interface DekoCleanRepairChange {
  path: string;
  line: number;
  kind: "reference-replacement";
  before: string;
  after: string;
  expectedBeforeChecksum: string;
  expectedAfterChecksum: string;
}

export interface DekoCleanRepairRecipe {
  id: string;
  findingId: string;
  createdAt: string;
  expiresAt: string;
  readOnly: true;
  deterministic: true;
  status: "pending" | "accepted" | "executing" | "executed" | "rejected";
  acceptedAt?: string;
  acceptedBy?: string;
  executedAt?: string;
  integrityHash: string;
  affectedFiles: string[];
  changes: DekoCleanRepairChange[];
  expectedChecksums: Record<string, { before: string; after: string }>;
  backupPlan: {
    recoveryPointType: "before-repair";
    snapshotRequired: true;
    filesToSnapshot: string[];
    rollback: string;
  };
  validationCommands: string[];
}

export type RepairExecutionStatus =
  | "pending"
  | "accepted"
  | "executing"
  | "completed"
  | "failed"
  | "rolled-back"
  | "rejected";

export interface RepairExecutionLog {
  id: string;
  recipeId: string;
  targetPath: string;
  startedAt: string;
  completedAt?: string;
  status: RepairExecutionStatus;
  expectedBeforeChecksum: string;
  actualBeforeChecksum?: string;
  expectedAfterChecksum: string;
  actualAfterChecksum?: string;
  backupPath?: string;
  backupVerified?: boolean;
  checksumVerified?: boolean;
  totalFiles?: number;
  completedFiles?: number;
  fileResults?: Array<{
    targetPath: string;
    status: "pending" | "backed-up" | "completed" | "rolled-back" | "failed";
    expectedBeforeChecksum: string;
    actualBeforeChecksum?: string;
    expectedAfterChecksum: string;
    actualAfterChecksum?: string;
    backupPath?: string;
  }>;
  errorCode?: string;
  errorMessage?: string;
}

export interface EchoRepairExecutionResult {
  ok: boolean;
  status: RepairExecutionStatus;
  recipeId: string;
  log: RepairExecutionLog;
  message: string;
  errorCode?: string;
}

export interface DekoCleanCandidate {
  path: string;
  kind: "file" | "directory";
  sizeBytes: number;
  extension: string;
  risk: DekoCleanRisk;
  reasons: DekoCleanReason[];
  referencedBy: string[];
  duplicateOf?: string;
  checksum?: string;
  lastModifiedAt?: string;
  recommendation: DekoCleanRecommendation;
}

export interface DekoCleanReport {
  scannedFiles: number;
  totalSizeBytes: number;
  safeCandidates: number;
  reviewCandidates: number;
  protectedFiles: number;
  duplicateFiles: number;
  estimatedRecoverableBytes: number;
  regenerableDependenciesBytes: number;
  candidates: DekoCleanCandidate[];
  largestFiles: Array<{ path: string; sizeBytes: number }>;
  createdAt: string;
}

export interface DekoCleanConfig {
  projectRoot: string;
  protectedPaths: string[];
  protectedNamePatterns: RegExp[];
  buildDirectories: string[];
  cacheDirectories: string[];
  dependencyDirectories: string[];
  ignoredDirectories: string[];
  sourceExtensions: string[];
  assetExtensions: string[];
  textExtensions: string[];
  dynamicReferencePatterns: RegExp[];
  maxTextFileBytes: number;
  largeLogThresholdBytes: number;
}

export interface ScannedFile {
  path: string;
  absolutePath: string;
  sizeBytes: number;
  extension: string;
  lastModifiedAt: string;
  protected: boolean;
  symbolicLink: boolean;
}

export interface ScannedDirectoryCandidate {
  path: string;
  absolutePath: string;
  sizeBytes: number;
  reason: "build-output" | "cache-file";
}

export interface DekoCleanScanResult {
  files: ScannedFile[];
  directoryCandidates: ScannedDirectoryCandidate[];
  totalSizeBytes: number;
  regenerableDependenciesBytes: number;
  fingerprint: string;
}

export interface UsageGraphNode {
  path: string;
  referencedBy: string[];
  references: string[];
  hasDynamicReferenceRisk: boolean;
}

export type DekoCleanUsageGraph = Record<string, UsageGraphNode>;

export interface DekoCleanManifestEntry {
  originalPath: string;
  quarantinePath: string;
  checksum: string;
  sizeBytes: number;
  reasons: DekoCleanReason[];
  timestamp: string;
  findingId?: string;
  adminReference?: string;
  validationStatus?: "pending" | "passed" | "failed";
}

export interface DekoCleanCommandValidationResult {
  command: string;
  success: boolean;
  exitCode: number | null;
  output: string;
}

export interface DekoCleanManifest {
  id: string;
  projectRoot: string;
  createdAt: string;
  entries: DekoCleanManifestEntry[];
  validation: DekoCleanCommandValidationResult[];
  status: "quarantined" | "validated" | "validation-failed" | "restored";
}

export interface DekoCleanValidationResult {
  operationId: string;
  lintPassed: boolean;
  buildPassed: boolean;
  diffCheckPassed: boolean;
  integrityPassed: boolean;
  securityRescanPassed?: boolean;
  commands: DekoCleanCommandValidationResult[];
  createdAt: string;
}

export interface DekoCleanAuditEntry {
  operationId: string;
  findingId?: string;
  action: DekoCleanAction;
  adminReference: string;
  affectedPaths: string[];
  beforeChecksums: Record<string, string>;
  afterChecksums: Record<string, string>;
  snapshotManifestId?: string;
  validationResult?: DekoCleanValidationResult;
  rollbackStatus: "not-required" | "available" | "completed" | "recommended";
  status: "planned" | "completed" | "failed";
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface DekoCleanSummary {
  status: "stable" | "review" | "warning" | "danger" | "scanning";
  radarAlerts: number;
  reviewItems: number;
  quarantinedFiles: number;
  protectedFiles: number;
  criticalAlerts: number;
  lastScanAt?: string;
  healthyFiles: number;
  pendingDecision: number;
  resolvedFindings: number;
  failedFindings: number;
}

export type HealthScoreLabel = "excellent" | "good" | "needs-attention" | "warning" | "critical";

export interface HealthScoreFactor {
  id: string;
  label: string;
  weight: number;
  penalty: number;
  findingCount: number;
  status: "healthy" | "attention" | "unknown";
}

export interface HealthScore {
  value: number;
  label: HealthScoreLabel;
  calculatedAt: string;
  trend: "improving" | "stable" | "declining";
  factors: HealthScoreFactor[];
}

export interface HealthScoreHistoryEntry {
  value: number;
  label: HealthScoreLabel;
  recordedAt: string;
}

export type DekoCleanTimelineOperation =
  | "scan"
  | "repair"
  | "restore"
  | "recreate"
  | "quarantine"
  | "rollback"
  | "radar-scan"
  | "security-scan"
  | "build"
  | "lint"
  | "validate"
  | "ignore";

export interface TimelineEntry {
  id: string;
  time: string;
  operation: DekoCleanTimelineOperation;
  actor: string;
  source: string;
  result: "successful" | "failed" | "detected" | "planned";
  affectedFiles: string[];
  healthScoreBefore: number;
  healthScoreAfter: number;
  detail?: string;
}

export interface SeverityExplanation {
  severity: DekoCleanSeverity;
  label: string;
  explanation: string;
}

export interface DiagnosisCard {
  findingId: string;
  problem: string;
  severity: SeverityExplanation;
  detectedBy: DekoCleanFinding["detectedBy"];
  affectedFiles: string[];
  dependencies: string[];
  relatedFindingIds: string[];
  cause: string;
  analysis: string;
  confidence: number;
  suggestedRepair: DekoCleanAction;
  expectedImpact: string;
  safetyChecks: {
    snapshot: boolean;
    manifest: boolean;
    rollback: boolean;
  };
  validation: Array<"lint" | "build" | "radar">;
  estimatedRisk: DekoCleanSeverity;
  estimatedTime: string;
}

export interface SecurityMemoryEntry {
  id: string;
  threatName?: string;
  threatFamily?: string;
  category?: string;
  fileHashSha256?: string;
  safeFingerprint?: string;
  sourceConnector: string;
  detectionId?: string;
  confirmedTreatment: "quarantine" | "restore-clean-copy" | "remove-generated-file" | "repair-reference" | "update-dependency" | "rotate-secret" | "manual-security-review" | "ignore-false-positive";
  treatmentRecipe: {
    description: string;
    allowedActions: DekoCleanAction[];
    validationCommands: string[];
    protectedPathsChecked: string[];
  };
  result: "successful" | "failed" | "false-positive";
  confirmedByAdmin: boolean;
  confirmedAt?: string;
  validationPassed: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface DekoBrainSecurityRecommendation {
  findingId: string;
  summary: string;
  riskExplanation: string;
  recommendedAction: DekoCleanAction;
  alternativeActions: DekoCleanAction[];
  affectedPaths: string[];
  securityMemoryMatch?: { entryId: string; confidence: number; sameHash: boolean };
  requiresAdminConfirmation: true;
  warnings: string[];
}

export interface DekoCleanPreview {
  reportCreatedAt: string;
  candidatePaths: string[];
  estimatedBytes: number;
}

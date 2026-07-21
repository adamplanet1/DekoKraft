import type { DekoCleanCommandValidationResult, DekoCleanSeverity } from "../dekoclean/types.ts";

export type RecoveryPointType = "automatic" | "manual" | "before-repair" | "after-repair" | "before-feature" | "release" | "emergency";
export type RecoveryPointStatus = "verified" | "provisional" | "invalid" | "archived";
export type RecoveryScopeLevel = "file" | "module" | "route" | "subsystem" | "project";

export interface RecoveryManifestEntry {
  path: string;
  checksum: string;
  size: number;
  modifiedAt: string;
  category: "source" | "asset" | "locale" | "data" | "config" | "other";
  protected: boolean;
  dependencies: string[];
  dependents: string[];
  restoreEligible: boolean;
  contentObjectReference?: string;
  contentEncoding?: "raw" | "gzip";
  deleted: boolean;
}

export interface RecoveryManifest {
  version: 1;
  recoveryPointId: string;
  projectRootFingerprint: string;
  createdAt: string;
  entries: RecoveryManifestEntry[];
  changedFiles: string[];
  deletedFiles: string[];
  dependencyMapReference: string;
  protectedChecksumSummary: string;
  integrityHash: string;
}

export interface RecoveryValidation {
  lintPassed: boolean;
  buildPassed: boolean;
  diffCheckPassed: boolean;
  radarPassed: boolean;
  protectedIntegrityPassed: boolean;
  manifestsValid: boolean;
  snapshotCompleted: boolean;
  commands: DekoCleanCommandValidationResult[];
  validatedAt: string;
}

export interface RecoveryPoint {
  recoveryPointId: string;
  type: RecoveryPointType;
  createdAt: string;
  createdBy: string;
  projectVersion: string;
  operationId: string;
  healthScore: number;
  dekoIndex: number | null;
  gitCommitHash?: string;
  validation: RecoveryValidation;
  manifestReference: string;
  snapshotReference: string;
  changedFiles: string[];
  dependencyMapReference: string;
  protectedChecksumSummary: string;
  status: RecoveryPointStatus;
  storageBytesAdded: number;
  totalReferencedBytes: number;
}

export interface RecoveryScope {
  scopeId: string;
  level: RecoveryScopeLevel;
  affectedFiles: string[];
  relatedFiles: string[];
  excludedFiles: string[];
  reason: string;
  confidence: number;
  estimatedRisk: DekoCleanSeverity;
}

export interface RecoveryPreview {
  operationId: string;
  recoveryPointId: string;
  createdAt: string;
  detectedProblem: string;
  scope: RecoveryScope;
  currentVersions: Array<{ path: string; checksum?: string; size?: number; exists: boolean }>;
  recoveryVersions: Array<{ path: string; checksum?: string; size?: number; deleted: boolean }>;
  filesToRestore: string[];
  filesToDelete: string[];
  filesUnchanged: string[];
  diffSummary: string;
  recoveryPointDate: string;
  validationStatus: RecoveryPointStatus;
  confidence: number;
  risk: DekoCleanSeverity;
  estimatedDuration: string;
  rollbackAvailable: true;
  protectedFiles: string[];
  requiresProtectedConfirmation: boolean;
  requiresSecondConfirmation: boolean;
}

export type RecoveryOperationStatus = "previewed" | "running" | "awaiting-acceptance" | "failed" | "accepted" | "rolled-back" | "cancelled";

export interface RecoveryOperation {
  operationId: string;
  recoveryPointId: string;
  status: RecoveryOperationStatus;
  scope: RecoveryScope;
  preview: RecoveryPreview;
  emergencyRecoveryPointId?: string;
  quarantineManifestReference?: string;
  restoredFiles: string[];
  removedFiles: string[];
  validation?: RecoveryValidation;
  error?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  rollbackAvailable: boolean;
}

export interface RecoveryMemoryEntry {
  id: string;
  failureSignature: string;
  scopeLevel: RecoveryScopeLevel;
  affectedFileCount: number;
  recoveryPointId: string;
  restoredFiles: string[];
  validationPassed: boolean;
  rollbackResult?: "not-required" | "successful" | "failed";
  successfulPattern: boolean;
  createdAt: string;
}

export interface DekoRebuildSummary {
  latestVerified: RecoveryPoint | null;
  recoveryPointCount: number;
  lastSuccessfulRecovery: RecoveryOperation | null;
  storageUsedBytes: number;
  verificationStatus: "verified" | "unavailable" | "attention";
}

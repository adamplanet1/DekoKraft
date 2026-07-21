export type ParticipantScanProfileId = "quick" | "full" | "security" | "assets" | "performance";
export type ParticipantCleanProfileId = "quick-clean" | "deep-clean";
export type ParticipantMaintenanceSeverity = "critical" | "high" | "medium" | "low" | "info";
export type ParticipantScanStatus = "queued" | "running" | "completed" | "cancelled" | "failed";
export type ParticipantQuarantineStatus = "pending-scan" | "suspicious" | "blocked" | "admin-review" | "released" | "deleted-by-admin";

export interface ParticipantScanProfile {
  id: ParticipantScanProfileId;
  icon: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  incremental: boolean;
  confirmationRequired: boolean;
}

export interface ParticipantCleanProfile {
  id: ParticipantCleanProfileId;
  icon: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  executable: boolean;
}

export interface ParticipantResource {
  resourceId: string;
  participantId: string;
  displayName: string;
  category: "product" | "image" | "store-asset" | "material" | "document" | "ai-output" | "temporary";
  reference?: string;
  mimeType?: string;
  sizeBytes?: number;
  modifiedAt?: string;
  checksum: string;
  published: boolean;
  protected: boolean;
}

export interface ParticipantFinding {
  id: string;
  participantId: string;
  scanId: string;
  category: "review" | "risk" | "assets" | "performance" | "quarantine" | "cleaned";
  severity: ParticipantMaintenanceSeverity;
  title: string;
  reason: string;
  affectedResourceIds: string[];
  affectedResourceNames: string[];
  recommendedAction: string;
  createdAt: string;
}

export interface ParticipantScanRun {
  scanId: string;
  participantId: string;
  profileId: ParticipantScanProfileId;
  status: ParticipantScanStatus;
  phase: string;
  progress: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  scannedResources: number;
  skippedResources: number;
  findingIds: string[];
  summary?: string;
  error?: string;
  cancellationRequested?: boolean;
}

export interface ParticipantQuarantineRecord {
  id: string;
  participantId: string;
  resourceId: string;
  displayName: string;
  safeReason: string;
  classification: "suspicious" | "requires-review" | "blocked-type" | "integrity-mismatch";
  severity: ParticipantMaintenanceSeverity;
  status: ParticipantQuarantineStatus;
  checksum: string;
  storageReference: string;
  mimeType?: string;
  sizeBytes: number;
  scanId?: string;
  createdAt: string;
  updatedAt: string;
  reviewRequestedAt?: string;
}

export interface ParticipantContainment {
  active: boolean;
  participantId: string;
  reason?: string;
  affectedResourceCount: number;
  startedAt?: string;
  adminReviewStatus: "not-required" | "pending" | "reviewing" | "resolved";
}

export interface ParticipantCleanCandidate {
  id: string;
  participantId: string;
  resourceId: string;
  title: string;
  category: string;
  sizeBytes: number;
  reason: string;
  lastUsed?: string;
  referenceCount: number;
  restoreAvailable: boolean;
  risk: "low" | "medium" | "high";
  recommendedAction: string;
  protected: boolean;
  storageReference?: string;
}

export interface ParticipantCleanPreview {
  previewId: string;
  participantId: string;
  profileId: ParticipantCleanProfileId;
  candidates: ParticipantCleanCandidate[];
  estimatedBytes: number;
  createdAt: string;
  expiresAt: string;
  executable: boolean;
  recoveryRequired: boolean;
}

export interface ParticipantRecoveryManifest {
  operationId: string;
  participantId: string;
  createdAt: string;
  entries: Array<{ resourceId: string; checksum: string; ownership: string; references: number; recycleReference?: string }>;
}

export interface ParticipantMaintenanceOperation {
  operationId: string;
  participantId: string;
  type: "scan" | "clean-preview" | "clean-execute" | "intake-validation" | "quarantine-review" | "containment";
  status: "completed" | "failed" | "cancelled" | "awaiting-confirmation";
  summary: string;
  affectedResourceCount: number;
  createdAt: string;
}

export interface ParticipantAdminEscalation {
  id: string;
  participantId: string;
  participantDisplayName: string;
  resourceIds: string[];
  classification: string;
  checksums: string[];
  safeSummary: string;
  scanId?: string;
  quarantineStatus?: ParticipantQuarantineStatus;
  containmentActive: boolean;
  status: "new" | "reviewing" | "resolved";
  createdAt: string;
}

export interface ParticipantMaintenanceState {
  version: 1;
  participantId: string;
  scans: ParticipantScanRun[];
  findings: ParticipantFinding[];
  quarantine: ParticipantQuarantineRecord[];
  cleanPreviews: ParticipantCleanPreview[];
  recoveryManifests: ParticipantRecoveryManifest[];
  operations: ParticipantMaintenanceOperation[];
  resourceHashes: Record<string, string>;
  containment: ParticipantContainment;
}

export interface ParticipantMaintenanceSummary {
  participantId: string;
  lastScanAt?: string;
  status: "stable" | "review" | "containment" | "scanning";
  reviewCount: number;
  quarantineCount: number;
  cleanableBytes: number;
  activeScan: ParticipantScanRun | null;
  containment: ParticipantContainment;
}

import type { AdvisorUse, AdvisorVerdict, BackgroundMode, BackgroundStudioType, CompatibilityOverride, CompatibilityStatus, DekoBrainCompositionSettings, ProvisionalCategory } from "./dekobrain";

export interface DekoBrainMemoryRecord {
  id: string;
  fingerprint: string;
  similarityKey: string;
  originalFileName: string;
  normalizedFileName: string;
  mimeType: string;
  originalSizeBytes: number;
  width: number;
  height: number;
  aspectRatio: number;
  megapixels: number;
  category: ProvisionalCategory;
  categoryConfirmed: boolean;
  compatibilityStatus: CompatibilityStatus;
  compatibilityOverride: CompatibilityOverride;
  advisorVerdict: AdvisorVerdict;
  advisorScore: number;
  backgroundMode: BackgroundMode;
  backgroundProcessingStatus?: "approved";
  backgroundThreshold?: number;
  backgroundSoftness?: number;
  backgroundProtection?: number;
  backgroundProcessedAt?: string;
  backgroundOutputMimeType?: string;
  compositionBackgroundType?: BackgroundStudioType;
  compositionSettings?: DekoBrainCompositionSettings;
  compositionApproved?: boolean;
  convertedToWebP: boolean;
  webpQuality?: number;
  convertedSizeBytes?: number;
  recommendedUses: AdvisorUse[];
  duplicateDetections: number;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
  analysisVersion: number;
}

export type DekoBrainMemoryStatus = "new" | "previouslyAnalyzed" | "exactDuplicate" | "possiblyRelated";

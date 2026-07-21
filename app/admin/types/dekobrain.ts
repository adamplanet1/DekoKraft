export type DekoBrainMediaKind = "image" | "video";

export type DekoBrainStageStatus =
  | "notStarted"
  | "analyzing"
  | "ready"
  | "warning"
  | "future"
  | "needsReview";

export type DekoBrainRoadmapStatus = "ready" | "partial" | "future" | "warning";

export type ProvisionalCategory =
  | "candles"
  | "packaging"
  | "gifts"
  | "children"
  | "decoration"
  | "services"
  | "gypsum-decor"
  | "other";

export type CategorySource = "user" | "local-heuristic" | "future-ai";
export type CompatibilityStatus = "compatible" | "needsReview" | "incompatible" | "unknown";
export type CompatibilityOverride = "none" | "approved" | "rejected";
export type BackgroundMode = "original" | "white" | "transparent" | "blur" | "remove";
export type BackgroundProcessingStatus = "idle" | "processing" | "ready" | "complex" | "error";
export type ShadowMode = "keep" | "soften" | "experimental-remove";
export type AssetApprovalStatus = "not-ready" | "preview-ready" | "approved";
export type ApprovedAssetKind = "transparent-product" | "transparent-product-with-shadow" | "smart-cropped-product" | "background-composition";
export type SmartCropStatus = "idle" | "processing" | "active" | "error";
export type ImagePipelineState = { sourceUrl:string;extractionPreviewUrl:string|null;approvedTransparentUrl:string|null;displayPreviewUrl:string|null };
export type BackgroundStudioType = "transparent" | "white" | "color" | "gradient" | "blur" | "upload" | "smart";

export interface DekoBrainCompositionSettings {
  scale: number;
  offsetX: number;
  offsetY: number;
  shadow: number;
  safeArea: number;
  color: string;
  gradientStart: string;
  gradientEnd: string;
}

export type DekoBrainImageState = {
  originalImage: { file: File; url: string; width: number; height: number } | null;
  transparentProduct: { blob: Blob; url: string; width: number; height: number; approved: boolean } | null;
  smartCroppedImage: { blob: Blob; url: string; width: number; height: number } | null;
  composedImage: { blob: Blob; url: string; backgroundType: BackgroundStudioType; settings: DekoBrainCompositionSettings; approved: boolean } | null;
};
export type PreviewTransform = { scale:number;x:number;y:number;zoom:number;safeArea:number };
export type AdvisorVerdict = "ready" | "readyWithImprovements" | "reviewRequired" | "notReady";

export type AdvisorReason =
  | "technicalStrong"
  | "technicalAdequate"
  | "technicalWeak"
  | "categoryConfirmed"
  | "categoryUnconfirmed"
  | "compatible"
  | "compatibilityReview"
  | "incompatible"
  | "conversionAvailable"
  | "conversionCompleted"
  | "finalCompositionReady";

export type AdvisorStrength = "resolution" | "fileSize" | "format" | "cardRatio" | "compatibility" | "finalComposition";
export type AdvisorImprovement = "confirmCategory" | "reviewCompatibility" | "convertWebp" | "increaseResolution" | "compressFile";
export type AdvisorUse = "productCard" | "gallery" | "hero" | "thumbnail" | "manualReview";

export type MediaItemStatus =
  | "analyzing"
  | "ready"
  | "warning"
  | "approved"
  | "needsReview";

export type MediaOrientation = "square" | "portrait" | "landscape";
export type MediaFit = "contain" | "cover";
export type MediaCardRatio = "1:1" | "4:3" | "3:4" | "16:9";
export type MediaObjectPosition = "center" | "top" | "bottom" | "left" | "right";
export type MediaPreviewRatio = "original" | MediaCardRatio;

export type MediaQualityWarning =
  | "lowResolution"
  | "compressionSuggested"
  | "strongCompressionWarning"
  | "animatedGif";

export interface AnalyzedMediaItem {
  id: string;
  originalFile: File;
  preservedOriginalFile: File;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  width: number;
  height: number;
  aspectRatio: number;
  aspectRatioLabel: string;
  orientation: MediaOrientation;
  megapixels: number;
  previewUrl: string;
  imageState: DekoBrainImageState;
  hasTransparency: boolean | null;
  recommendedFit: MediaFit;
  recommendedCardRatio: MediaCardRatio;
  recommendedObjectPosition: MediaObjectPosition;
  recommendedResponsiveWidths: number[];
  qualityWarnings: MediaQualityWarning[];
  technicalQualityScore: number;
  status: MediaItemStatus;
  provisionalCategory: ProvisionalCategory;
  categorySource: CategorySource;
  categoryConfirmed: boolean;
  compatibilityStatus: CompatibilityStatus;
  compatibilityOverride: CompatibilityOverride;
  backgroundMode: BackgroundMode;
  backgroundProcessingStatus: BackgroundProcessingStatus;
  transparentBackgroundApproved: boolean;
  transparentBackgroundPending: boolean;
  transparentBackgroundThreshold?: number;
  transparentBackgroundSoftness?: number;
  transparentBackgroundProtection?: number;
  transparentBackgroundApprovedAt?: string;
  transparentBackgroundBlob?: Blob;
  transparentBackgroundUrl?: string;
  webpConverted: boolean;
  preferredWebPQuality: number;
  convertedSizeBytes?: number;
}

export interface DekoBrainProcessingStage {
  id: number;
  status: DekoBrainStageStatus | DekoBrainRoadmapStatus;
  detail?: string;
}

export interface WebPConversionResult {
  file: File;
  previewUrl: string;
  originalSizeBytes: number;
  convertedSizeBytes: number;
  percentageSaved: number;
  width: number;
  height: number;
  quality: number;
}

export interface AdvisorDecision {
  verdict: AdvisorVerdict;
  score: number;
  reasons: AdvisorReason[];
  strengths: AdvisorStrength[];
  improvements: AdvisorImprovement[];
  recommendedUses: AdvisorUse[];
  nextAction: AdvisorImprovement | "useAsIs";
}

export type DekoBrainEventType =
  | "fileImported"
  | "technicalAnalysisCompleted"
  | "categoryConfirmed"
  | "compatibilityReviewed"
  | "webpConverted"
  | "advisorDecisionGenerated"
  | "memory_record_created"
  | "memory_record_updated"
  | "transparentProductApproved"
  | "backgroundCompositionApproved"
  | "canva_preview_opened"
  | "canva_export_downloaded"
  | "canva_connection_requested"
  | "canva_draft_cleared";

export interface DekoBrainEventRecord {
  id: string;
  timestamp: string;
  type: DekoBrainEventType;
  mediaId?: string;
  filename?: string;
  designType?: string;
  textLength?: number;
  backgroundMode?: string;
}

export interface MediaAnalysisProvider {
  analyze(file: File): Promise<AnalyzedMediaItem>;
}

export interface MediaTransformationProvider {
  transform(file: File, operation: string): Promise<File>;
}

export interface MediaStorageProvider {
  save(item: AnalyzedMediaItem): Promise<string>;
  remove(id: string): Promise<void>;
}

import type { AdvisorDecision, AnalyzedMediaItem } from "../../types/dekobrain";
import type { DekoBrainMemoryRecord } from "../../types/dekobrainMemory";
import { logDekoBrainEvent } from "./eventLog";
import { createSimilarityKey, generateImageFingerprint, normalizeMediaFilename } from "./imageFingerprint";
import { findByFingerprint, saveMemoryRecord } from "./memoryStore";

export async function rememberMediaAnalysis(item: AnalyzedMediaItem, advisorDecision: AdvisorDecision) {
  const file = item.preservedOriginalFile;
  const fingerprint = await generateImageFingerprint(file);
  const existing = await findByFingerprint(fingerprint);
  const now = new Date().toISOString();
  const record: DekoBrainMemoryRecord = {
    id: existing?.id ?? crypto.randomUUID(), fingerprint,
    similarityKey: createSimilarityKey({ width: item.width, height: item.height, fileSizeBytes: file.size, filename: file.name, category: item.provisionalCategory }),
    originalFileName: file.name, normalizedFileName: normalizeMediaFilename(file.name), mimeType: file.type,
    originalSizeBytes: file.size, width: item.width, height: item.height, aspectRatio: item.aspectRatio, megapixels: item.megapixels,
    category: item.provisionalCategory, categoryConfirmed: item.categoryConfirmed, compatibilityStatus: item.compatibilityStatus,
    compatibilityOverride: item.compatibilityOverride, advisorVerdict: advisorDecision.verdict, advisorScore: advisorDecision.score,
    backgroundMode: item.backgroundMode, convertedToWebP: item.webpConverted, webpQuality: item.preferredWebPQuality,
    backgroundProcessingStatus: item.transparentBackgroundApproved ? "approved" : undefined,
    backgroundThreshold: item.transparentBackgroundApproved ? item.transparentBackgroundThreshold : undefined,
    backgroundSoftness: item.transparentBackgroundApproved ? item.transparentBackgroundSoftness : undefined,
    backgroundProtection: item.transparentBackgroundApproved ? item.transparentBackgroundProtection : undefined,
    backgroundProcessedAt: item.transparentBackgroundApprovedAt,
    backgroundOutputMimeType: item.transparentBackgroundApproved ? item.transparentBackgroundBlob?.type : undefined,
    compositionBackgroundType: item.imageState.composedImage?.backgroundType,
    compositionSettings: item.imageState.composedImage?.settings,
    compositionApproved: item.imageState.composedImage?.approved,
    convertedSizeBytes: item.convertedSizeBytes, recommendedUses: advisorDecision.recommendedUses,
    duplicateDetections: existing?.duplicateDetections ?? 0, createdAt: existing?.createdAt ?? now, updatedAt: now, lastUsedAt: now, analysisVersion: 1,
  };
  await saveMemoryRecord(record);
  logDekoBrainEvent(existing ? "memory_record_updated" : "memory_record_created", { mediaId: item.id, filename: item.filename });
  return { record, outcome: existing ? "updated" as const : "created" as const };
}

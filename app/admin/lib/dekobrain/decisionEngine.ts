import type {
  AdvisorDecision,
  AdvisorImprovement,
  AdvisorStrength,
  AdvisorUse,
  AnalyzedMediaItem,
} from "../../types/dekobrain";

export function runDecisionEngine(item: AnalyzedMediaItem): AdvisorDecision {
  let score = item.technicalQualityScore;
  const reasons: AdvisorDecision["reasons"] = [];
  const strengths: AdvisorStrength[] = [];
  const improvements: AdvisorImprovement[] = [];
  const recommendedUses: AdvisorUse[] = [];

  if (item.technicalQualityScore >= 80) reasons.push("technicalStrong");
  else if (item.technicalQualityScore >= 60) reasons.push("technicalAdequate");
  else reasons.push("technicalWeak");

  if (Math.max(item.width, item.height) >= 1600) strengths.push("resolution");
  else if (Math.max(item.width, item.height) < 800) improvements.push("increaseResolution");
  if (item.fileSizeBytes <= 5 * 1024 * 1024) strengths.push("fileSize");
  else improvements.push("compressFile");
  if (item.mimeType === "image/webp" || item.webpConverted) strengths.push("format");
  else if (item.mimeType === "image/jpeg" || item.mimeType === "image/png") improvements.push("convertWebp");
  strengths.push("cardRatio");

  if (item.categoryConfirmed) {
    reasons.push("categoryConfirmed");
    score += 5;
  } else {
    reasons.push("categoryUnconfirmed");
    improvements.push("confirmCategory");
    score -= 5;
  }

  if (item.compatibilityStatus === "compatible") {
    reasons.push("compatible");
    strengths.push("compatibility");
    score += 5;
  } else if (item.compatibilityStatus === "incompatible") {
    reasons.push("incompatible");
    score -= 35;
  } else {
    reasons.push("compatibilityReview");
    improvements.push("reviewCompatibility");
    score -= 12;
  }

  if (item.webpConverted || item.mimeType === "image/webp") reasons.push("conversionCompleted");
  else reasons.push("conversionAvailable");
  if (item.imageState.composedImage?.approved) {
    reasons.push("finalCompositionReady");
    strengths.push("finalComposition");
    score += 5;
  }

  if (item.technicalQualityScore >= 55) {
    recommendedUses.push("productCard", "gallery");
    if (item.width >= 1200 && item.orientation === "landscape") recommendedUses.push("hero");
    if (item.width >= 320) recommendedUses.push("thumbnail");
  } else {
    recommendedUses.push("manualReview");
  }

  score = Math.max(0, Math.min(100, score));
  const verdict = item.compatibilityStatus === "incompatible"
    ? "notReady"
    : score >= 85 && item.categoryConfirmed
      ? "ready"
      : score >= 65
        ? "readyWithImprovements"
        : score >= 45
          ? "reviewRequired"
          : "notReady";

  const nextAction = improvements[0] ?? "useAsIs";
  return { verdict, score, reasons, strengths, improvements, recommendedUses, nextAction };
}

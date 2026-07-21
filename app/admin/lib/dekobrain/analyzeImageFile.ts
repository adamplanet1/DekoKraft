import type {
  AnalyzedMediaItem,
  MediaCardRatio,
  MediaOrientation,
  MediaQualityWarning,
} from "../../types/dekobrain";

const CATEGORY_KEYWORDS: Array<{ category: AnalyzedMediaItem["provisionalCategory"]; words: string[] }> = [
  { category: "gypsum-decor", words: ["gypsum", "plaster decor", "gipsdeko", "gips decor", "décor en plâtre", "ديكور من الجبس", "ديكور جبسي", "جبس"] },
  { category: "candles", words: ["candle", "candles", "kerze", "bougie", "شمعة", "شموع"] },
  { category: "packaging", words: ["box", "pack", "package", "verpack", "boite", "boîte", "علبة", "تغليف"] },
  { category: "gifts", words: ["gift", "geschenk", "cadeau", "هدية", "هدايا"] },
  { category: "children", words: ["kid", "child", "kinder", "enfant", "طفل", "أطفال"] },
  { category: "decoration", words: ["decor", "deko", "décor", "زينة", "ديكور"] },
  { category: "services", words: ["service", "dienst", "خدمة", "خدمات"] },
];

function inferCategory(filename: string): AnalyzedMediaItem["provisionalCategory"] {
  const normalized = filename.toLocaleLowerCase();
  return CATEGORY_KEYWORDS.find(({ words }) => words.some((word) => normalized.includes(word)))?.category ?? "other";
}

const CARD_RATIOS: Array<{ label: MediaCardRatio; value: number }> = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function greatestCommonDivisor(first: number, second: number): number {
  return second === 0
    ? first
    : greatestCommonDivisor(second, first % second);
}

function getAspectRatioLabel(width: number, height: number) {
  const divisor = greatestCommonDivisor(width, height);
  const ratioWidth = Math.round(width / divisor);
  const ratioHeight = Math.round(height / divisor);

  if (ratioWidth <= 32 && ratioHeight <= 32) {
    return `${ratioWidth}:${ratioHeight}`;
  }

  return `${(width / height).toFixed(2)}:1`;
}

function getOrientation(width: number, height: number): MediaOrientation {
  const difference = Math.abs(width - height) / Math.max(width, height);
  if (difference <= 0.04) return "square";
  return width > height ? "landscape" : "portrait";
}

function getClosestCardRatio(aspectRatio: number) {
  return CARD_RATIOS.reduce((closest, current) =>
    Math.abs(current.value - aspectRatio) <
    Math.abs(closest.value - aspectRatio)
      ? current
      : closest
  );
}

function getWarnings(file: File, width: number, height: number) {
  const warnings: MediaQualityWarning[] = [];
  const longestSide = Math.max(width, height);
  const sizeInMb = file.size / (1024 * 1024);

  if (longestSide < 800) warnings.push("lowResolution");
  if (sizeInMb > 10) warnings.push("strongCompressionWarning");
  else if (sizeInMb > 5) warnings.push("compressionSuggested");
  if (file.type === "image/gif") warnings.push("animatedGif");

  return warnings;
}

function getTechnicalScore(
  file: File,
  width: number,
  height: number,
  closestRatioDifference: number
) {
  const longestSide = Math.max(width, height);
  const sizeInMb = file.size / (1024 * 1024);
  const resolutionScore = longestSide >= 1600 ? 40 : longestSide >= 800 ? 28 : 12;
  const fileSizeScore = sizeInMb <= 5 ? 25 : sizeInMb <= 10 ? 12 : 4;
  const ratioScore = closestRatioDifference <= 0.08 ? 20 : closestRatioDifference <= 0.25 ? 16 : 10;
  const formatScore = file.type === "image/webp" ? 15 : file.type === "image/gif" ? 8 : 12;

  return Math.min(100, resolutionScore + fileSizeScore + ratioScore + formatScore);
}

async function detectTransparency(
  image: HTMLImageElement,
  mimeType: string
): Promise<boolean | null> {
  if (mimeType === "image/jpeg") return false;
  if (!['image/png', 'image/webp', 'image/gif'].includes(mimeType)) return null;

  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 256 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  try {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] < 255) return true;
    }
    return false;
  } catch {
    return null;
  }
}

export async function analyzeImageFile(file: File): Promise<AnalyzedMediaItem> {
  const previewUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = previewUrl;
    await image.decode();

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    const aspectRatio = width / height;
    const closestRatio = getClosestCardRatio(aspectRatio);
    const qualityWarnings = getWarnings(file, width, height);
    const hasTransparency = await detectTransparency(image, file.type);
    const orientation = getOrientation(width, height);
    const provisionalCategory = inferCategory(file.name);

    return {
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      originalFile: file,
      preservedOriginalFile: file,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      fileSizeBytes: file.size,
      fileSizeFormatted: formatFileSize(file.size),
      width,
      height,
      aspectRatio,
      aspectRatioLabel: getAspectRatioLabel(width, height),
      orientation,
      megapixels: Number(((width * height) / 1_000_000).toFixed(2)),
      previewUrl,
      imageState: {
        originalImage: { file, url: previewUrl, width, height },
        transparentProduct: null,
        smartCroppedImage: null,
        composedImage: null,
      },
      hasTransparency,
      recommendedFit: orientation === "square" ? "contain" : "cover",
      recommendedCardRatio: closestRatio.label,
      recommendedObjectPosition: "center",
      recommendedResponsiveWidths: [320, 640, 960, 1200],
      qualityWarnings,
      technicalQualityScore: getTechnicalScore(
        file,
        width,
        height,
        Math.abs(closestRatio.value - aspectRatio)
      ),
      status: qualityWarnings.length > 0 ? "warning" : "ready",
      provisionalCategory,
      categorySource: "local-heuristic",
      categoryConfirmed: false,
      compatibilityStatus: provisionalCategory === "other" ? "needsReview" : "compatible",
      compatibilityOverride: "none",
      backgroundMode: "original",
      backgroundProcessingStatus: "idle",
      transparentBackgroundApproved: false,
      transparentBackgroundPending: false,
      webpConverted: file.type === "image/webp",
      preferredWebPQuality: 82,
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

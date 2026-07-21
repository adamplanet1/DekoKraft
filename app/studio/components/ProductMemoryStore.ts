import { normalizeProductDNA, type ProductDNA, type ProductDimensions } from "../../../lib/echo/echoProductDNA";

export type ProductMemorySource = "platform-product" | "uploaded-image" | "manual-entry" | "scan-3d";
export type ProductMemoryHistoryType = "created" | "image-analyzed" | "dna-confirmed" | "dimensions-confirmed" | "user-correction" | "generated-result-accepted";

export type ProductMemoryImage = {
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
  persistentUrl?: string | null;
  source?: "platform-product" | "uploaded-file" | "generated-variant";
};

export type ProductMemory = {
  memoryId: string;
  productId: string | null;
  categoryId: string | null;
  source: ProductMemorySource;
  sourceImageName?: string;
  sourceImageFingerprint?: string;
  dnaReference?: {
    productId: string;
    memoryId?: string;
    title?: string;
  };
  productRelation?: "same-product-new-image" | "new-product-from-dna";
  draftId?: string;
  productDNA: ProductDNA;
  dimensions: ProductDimensions;
  originalImage?: ProductMemoryImage;
  images?: ProductMemoryImage[];
  analysis: {
    status: "not-started" | "analyzing" | "suggested" | "confirmed" | "failed";
    detectedAt?: string;
    confidence?: number;
    suggestedFields?: Partial<ProductDNA>;
    missingFields?: string[];
  };
  history: Array<{ id: string; type: ProductMemoryHistoryType; createdAt: string; payload?: unknown }>;
  createdAt: string;
  updatedAt: string;
};

export const PRODUCT_MEMORY_BY_PRODUCT_ID_KEY = "dekokraft.productMemory.byProductId";
export const PRODUCT_MEMORY_BY_MEMORY_ID_KEY = "dekokraft.productMemory.byMemoryId";

const createId = (prefix: string) => typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
  ? crypto.randomUUID()
  : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function loadMap(key: string): Record<string, ProductMemory> {
  if (typeof window === "undefined") return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, ProductMemory> : {};
  } catch (error) {
    console.error(`[Product Memory] Failed to load ${key}:`, error);
    return {};
  }
}

function saveMap(key: string, value: Record<string, ProductMemory>): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Product Memory] Failed to save ${key}:`, error);
    return false;
  }
}

export function loadProductMemoryByProductId(productId: string): ProductMemory | null {
  return loadMap(PRODUCT_MEMORY_BY_PRODUCT_ID_KEY)[productId] ?? null;
}

export function saveProductMemoryByProductId(productId: string, memory: ProductMemory): boolean {
  return saveMap(PRODUCT_MEMORY_BY_PRODUCT_ID_KEY, { ...loadMap(PRODUCT_MEMORY_BY_PRODUCT_ID_KEY), [productId]: memory });
}

export function loadProductMemoryByMemoryId(memoryId: string): ProductMemory | null {
  return loadMap(PRODUCT_MEMORY_BY_MEMORY_ID_KEY)[memoryId] ?? null;
}

export function saveProductMemoryByMemoryId(memoryId: string, memory: ProductMemory): boolean {
  return saveMap(PRODUCT_MEMORY_BY_MEMORY_ID_KEY, { ...loadMap(PRODUCT_MEMORY_BY_MEMORY_ID_KEY), [memoryId]: memory });
}

export function saveProductMemory(memory: ProductMemory): boolean {
  return memory.productId
    ? saveProductMemoryByProductId(memory.productId, memory)
    : saveProductMemoryByMemoryId(memory.memoryId, memory);
}

export function createPlatformProductMemory(
  productDNA: ProductDNA,
  image?: { name: string; url: string } | null,
): ProductMemory {
  const stored = loadProductMemoryByProductId(productDNA.id);
  if (stored) {
    if (!image?.url) return stored;
    const updated = {
      ...stored,
      originalImage: {
        name: image.name || stored.originalImage?.name || productDNA.id,
        type: stored.originalImage?.type || "image/webp",
        size: stored.originalImage?.size ?? 0,
        previewUrl: image.url,
        persistentUrl: image.url,
        source: "platform-product" as const,
      },
      updatedAt: new Date().toISOString(),
    };
    saveProductMemoryByProductId(productDNA.id, updated);
    return updated;
  }
  const timestamp = new Date().toISOString();
  const normalized = normalizeProductDNA(productDNA as ProductDNA & Record<string, unknown>);
  const memory: ProductMemory = {
    memoryId: createId("product-memory"), productId: normalized.id, categoryId: normalized.categoryId || null,
    source: "platform-product", productDNA: normalized,
    dimensions: { ...normalized.dimensions, source: "product-data", confirmed: normalized.dimensions.confirmed || normalized.confirmed === true },
    originalImage: image?.url ? { name: image.name || normalized.id, type: "image/webp", size: 0, previewUrl: image.url, persistentUrl: image.url, source: "platform-product" } : undefined,
    analysis: { status: normalized.confirmed ? "confirmed" : "not-started", missingFields: [] },
    history: [{ id: createId("memory-event"), type: "created", createdAt: timestamp }], createdAt: timestamp, updatedAt: timestamp,
  };
  saveProductMemoryByProductId(normalized.id, memory);
  return memory;
}

export function createUploadedProductMemory(file: File, previewUrl?: string): ProductMemory {
  const timestamp = new Date().toISOString();
  const memoryId = createId("uploaded-product-memory");
  const productDNA = normalizeProductDNA({ id: memoryId, categoryId: "", productType: "", dimensions: { length: null, width: null, height: null, unit: "mm", source: "image-analysis", confirmed: false } });
  return {
    memoryId, productId: null, categoryId: null, source: "uploaded-image",
    sourceImageName: file.name, sourceImageFingerprint: `${file.name}:${file.size}:${file.lastModified}`,
    productDNA, dimensions: { ...productDNA.dimensions, source: "image-analysis", confirmed: false },
    originalImage: { name: file.name, type: file.type, size: file.size, previewUrl, persistentUrl: null, source: "uploaded-file" },
    analysis: { status: "analyzing", missingFields: [] },
    history: [{ id: createId("memory-event"), type: "created", createdAt: timestamp }],
    createdAt: timestamp, updatedAt: timestamp,
  };
}

export function completeUploadedImageAnalysis(
  memory: ProductMemory,
  result: { confidence?: number; suggestedFields?: Partial<ProductDNA>; missingFields?: string[] } = {},
): ProductMemory {
  const timestamp = new Date().toISOString();
  const suggestedFields = result.suggestedFields ?? {};
  const productDNA = normalizeProductDNA({
    ...memory.productDNA,
    ...suggestedFields,
    id: memory.productDNA.id,
    dimensions: memory.dimensions,
    confirmed: false,
  });
  return {
    ...memory,
    categoryId: productDNA.categoryId || null,
    productDNA,
    analysis: {
      status: "suggested", detectedAt: timestamp,
      confidence: result.confidence,
      suggestedFields,
      missingFields: result.missingFields ?? ["productType", "shape", "material", "color", "dimensions"],
    },
    history: [...memory.history, { id: createId("memory-event"), type: "image-analyzed", createdAt: timestamp, payload: { mode: "local-image-analyzer", realDimensionsAvailable: false } }],
    updatedAt: timestamp,
  };
}

export function failUploadedImageAnalysis(memory: ProductMemory): ProductMemory {
  const timestamp = new Date().toISOString();
  return {
    ...memory,
    analysis: {
      ...memory.analysis,
      status: "failed",
      detectedAt: timestamp,
      missingFields: ["productType", "shape", "material", "color", "dimensions"],
    },
    updatedAt: timestamp,
  };
}

export function confirmProductMemory(memory: ProductMemory, productDNA: ProductDNA): ProductMemory {
  const timestamp = new Date().toISOString();
  const confirmedDNA = normalizeProductDNA({ ...productDNA, confirmed: true, confirmedAt: timestamp } as ProductDNA & Record<string, unknown>);
  const dimensions = { ...confirmedDNA.dimensions, confirmed: true };
  confirmedDNA.dimensions = dimensions;
  const wasCorrected = JSON.stringify(memory.productDNA) !== JSON.stringify(confirmedDNA);
  return {
    ...memory, categoryId: confirmedDNA.categoryId || memory.categoryId, productDNA: confirmedDNA, dimensions,
    analysis: { ...memory.analysis, status: "confirmed" },
    history: [
      ...memory.history,
      ...(wasCorrected ? [{ id: createId("memory-event"), type: "user-correction" as const, createdAt: timestamp, payload: { previousValue: memory.productDNA, confirmedValue: confirmedDNA } }] : []),
      { id: createId("memory-event"), type: "dna-confirmed", createdAt: timestamp, payload: { productDNA: confirmedDNA } },
      { id: createId("memory-event"), type: "dimensions-confirmed", createdAt: timestamp, payload: { dimensions } },
    ],
    updatedAt: timestamp,
  };
}

export function addAcceptedGeneratedVariant(
  memory: ProductMemory,
  imageUrl: string,
  metadata: { name: string; type: "image/png" },
): { memory: ProductMemory; saved: boolean } {
  const timestamp = new Date().toISOString();
  const variant: ProductMemoryImage = {
    name: metadata.name,
    type: metadata.type,
    size: Math.max(0, Math.floor((imageUrl.split(",")[1]?.length ?? 0) * 0.75)),
    previewUrl: imageUrl,
    persistentUrl: imageUrl,
    source: "generated-variant",
  };
  const updated: ProductMemory = {
    ...memory,
    images: [...(memory.images ?? []), variant],
    history: [
      ...memory.history,
      {
        id: createId("memory-event"),
        type: "generated-result-accepted",
        createdAt: timestamp,
        payload: { variantName: variant.name, productDNAId: memory.productDNA.id },
      },
    ],
    updatedAt: timestamp,
  };
  return { memory: updated, saved: saveProductMemory(updated) };
}

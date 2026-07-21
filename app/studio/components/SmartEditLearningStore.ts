import { saveConfirmedLearning, type ProductDNA as LearningProductDNA } from "../../components/ui/dekobrain-experiment/LearningEchoStore";
import { normalizeProductDNA, type ProductDimensions, type ProductDNA, type SmartProductSpecifications } from "../../../lib/echo/echoProductDNA";
import { saveProductDNAToPrimaryStore } from "./PrimaryProductDNAStore";
import { confirmProductMemory, saveProductMemory, type ProductMemory } from "./ProductMemoryStore";

export type { ProductDimensions, SmartProductSpecifications } from "../../../lib/echo/echoProductDNA";

export const SMART_EDIT_PRODUCT_DNA_KEY = "dekokraft.productDNA.confirmed";
export const SMART_EDIT_LEARNING_PRODUCT_DNA_KEY = "dekokraft.learningEcho.confirmedProductDNA";
export const SMART_EDIT_PREFERENCES_KEY = "dekokraft.learningEcho.confirmedPreferences";
export const SMART_EDIT_SESSION_DRAFT_KEY = "dekokraft.smartEdit.sessionDraft";

export type ConfirmedProductDNARecord = SmartProductSpecifications & {
  type: "confirmed_product_dna";
  productId: string | null;
  participantId?: string;
  memoryId: string;
  confirmed: true;
  confirmedAt: string;
};

export type ConfirmedProductDNALearningRecord = {
  id: string;
  type: "confirmed_product_dna";
  productId: string | null;
  participantId?: string;
  memoryId: string;
  categoryId: SmartProductSpecifications["categoryId"];
  dimensions: ConfirmedProductDNARecord["dimensions"];
  productType: string;
  shape: string;
  color: string;
  material: string;
  confirmed: true;
  confirmedAt: string;
};

export type ConfirmedProductDNACorrectionRecord = {
  id: string;
  type: "confirmed_correction";
  productId: string | null;
  participantId?: string;
  memoryId: string;
  categoryId: string;
  field: "dimensions.length" | "dimensions.width" | "dimensions.height" | "dimensions.unit";
  previousValue: number | string | null;
  confirmedValue: number | string | null;
  confirmedAt: string;
};

type ProductDNALearningRecord = ConfirmedProductDNALearningRecord | ConfirmedProductDNACorrectionRecord;

const dimensionsText = (dimensions: ProductDimensions) => [dimensions.length != null && `L ${dimensions.length}`, dimensions.width != null && `B ${dimensions.width}`, dimensions.height != null && `H ${dimensions.height}`].filter(Boolean).join(" × ") + (dimensions.length != null || dimensions.width != null || dimensions.height != null ? ` ${dimensions.unit}` : "");

const toProductDNA = (productId: string, specs: SmartProductSpecifications, updatedAt: string): LearningProductDNA => ({
  id: productId,
  productName: specs.notes || specs.productType,
  identity: `${specs.productType} · ${specs.material}`,
  category: specs.categoryName || specs.productType,
  material: specs.material,
  shape: specs.shape,
  color: specs.color,
  style: specs.notes,
  usage: specs.usage,
  dimensions: dimensionsText(specs.dimensions),
  description: specs.notes,
  imageName: "",
  completeness: Math.round(([specs.productType, specs.shape, specs.color, specs.material, specs.background, dimensionsText(specs.dimensions), specs.usage].filter(Boolean).length / 7) * 100),
  needsConfirmation: [],
  confirmedTraits: [specs.categoryName, specs.shape, specs.color, specs.material, dimensionsText(specs.dimensions)].filter(Boolean),
  updatedAt,
});

export type ConfirmedEditPreferenceRecord = {
  id: string;
  type: "confirmed_edit_preference";
  productId: string;
  confirmedRequest: string;
  preserveProductShape: boolean;
  preserveProductDetails: boolean;
  preserveOriginalColors: boolean;
  requestedBackground?: string;
  reduceShadows: boolean;
  improveLighting: boolean;
  increaseSharpness: boolean;
  confirmed: true;
  confirmedAt: string;
};

const id = (prefix: string) => typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${prefix}-${Date.now()}`;

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch (error) {
    console.error(`[Smart Edit] Failed to load local data from ${key}:`, error);
    return [];
  }
}

function safeSetItem(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Smart Edit] Failed to save local data to ${key}:`, error);
    return false;
  }
}

const confirmedRecordSignature = (record: Pick<ConfirmedProductDNARecord, "productId" | "memoryId" | "categoryId" | "dimensions" | "productType" | "shape" | "color" | "material">) => JSON.stringify({
  productId: record.productId,
  memoryId: record.memoryId,
  categoryId: record.categoryId,
  dimensions: record.dimensions,
  productType: record.productType,
  shape: record.shape,
  color: record.color,
  material: record.material,
});

export function confirmedProductDNAToSpecifications(record: ConfirmedProductDNARecord): SmartProductSpecifications {
  const specifications = { ...record } as Record<string, unknown>;
  delete specifications.type;
  delete specifications.productId;
  delete specifications.participantId;
  delete specifications.confirmed;
  delete specifications.confirmedAt;
  return specifications as unknown as SmartProductSpecifications;
}

export function loadConfirmedProductDNA(productId?: string): ConfirmedProductDNARecord | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(SMART_EDIT_PRODUCT_DNA_KEY) ?? "null");
    const candidate = Array.isArray(parsed) ? parsed.at(-1) : parsed;
    if (!candidate || typeof candidate !== "object") return null;
    const record = candidate as ConfirmedProductDNARecord;
    if (record.type !== "confirmed_product_dna" || record.confirmed !== true || (productId && record.productId !== productId)) return null;
    const normalized = normalizeProductDNA(record as ConfirmedProductDNARecord & Record<string, unknown>);
    const legacyIdentityId = record.productId ?? record.id;
    return {
      ...record,
      ...normalized,
      id: legacyIdentityId,
      productId: record.productId,
      memoryId: record.memoryId || legacyIdentityId,
      categoryId: record.categoryId,
      shape: normalized.shape ?? "",
      material: normalized.material ?? "",
      color: normalized.color ?? "",
      usage: normalized.usage ?? "",
      hasWick: normalized.hasWick ?? false,
      scent: normalized.scent ?? "",
      burnTime: normalized.burnTime ?? "",
      waxType: normalized.waxType ?? "",
      notes: normalized.notes ?? "",
      type: "confirmed_product_dna",
      confirmed: true,
      confirmedAt: record.confirmedAt,
    };
  } catch (error) {
    console.error("Failed to load confirmed Product DNA:", error);
    return null;
  }
}

export function loadConfirmedProductDNALearning(): ProductDNALearningRecord[] {
  if (typeof window === "undefined") return [];
  return readArray<ProductDNALearningRecord>(SMART_EDIT_LEARNING_PRODUCT_DNA_KEY);
}

export function clearSmartEditExperimentData(): boolean {
  if (typeof window === "undefined") return false;
  try {
    [SMART_EDIT_PRODUCT_DNA_KEY, SMART_EDIT_LEARNING_PRODUCT_DNA_KEY, SMART_EDIT_PREFERENCES_KEY, SMART_EDIT_SESSION_DRAFT_KEY].forEach((key) => window.localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error("[Smart Edit] Failed to clear experiment data:", error);
    return false;
  }
}

// Temporary local persistence.
// Replace with Learning Echo backend later.
export async function saveConfirmedProductSpecifications(memory: ProductMemory, specs: SmartProductSpecifications, original?: SmartProductSpecifications, participantId?: string) {
  if (typeof window === "undefined") return { success: false as const, record: null };
  const identityId = memory.productId ?? memory.memoryId;
  const confirmedAt = new Date().toISOString();
  const normalizedDNA: ProductDNA = {
    ...normalizeProductDNA({ ...specs, id: identityId, dimensions: { ...specs.dimensions, confirmed: true } } as SmartProductSpecifications & Record<string, unknown>),
    confirmed: true,
    confirmedAt,
  };
  const record: ConfirmedProductDNARecord = {
    ...specs,
    ...normalizedDNA,
    id: identityId,
    categoryId: specs.categoryId,
    shape: normalizedDNA.shape ?? "",
    material: normalizedDNA.material ?? "",
    color: normalizedDNA.color ?? "",
    usage: normalizedDNA.usage ?? "",
    hasWick: normalizedDNA.hasWick ?? false,
    scent: normalizedDNA.scent ?? "",
    burnTime: normalizedDNA.burnTime ?? "",
    waxType: normalizedDNA.waxType ?? "",
    notes: normalizedDNA.notes ?? "",
    type: "confirmed_product_dna",
    productId: memory.productId,
    participantId,
    memoryId: memory.memoryId,
    confirmed: true, confirmedAt,
  };
  if (memory.productId) {
    const productSaved = await saveProductDNAToPrimaryStore(record);
    if (!productSaved) return { success: false as const, record: null };
  }
  const confirmedMemory = confirmProductMemory(memory, record);
  if (!saveProductMemory(confirmedMemory)) return { success: false as const, record: null };
  safeSetItem(SMART_EDIT_SESSION_DRAFT_KEY, { productId: memory.productId, memoryId: memory.memoryId, stage: "ready-for-edit", confirmedSpecifications: record, updatedAt: record.confirmedAt });
  const learning = loadConfirmedProductDNALearning();
  const signature = confirmedRecordSignature(record);
  const confirmations = learning.filter((item): item is ConfirmedProductDNALearningRecord => item.type === "confirmed_product_dna");
  const isDuplicate = confirmations.some((item) => confirmedRecordSignature(item) === signature);
  const nextLearning = [...learning];
  if (!isDuplicate) {
    const learningRecord: ConfirmedProductDNALearningRecord = {
      id: record.id,
      type: "confirmed_product_dna",
      productId: memory.productId,
      participantId,
      memoryId: memory.memoryId,
      categoryId: record.categoryId,
      dimensions: record.dimensions,
      productType: record.productType,
      shape: record.shape,
      color: record.color,
      material: record.material,
      confirmed: true,
      confirmedAt,
    };
    nextLearning.push(learningRecord);
  }
  const baseline = original;
  const wasCorrected = Boolean(baseline && JSON.stringify(baseline) !== JSON.stringify(specs));
  const dimensionsChanged = Boolean(baseline && JSON.stringify(baseline.dimensions) !== JSON.stringify(specs.dimensions));
  if (baseline && dimensionsChanged) {
    (["length", "width", "height", "unit"] as const).forEach((key) => {
      if (baseline.dimensions[key] === record.dimensions[key]) return;
      nextLearning.push({
        id: id("product-dna-correction"), type: "confirmed_correction",
        productId: memory.productId, participantId, memoryId: memory.memoryId, categoryId: record.categoryId,
        field: `dimensions.${key}`, previousValue: baseline.dimensions[key], confirmedValue: record.dimensions[key], confirmedAt,
      });
    });
  }
  if (!safeSetItem(SMART_EDIT_LEARNING_PRODUCT_DNA_KEY, nextLearning)) {
    console.error("[Smart Edit] Product DNA was saved, but the Learning Echo event could not be recorded.");
  }
  if (!isDuplicate) {
    try {
      saveConfirmedLearning({
        productId: identityId,
        participantId,
        workspace: "image",
        productDNA: toProductDNA(identityId, specs, confirmedAt),
        correction: wasCorrected ? {
          finalRequest: dimensionsChanged ? `Confirmed dimensions: ${dimensionsText(specs.dimensions)}` : `Confirmed product specification correction: ${specs.categoryName}`,
          decision: "confirmed",
          ...(dimensionsChanged ? { field: "dimensions", previousValue: baseline?.dimensions ?? null, confirmedValue: record.dimensions } : {}),
        } : {},
        artisanPreference: {},
      });
    } catch (error) {
      console.error("[Smart Edit] Failed to update Learning Echo:", error);
    }
  }
  window.dispatchEvent(new CustomEvent("dekobrain-experiment-change"));
  return { success: true as const, record, memory: confirmedMemory };
}

export function saveConfirmedEditPreference(productId: string, request: string, specs: SmartProductSpecifications) {
  if (typeof window === "undefined") return null;
  const lower = request.toLowerCase();
  const preference: ConfirmedEditPreferenceRecord = {
    id: id("edit-preference"), type: "confirmed_edit_preference", productId, confirmedRequest: request,
    preserveProductShape: /shape|شكل|form|forme/.test(lower),
    preserveProductDetails: /detail|تفاصيل|details/.test(lower),
    preserveOriginalColors: /color|لون|farbe|couleur/.test(lower),
    requestedBackground: /white|بيضاء|ابيض|weiß|blanc/.test(lower) ? "white" : /transparent|شفاف|transparent/.test(lower) ? "transparent" : undefined,
    reduceShadows: /shadow|ظل|schatten|ombre/.test(lower),
    improveLighting: /light|إضاءة|اضاءة|licht|lumi/.test(lower),
    increaseSharpness: /sharp|حدة|schärfe|netteté/.test(lower),
    confirmed: true,
    confirmedAt: new Date().toISOString(),
  };
  if (!safeSetItem(SMART_EDIT_PREFERENCES_KEY, [...readArray<ConfirmedEditPreferenceRecord>(SMART_EDIT_PREFERENCES_KEY), preference])) return null;
  if (!safeSetItem(SMART_EDIT_SESSION_DRAFT_KEY, { productId, stage: "confirmed", confirmedSpecifications: specs, confirmedPreference: preference, updatedAt: preference.confirmedAt })) return null;

  const dna = toProductDNA(productId, specs, preference.confirmedAt);
  dna.confirmedTraits = [...dna.confirmedTraits, request];
  try {
    saveConfirmedLearning({ productId, productDNA: dna, correction: { finalRequest: request, decision: "confirmed" }, artisanPreference: { instruction: request, preserveShape: preference.preserveProductShape, preserveOriginalColors: preference.preserveOriginalColors, preferredBackground: preference.requestedBackground } });
  } catch (error) {
    console.error("[Smart Edit] Failed to save confirmed edit preference:", error);
    return null;
  }
  return preference;
}

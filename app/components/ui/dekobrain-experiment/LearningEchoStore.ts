export const LEARNING_ECHO_STORAGE_KEY = "dekokraft:dekobrain:experiment:v1";

export type ExperimentStatus = "draft" | "waiting_confirmation" | "confirmed" | "rejected" | "applied";

export type ProductDNA = {
  id: string;
  productName: string;
  identity: string;
  category: string;
  material: string;
  shape: string;
  color: string;
  style: string;
  usage: string;
  dimensions: string;
  description: string;
  imageName: string;
  completeness: number;
  needsConfirmation: string[];
  confirmedTraits: string[];
  updatedAt: string;
};

export type ConfirmedCorrection = {
  originalRequest?: string;
  echoSuggestion?: string;
  finalRequest?: string;
  decision?: "confirmed";
  field?: "dimensions";
  previousValue?: unknown;
  confirmedValue?: unknown;
};

export type ArtisanPreference = {
  instruction?: string;
  preserveShape?: boolean;
  preserveOriginalColors?: boolean;
  preferredBackground?: string;
};

export type ConfirmedLearningRecord = {
  id: string;
  type: "confirmed_learning";
  productId: string;
  participantId?: string;
  workspace?: string;
  productDNA: ProductDNA;
  correction: ConfirmedCorrection;
  artisanPreference: ArtisanPreference;
  confirmed: true;
  confirmedAt: string;
};

const isRecord = (value: unknown): value is ConfirmedLearningRecord => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<ConfirmedLearningRecord>;
  return item.type === "confirmed_learning" && item.confirmed === true && typeof item.id === "string" && typeof item.productId === "string" && Boolean(item.productDNA);
};

export function loadLearningEchoRecords(): ConfirmedLearningRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEARNING_ECHO_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  } catch {
    return [];
  }
}

export function saveConfirmedLearning(input: Omit<ConfirmedLearningRecord, "id" | "type" | "confirmed" | "confirmedAt">): ConfirmedLearningRecord {
  if (typeof window === "undefined") throw new Error("Learning Echo storage is only available in the browser.");
  const record: ConfirmedLearningRecord = {
    ...input,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `confirmed-${Date.now()}`,
    type: "confirmed_learning",
    confirmed: true,
    confirmedAt: new Date().toISOString(),
  };
  const records = [...loadLearningEchoRecords(), record];
  window.localStorage.setItem(LEARNING_ECHO_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent("dekobrain-experiment-change", { detail: records }));
  return record;
}

export function clearLearningEchoRecords() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEARNING_ECHO_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("dekobrain-experiment-change", { detail: [] }));
}

export function uniqueProductDNA(records: ConfirmedLearningRecord[]) {
  const products = new Map<string, ProductDNA>();
  records.forEach((record) => products.set(record.productId, record.productDNA));
  return [...products.values()];
}

export function correctionRecords(records: ConfirmedLearningRecord[]) {
  return records.filter((record) => Boolean(record.correction.finalRequest || record.correction.field));
}

export function knowledgeRules(records: ConfirmedLearningRecord[]) {
  return records.flatMap((record) => {
    const traits = record.productDNA.confirmedTraits.map((trait) => `${record.productDNA.productName}: ${trait}`);
    const request = record.correction.finalRequest ? [`${record.productDNA.productName}: ${record.correction.finalRequest}`] : [];
    return [...traits, ...request];
  });
}

export function artisanPreferences(records: ConfirmedLearningRecord[]) {
  return records.map((record) => record.artisanPreference).filter((preference) => Boolean(preference.instruction));
}

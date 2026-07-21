import type {
  AdminInventoryTotals,
  ConfirmedProductCandidate,
  FinishedProductStock,
  InventoryMovement,
  InventoryState,
  ParticipantInventorySnapshot,
  ProductInspection,
  ProductMatchResult,
  RawMaterialStock,
} from "./types";

export const INVENTORY_STORAGE_KEY = "dekokraft.inventory.v1";
export const INVENTORY_CHANGE_EVENT = "dekokraft-inventory-change";
export const PRODUCT_MATCH_SUGGESTION_THRESHOLD = 0.55;

const EMPTY_STATE: InventoryState = { finishedProducts: [], rawMaterials: [], inspections: [], movements: [] };
const id = (prefix: string) => typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function normalizeState(value: unknown): InventoryState {
  if (!value || typeof value !== "object") return structuredClone(EMPTY_STATE);
  const state = value as Partial<InventoryState>;
  return {
    finishedProducts: Array.isArray(state.finishedProducts) ? state.finishedProducts : [],
    rawMaterials: Array.isArray(state.rawMaterials) ? state.rawMaterials : [],
    inspections: Array.isArray(state.inspections) ? state.inspections : [],
    movements: Array.isArray(state.movements) ? state.movements : [],
  };
}

export function readInventoryState(): InventoryState {
  if (typeof window === "undefined") return structuredClone(EMPTY_STATE);
  try { return normalizeState(JSON.parse(window.localStorage.getItem(INVENTORY_STORAGE_KEY) ?? "{}")); }
  catch (error) { console.error("[Inventory] Failed to read local inventory.", error); return structuredClone(EMPTY_STATE); }
}

function writeInventoryState(state: InventoryState) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(INVENTORY_CHANGE_EVENT));
    return true;
  } catch (error) { console.error("[Inventory] Failed to save local inventory.", error); return false; }
}

export function getParticipantInventory(participantId: string): ParticipantInventorySnapshot {
  const state = readInventoryState();
  return {
    participantId,
    finishedProducts: state.finishedProducts.filter((item) => item.participantId === participantId),
    rawMaterials: state.rawMaterials.filter((item) => item.participantId === participantId),
    inspections: state.inspections.filter((item) => item.participantId === participantId),
    movements: state.movements.filter((item) => item.participantId === participantId),
  };
}

export function getAdminInventoryTotals(): AdminInventoryTotals {
  const state = readInventoryState();
  return {
    participants: new Set([...state.finishedProducts, ...state.rawMaterials].map((item) => item.participantId)).size,
    finishedAvailable: state.finishedProducts.reduce((sum, item) => sum + item.quantityAvailable, 0),
    finishedReserved: state.finishedProducts.reduce((sum, item) => sum + item.quantityReserved, 0),
    finishedDamaged: state.finishedProducts.reduce((sum, item) => sum + item.quantityDamaged, 0),
    rawMaterialUnits: state.rawMaterials.reduce((sum, item) => sum + item.quantityAvailable, 0),
    movementCount: state.movements.length,
    pendingInspections: state.inspections.filter((item) => item.status === "pending-confirmation").length,
  };
}

/** Read-only context for DekoBrain. No mutation capability is exposed here. */
export function getDekoBrainInventoryContext(participantId: string) {
  const snapshot = getParticipantInventory(participantId);
  return Object.freeze({
    participantId,
    finishedProducts: snapshot.finishedProducts.map((item) => Object.freeze({ ...item })),
    rawMaterials: snapshot.rawMaterials.map((item) => Object.freeze({ ...item })),
    recentMovements: snapshot.movements.slice(-20).map((item) => Object.freeze({ ...item })),
  });
}

const comparableFields = ["productType", "categoryId", "shape", "material", "color", "hasWick"] as const;
const normalized = (value: unknown) => String(value ?? "").trim().toLocaleLowerCase();

export function matchConfirmedProductDNA(detectedAttributes: Record<string, string | number | boolean>, candidates: ConfirmedProductCandidate[]): ProductMatchResult {
  const confirmed = candidates.filter((item) => item.productDNA.confirmed === true);
  let best: ProductMatchResult = { candidate: null, confidence: 0, comparison: { matched: [], mismatched: [], missing: [...comparableFields] } };
  for (const candidate of confirmed) {
    const matched: string[] = [], mismatched: string[] = [], missing: string[] = [];
    for (const field of comparableFields) {
      const detected = detectedAttributes[field];
      const expected = candidate.productDNA[field];
      if (detected === undefined || detected === "" || expected === undefined || expected === "") missing.push(field);
      else if (normalized(detected) === normalized(expected)) matched.push(field);
      else mismatched.push(field);
    }
    const compared = matched.length + mismatched.length;
    const confidence = compared ? matched.length / compared : 0;
    if (confidence > best.confidence) best = { candidate, confidence, comparison: { matched, mismatched, missing } };
  }
  return best;
}

export function saveProductInspection(input: Omit<ProductInspection, "id" | "createdAt" | "status">): ProductInspection {
  const state = readInventoryState();
  const status = input.matchedProductId && input.confidence >= PRODUCT_MATCH_SUGGESTION_THRESHOLD ? "pending-confirmation" : "new-product-required";
  const inspection: ProductInspection = { ...input, id: id("inspection"), status, createdAt: new Date().toISOString() };
  writeInventoryState({ ...state, inspections: [...state.inspections, inspection] });
  return inspection;
}

export function chooseInspectionProduct(inspectionId: string, participantId: string, candidate: ConfirmedProductCandidate): ProductInspection | null {
  if (candidate.participantId !== participantId || candidate.productDNA.confirmed !== true) return null;
  const state = readInventoryState();
  const inspection = state.inspections.find((item) => item.id === inspectionId && item.participantId === participantId);
  if (!inspection || inspection.status === "confirmed" || inspection.status === "rejected") return null;
  const result = matchConfirmedProductDNA(inspection.detectedAttributes, [candidate]);
  const updated: ProductInspection = { ...inspection, matchedProductId: candidate.productId, confidence: result.confidence, productDNAComparison: result.comparison, status: result.confidence >= PRODUCT_MATCH_SUGGESTION_THRESHOLD ? "pending-confirmation" : "new-product-required" };
  writeInventoryState({ ...state, inspections: state.inspections.map((item) => item.id === inspectionId ? updated : item) });
  return updated;
}

export function confirmProductInspection(input: { inspectionId: string; participantId: string; productId: string; quantity: number; currentStock: number }): { ok: true; stock: FinishedProductStock; movement: InventoryMovement } | { ok: false; reason: "not-found" | "not-confirmable" | "duplicate" | "invalid-quantity" } {
  const state = readInventoryState();
  const inspection = state.inspections.find((item) => item.id === input.inspectionId && item.participantId === input.participantId);
  if (!inspection) return { ok: false, reason: "not-found" };
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) return { ok: false, reason: "invalid-quantity" };
  if (inspection.status !== "pending-confirmation" || inspection.matchedProductId !== input.productId || inspection.confidence < PRODUCT_MATCH_SUGGESTION_THRESHOLD) return { ok: false, reason: "not-confirmable" };
  if (inspection.confirmedAt || state.movements.some((item) => item.type === "production-added" && item.referenceId === input.inspectionId)) return { ok: false, reason: "duplicate" };
  const timestamp = new Date().toISOString();
  const previous = state.finishedProducts.find((item) => item.participantId === input.participantId && item.productId === input.productId);
  const stock: FinishedProductStock = previous
    ? { ...previous, quantityAvailable: previous.quantityAvailable + input.quantity, updatedAt: timestamp }
    : { productId: input.productId, participantId: input.participantId, quantityAvailable: Math.max(0, input.currentStock) + input.quantity, quantityReserved: 0, quantityDamaged: 0, updatedAt: timestamp };
  const movement: InventoryMovement = { id: id("movement"), participantId: input.participantId, productId: input.productId, type: "production-added", quantity: input.quantity, referenceId: input.inspectionId, note: "Confirmed product inspection", createdAt: timestamp };
  const confirmed: ProductInspection = { ...inspection, status: "confirmed", confirmedAt: timestamp };
  writeInventoryState({
    ...state,
    finishedProducts: [...state.finishedProducts.filter((item) => !(item.participantId === input.participantId && item.productId === input.productId)), stock],
    inspections: state.inspections.map((item) => item.id === input.inspectionId ? confirmed : item),
    movements: [...state.movements, movement],
  });
  return { ok: true, stock, movement };
}

export function rejectProductInspection(inspectionId: string, participantId: string) {
  const state = readInventoryState();
  const inspection = state.inspections.find((item) => item.id === inspectionId && item.participantId === participantId);
  if (!inspection || inspection.status === "confirmed") return false;
  writeInventoryState({ ...state, inspections: state.inspections.map((item) => item.id === inspectionId ? { ...item, status: "rejected" } : item) });
  return true;
}

export function saveRawMaterial(material: RawMaterialStock) {
  const state = readInventoryState();
  return writeInventoryState({ ...state, rawMaterials: [...state.rawMaterials.filter((item) => !(item.participantId === material.participantId && item.materialId === material.materialId)), material] });
}

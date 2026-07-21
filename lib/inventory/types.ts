import type { ProductDNA } from "../echo/echoProductDNA";

export interface RawMaterialStock {
  materialId: string;
  participantId: string;
  name: string;
  unit: string;
  quantityAvailable: number;
  quantityReserved: number;
  reorderLevel?: number;
  estimatedUnitCost?: number;
  updatedAt: string;
}

export interface FinishedProductStock {
  productId: string;
  participantId: string;
  sku?: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantityDamaged: number;
  reorderLevel?: number;
  updatedAt: string;
}

export interface ProductInspection {
  id: string;
  participantId: string;
  detectedProductId?: string;
  matchedProductId?: string;
  imageReference: string;
  confidence: number;
  detectedAttributes: Record<string, string | number | boolean>;
  productDNAComparison: {
    matched: string[];
    mismatched: string[];
    missing: string[];
  };
  status: "pending-confirmation" | "confirmed" | "rejected" | "new-product-required";
  createdAt: string;
  confirmedAt?: string;
}

export interface InventoryMovement {
  id: string;
  participantId: string;
  productId?: string;
  materialId?: string;
  type: "production-added" | "sale-reserved" | "sale-completed" | "return-added" | "damaged" | "manual-adjustment" | "material-purchased" | "material-consumed";
  quantity: number;
  referenceId?: string;
  note?: string;
  createdAt: string;
}

export interface InventoryState {
  finishedProducts: FinishedProductStock[];
  rawMaterials: RawMaterialStock[];
  inspections: ProductInspection[];
  movements: InventoryMovement[];
}

export interface ConfirmedProductCandidate {
  productId: string;
  participantId: string;
  title: string;
  currentStock: number;
  productDNA: ProductDNA;
}

export interface ProductMatchResult {
  candidate: ConfirmedProductCandidate | null;
  confidence: number;
  comparison: ProductInspection["productDNAComparison"];
}

export interface ParticipantInventorySnapshot {
  participantId: string;
  finishedProducts: FinishedProductStock[];
  rawMaterials: RawMaterialStock[];
  inspections: ProductInspection[];
  movements: InventoryMovement[];
}

export interface AdminInventoryTotals {
  participants: number;
  finishedAvailable: number;
  finishedReserved: number;
  finishedDamaged: number;
  rawMaterialUnits: number;
  movementCount: number;
  pendingInspections: number;
}

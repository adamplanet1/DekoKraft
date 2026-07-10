export type CreatorEntityStatus = "draft" | "active" | "archived";

export type CreatorProductKind = "physical-product" | "service" | "hybrid";

export type CreatorMaterialKind =
  | "mdf"
  | "plywood"
  | "birch"
  | "oak"
  | "acrylic"
  | "customer-owned"
  | "other";

export type CreatorDecorationKind =
  | "none"
  | "text"
  | "uploaded-image"
  | "magic-library"
  | "ai-generated"
  | "mixed";

export type CreatorPreviewKind =
  | "image"
  | "technical-drawing"
  | "production-preview";

export type NegotiationDecisionStatus =
  | "accepted"
  | "counter-offer"
  | "rejected"
  | "installment-suggested"
  | "simplify-design";

/**
 * The starting product or design template selected by the customer.
 * A Sample defines what can be customized.
 */
export interface Sample {
  id: string;
  name: string;
  productKind: CreatorProductKind;
  description?: string;
  customizableOptions: string[];
  knowledgeIds?: string[];
  status: CreatorEntityStatus;
}

/**
 * The customer-selected options for a Sample, such as size, material, color,
 * text, quantity, and other allowed customization choices.
 */
export interface Configuration {
  id: string;
  sampleId: string;
  selectedOptions: Record<string, string | number | boolean>;
  materialKind?: CreatorMaterialKind;
  decorationKind?: CreatorDecorationKind;
  quantity: number;
  status: CreatorEntityStatus;
  updatedAt: string;
}

/**
 * The normalized source-of-truth object created from the Configuration.
 * Preview, price, manufacturing files, and order documents are generated from it.
 */
export interface Recipe {
  id: string;
  sampleId: string;
  configurationId: string;
  version: number;
  productionData: Record<string, string | number | boolean>;
  materialRequirements: CreatorMaterialKind[];
  manufacturingInstructions: string[];
  status: CreatorEntityStatus;
  updatedAt: string;
}

/**
 * A visual or structured representation generated from the Recipe so the
 * customer can understand the configured product before ordering.
 */
export interface Preview {
  id: string;
  recipeId: string;
  previewKind: CreatorPreviewKind;
  imageUrl?: string;
  structuredSummary: string;
  generatedAt: string;
}

/**
 * The pricing result generated from the Recipe, including customer-facing
 * price information and hidden internal business limits.
 */
export interface Price {
  id: string;
  recipeId: string;
  currency: string;
  calculatedPrice: number;
  finalPrice: number;
  hiddenMinimumAcceptablePrice: number;
  hardMinimumPrice: number;
  counterOffer?: number;
  installmentSuggestion?: string;
  generatedAt: string;
}

/**
 * The price offered by the customer during negotiation.
 */
export interface CustomerOffer {
  id: string;
  recipeId: string;
  priceId: string;
  offeredPrice: number;
  currency: string;
  createdAt: string;
}

/**
 * The result of evaluating a CustomerOffer against pricing rules, minimum
 * acceptable prices, and business constraints.
 */
export interface NegotiationDecision {
  id: string;
  customerOfferId: string;
  status: NegotiationDecisionStatus;
  accepted: boolean;
  finalPrice: number;
  counterOffer?: number;
  installmentSuggestion?: string;
  reason: string;
  decidedAt: string;
}

/**
 * The production-ready data generated from the Recipe, including instructions,
 * measurements, materials, and files needed to make the order.
 */
export interface ManufacturingPackage {
  id: string;
  recipeId: string;
  instructions: string[];
  measurements: Record<string, string | number>;
  materials: CreatorMaterialKind[];
  fileUrls: string[];
  status: CreatorEntityStatus;
  generatedAt: string;
}

/**
 * The confirmed purchase record created after the Recipe, final price,
 * negotiation result, and manufacturing data are ready.
 */
export interface Order {
  id: string;
  recipeId: string;
  priceId: string;
  manufacturingPackageId: string;
  negotiationDecisionId?: string;
  finalPrice: number;
  currency: string;
  status: CreatorEntityStatus;
  createdAt: string;
}

/**
 * Reusable internal knowledge for product rules, material constraints, pricing
 * assumptions, production notes, and configuration guidance.
 */
export interface Knowledge {
  id: string;
  title: string;
  category: string;
  content: string;
  relatedSampleIds?: string[];
  status: CreatorEntityStatus;
  updatedAt: string;
}

/**
 * A saved improvement idea, feature request, business insight, or future
 * workflow concept stored without interrupting Magic Creator v1 development.
 */
export interface FutureIdea {
  id: string;
  title: string;
  description: string;
  source?: string;
  status: CreatorEntityStatus;
  createdAt: string;
}

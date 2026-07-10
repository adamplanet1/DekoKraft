import { type Configuration, type Sample } from "./magicCreatorTypes";

// First reference sample for Magic Creator v1.
// This describes the wooden laser box product used to validate the creator flow.
export const woodenLaserBoxSample: Sample = {
  id: "wooden-laser-box",
  name: "Wooden Laser Box",
  productKind: "hybrid",
  description:
    "Custom wooden laser box reference product for configurable dimensions, materials, decoration, text, image upload, quantity, and customer offer.",
  customizableOptions: [
    "dimensions",
    "material",
    "color",
    "decoration",
    "text",
    "uploaded image",
    "quantity",
    "customer offer",
  ],
  status: "active",
};

export const woodenLaserBoxDefaultConfiguration: Configuration = {
  id: "wooden-laser-box-default-configuration",
  sampleId: woodenLaserBoxSample.id,
  selectedOptions: {
    width: 150,
    height: 80,
    depth: 100,
    unit: "mm",
    material: "mdf",
    color: "natural-wood",
    decoration: "none",
    text: "",
    uploadedImages: "",
  },
  materialKind: "mdf",
  decorationKind: "none",
  quantity: 1,
  status: "draft",
  updatedAt: "2026-07-07",
};

// Recipe is the manufacturing source of truth for this sample.
// Future previews, prices, manufacturing files, and order documents should be generated from it.
export const woodenLaserBoxRecipe = {
  recipeId: "wooden-laser-box-recipe-v1",
  sampleId: woodenLaserBoxSample.id,
  supportedMaterials: ["mdf", "plywood", "birch"],
  supportedThicknesses: [
    {
      value: 3,
      unit: "mm",
    },
    {
      value: 4,
      unit: "mm",
    },
    {
      value: 6,
      unit: "mm",
    },
  ],
  requiredMachine: "laser-cutter",
  productionMethod: "laser-cut-and-engrave",
  supportedDecorationKinds: [
    "none",
    "text",
    "uploaded-image",
    "magic-library",
    "mixed",
  ],
  supportedPreviewKinds: [
    "image",
    "technical-drawing",
    "production-preview",
  ],
  generatedOutputs: [
    {
      kind: "preview-image",
      description: "Customer-facing preview image generated from the recipe.",
    },
    {
      kind: "technical-drawing",
      description: "Dimensioned technical drawing for review and production.",
    },
    {
      kind: "dxf",
      description: "DXF cutting file for laser production.",
    },
    {
      kind: "svg",
      description: "SVG vector file for preview and manufacturing workflows.",
    },
    {
      kind: "lightburn-project",
      description: "LightBurn project prepared for laser cutting and engraving.",
    },
    {
      kind: "production-report",
      description: "Production report with materials, dimensions, and instructions.",
    },
  ],
};

// Preview is generated from Recipe + Configuration.
// It helps the customer inspect the product but is not the source of truth.
export const woodenLaserBoxPreview = {
  id: "wooden-laser-box-preview-v1",
  recipeId: woodenLaserBoxRecipe.recipeId,
  configurationId: woodenLaserBoxDefaultConfiguration.id,
  kind: "production-preview",
  title: "Wooden Laser Box Production Preview",
  description:
    "Draft production preview generated from the wooden laser box recipe and default configuration.",
  previewImages: [],
  technicalDrawingPreview: null,
  status: "draft",
};

// Customer sees visibleTotal only.
// Internal costs and minimum prices are hidden.
// Customer negotiation must never go below hardMinimumPrice.
export const woodenLaserBoxPrice = {
  id: "wooden-laser-box-price-v1",
  recipeId: woodenLaserBoxRecipe.recipeId,
  configurationId: woodenLaserBoxDefaultConfiguration.id,
  currency: "EUR",
  materialCost: 4.5,
  cuttingCost: 6,
  engravingCost: 0,
  assemblyCost: 5,
  packagingCost: 2,
  margin: 12.5,
  calculatedTotal: 30,
  visibleTotal: 34.9,
  minimumAcceptablePrice: 27,
  hardMinimumPrice: 22,
  status: "draft",
};

// Customer offer is optional.
export const woodenLaserBoxCustomerOffer = {
  id: "wooden-laser-box-customer-offer-v1",
  configurationId: woodenLaserBoxDefaultConfiguration.id,
  priceId: woodenLaserBoxPrice.id,
  offeredPrice: null,
  currency: "EUR",
  status: "draft",
  createdAt: null,
};

// Negotiation protects the hard minimum price.
// The bot may suggest a counter-offer, simplified design, or installment later.
export const woodenLaserBoxNegotiationDecision = {
  id: "wooden-laser-box-negotiation-decision-v1",
  customerOfferId: woodenLaserBoxCustomerOffer.id,
  status: "counter-offer",
  acceptedPrice: null,
  counterOfferPrice: null,
  installmentSuggested: false,
  simplificationSuggested: false,
  reason:
    "Draft negotiation decision waiting for a customer offer while protecting the hard minimum price.",
};

// Manufacturing Package is what the workshop receives.
// It will later contain DXF, SVG, LightBurn files, material list, machine settings, and operator notes.
// It is generated from Recipe + Configuration, not edited manually.
export const woodenLaserBoxManufacturingPackage = {
  id: "wooden-laser-box-manufacturing-package-v1",
  recipeId: woodenLaserBoxRecipe.recipeId,
  configurationId: woodenLaserBoxDefaultConfiguration.id,
  previewId: woodenLaserBoxPreview.id,
  priceId: woodenLaserBoxPrice.id,
  status: "draft",
  productionFiles: [],
  materialList: [],
  machineSettings: [],
  operatorNotes: [],
  estimatedProductionTimeMinutes: null,
};

// Order closes the Magic Creator loop from Sample to Manufacturing Package.
export const woodenLaserBoxOrder = {
  id: "wooden-laser-box-order-v1",
  sampleId: woodenLaserBoxSample.id,
  configurationId: woodenLaserBoxDefaultConfiguration.id,
  recipeId: woodenLaserBoxRecipe.recipeId,
  previewId: woodenLaserBoxPreview.id,
  priceId: woodenLaserBoxPrice.id,
  customerOfferId: woodenLaserBoxCustomerOffer.id,
  negotiationDecisionId: woodenLaserBoxNegotiationDecision.id,
  manufacturingPackageId: woodenLaserBoxManufacturingPackage.id,
  status: "draft",
  paymentStatus: "not-started",
  productionStatus: "not-started",
  createdAt: null,
};

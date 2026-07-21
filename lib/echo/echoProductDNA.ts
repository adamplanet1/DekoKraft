export type ProductDimensions = {
  length: number | null;
  width: number | null;
  height: number | null;
  unit: "mm" | "cm" | "m";
  source: "manual" | "image-analysis" | "product-data" | "3d-analysis";
  confirmed: boolean;
};

export type ProductDNA = {
  id: string;
  categoryId: string;
  productType: string;
  shape?: string;
  material?: string;
  color?: string;
  dimensions: ProductDimensions;
  usage?: string;
  hasWick?: boolean | null;
  scent?: string;
  burnTime?: string;
  waxType?: string;
  notes?: string;
  confirmed?: boolean;
  confirmedAt?: string;
  smartEditProfile?: {
    successfulSettings: Record<string, unknown>;
    quality: "accepted";
    preserveWick?: boolean;
    preserveExactShape?: boolean;
    avoidStrongShadow?: boolean;
    preferredLighting?: string;
    preferredBackground?: string;
    preferredRatio?: string;
    preferredQuality?: string;
    preferredProvider?: "local" | "openai" | "hybrid";
    acceptedWorkflow?: string[];
    protectedFeatures?: string[];
    composition?: string;
    updatedAt: string;
  };
};

export type SmartProductSpecifications = ProductDNA & {
  categoryId: "packaging" | "candles" | "gifts" | "kids" | "services";
  categoryName: string;
  background: string;
  shape: string;
  material: string;
  color: string;
  usage: string;
  hasWick: boolean;
  scent: string;
  burnTime: string;
  waxType: string;
  notes: string;
  lidType: string;
  closureType: string;
  capacity: string;
  personalization: string;
  occasion: string;
  ageGroup: string;
  educationalGoal: string;
  safetyNotes: string;
  serviceType: string;
  inputFileType: string;
  outputFileType: string;
  estimatedDuration: string;
};

const defaultDimensions = (): ProductDimensions => ({
  length: null,
  width: null,
  height: null,
  unit: "mm",
  source: "product-data",
  confirmed: false,
});

const normalizeDimension = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

const createProductDNAId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `product-dna-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export function normalizeProductDNA(product: Partial<ProductDNA> & Record<string, unknown>): ProductDNA {
  const dimensionsValue = product.dimensions;
  const dimensions = dimensionsValue && typeof dimensionsValue === "object"
    ? dimensionsValue as Partial<ProductDimensions>
    : defaultDimensions();

  return {
    id: typeof product.id === "string" && product.id ? product.id : createProductDNAId(),
    categoryId: typeof product.categoryId === "string" ? product.categoryId : "",
    productType: typeof product.productType === "string" ? product.productType : "",
    shape: typeof product.shape === "string" ? product.shape : "",
    material: typeof product.material === "string" ? product.material : "",
    color: typeof product.color === "string" ? product.color : "",
    dimensions: {
      length: normalizeDimension(dimensions.length),
      width: normalizeDimension(dimensions.width),
      height: normalizeDimension(dimensions.height),
      unit: dimensions.unit === "cm" || dimensions.unit === "m" ? dimensions.unit : "mm",
      source: dimensions.source === "manual" || dimensions.source === "image-analysis" || dimensions.source === "3d-analysis"
        ? dimensions.source
        : "product-data",
      confirmed: dimensions.confirmed === true,
    },
    usage: typeof product.usage === "string" ? product.usage : "",
    hasWick: typeof product.hasWick === "boolean" ? product.hasWick : null,
    scent: typeof product.scent === "string" ? product.scent : "",
    burnTime: typeof product.burnTime === "string" ? product.burnTime : "",
    waxType: typeof product.waxType === "string" ? product.waxType : "",
    notes: typeof product.notes === "string" ? product.notes : "",
    confirmed: product.confirmed === true,
    confirmedAt: typeof product.confirmedAt === "string" ? product.confirmedAt : undefined,
    smartEditProfile: product.smartEditProfile && typeof product.smartEditProfile === "object"
      ? product.smartEditProfile as ProductDNA["smartEditProfile"]
      : undefined,
  };
}

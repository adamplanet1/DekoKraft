import { estimateOperationCost } from "./pricing";
import type { EchoGuideOperation, EchoGuideRecommendation, EchoGuideRequest } from "./types";

export function recommendModel(operation: EchoGuideOperation) {
  return operation === "background-removal" || operation === "edge-cleanup"
    ? "local-pixel-background-removal"
    : "gpt-image-2";
}

export function recommendQuality(operation: EchoGuideOperation, instruction: string) {
  if (operation === "background-removal" || operation === "edge-cleanup") return "low";
  return /advert|campaign|اعلان|إعلان|werbung|publicit/i.test(instruction) ? "high" : "medium";
}

export function recommendSize(operation: EchoGuideOperation) {
  return operation === "product-ad" ? "1536x1024" : "1024x1024";
}

function unique(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))];
}

export function createEchoGuideRecommendation(request: EchoGuideRequest): EchoGuideRecommendation {
  const product = request.productContext;
  const memory = request.memoryContext;
  const preserve = unique([
    "current product identity",
    "exact geometry and proportions",
    product?.material && `${product.material} material texture`,
    ...product?.protectedFeatures ?? [],
    ...memory?.acceptedPreferences.filter((item) => /preserve|protect|wick|shape|حافظ|فتيل|شكل/i.test(item)) ?? [],
  ]);
  const avoid = unique([
    "do not redesign, replace, recreate, or invent a different product",
    "do not use a remembered or reference product image as source pixels",
    "do not add unrelated objects",
    ...memory?.rejectedPatterns ?? [],
  ]);
  const background = product?.preferredBackground
    ?? (request.operation === "background-removal" ? "transparent" : undefined);
  const lighting = product?.preferredLighting ?? "preserve current product lighting unless explicitly requested";
  const ratio = product?.preferredRatio ?? "1:1";
  const quality = product?.preferredQuality ?? recommendQuality(request.operation, request.userInstruction);
  const size = recommendSize(request.operation);
  const model = recommendModel(request.operation);
  const cleanup = request.operation === "background-removal" || request.operation === "edge-cleanup"
    ? [
        "Preserve the product alpha boundary and the complete visible wick.",
        "Avoid white halos, remove detached artifacts, and do not erase valid product pixels.",
      ]
    : [];
  const finalPrompt = [
    "Edit the currently uploaded product image only.",
    product?.productType ? `Product identity: ${product.productType}${product.material ? `; material: ${product.material}` : ""}.` : undefined,
    `Preserve: ${preserve.join(", ")}.`,
    `Requested change: ${request.userInstruction.trim()}.`,
    background ? `Background: ${background}.` : undefined,
    `Lighting: ${lighting}.`,
    `Output ratio: ${ratio}; output size: ${size}; quality: ${quality}.`,
    ...cleanup,
    ...avoid.map((item) => `${item}.`),
    "Modify only the requested elements. Do not synthesize a new product. Modify the uploaded pixels.",
    "Return one clean product image.",
  ].filter(Boolean).join("\n");
  const warnings = unique([
    !product ? "No confirmed Product DNA was found; only the current request and safe defaults are used." : undefined,
    !memory ? "No accepted Echo Memory was found for this context." : undefined,
    model !== "local-pixel-background-removal" ? "Estimated cost is advisory; the execution logger records the actual provider cost." : undefined,
  ]);
  const cost = estimateOperationCost(request.operation);

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    workspace: request.workspace,
    operation: request.operation,
    interpretedGoal: request.userInstruction.trim(),
    finalPrompt,
    preserve,
    changes: unique([request.userInstruction.trim(), background && `background: ${background}`]),
    avoid,
    suggestedModel: model,
    suggestedQuality: quality,
    suggestedSize: size,
    suggestedRatio: ratio,
    suggestedBackground: background,
    suggestedLighting: lighting,
    ...cost,
    warnings,
    riskLevel: request.operation === "image-generation" ? "high" : request.operation === "product-ad" ? "medium" : "low",
    requiresConfirmation: true,
    contextSources: {
      productDNAUsed: Boolean(product),
      echoMemoryUsed: Boolean(memory && (memory.acceptedPreferences.length || Object.keys(memory.successfulSettings).length)),
      userInstructionUsed: true,
    },
  };
}

import type { SmartProductSpecifications } from "./echoProductDNA";
import type { SmartEditOptions } from "./echoGuide";

export function buildEchoImagePrompt(productDNA: SmartProductSpecifications, options: SmartEditOptions, instruction: string) {
  const protectedFeatures = [
    "current product identity",
    "exact input-image color",
    "exact input-image shape",
    "exact input-image texture",
    "petal and surface details",
    "visible wick",
    "camera angle",
    "orientation",
    "dimensions and proportions",
  ];
  const transparentBackgroundInstructions = options.background?.mode === "transparent"
    ? [
      "Edit the supplied image only.",
      "Remove only the existing background and make it fully transparent.",
      "Preserve the exact same product shown in the input image.",
      "Preserve its exact color, texture, surface details, arrangement, proportions, camera angle, orientation, imperfections, highlights, and shadows on the product.",
      "Preserve the complete visible wick exactly as shown.",
      "Do not recolor the product. Do not redesign its shape. Do not generate a replacement product.",
      "Do not use a remembered or reference product image. Do not remove, shorten, or relocate the wick.",
      "Return the isolated original product as a transparent PNG.",
    ].join(" ")
    : "";
  return [
    "The supplied image is the only source of pixels and visual product identity. Product DNA is text-only reference metadata; it is not a visual source. If Product DNA conflicts with the supplied image, the supplied image always wins.",
    "Do not synthesize a new product. Modify the uploaded pixels.",
    `Reference Product DNA only: category=${productDNA.categoryId}; product=${productDNA.productType}; shape=${productDNA.shape}; material=${productDNA.material}; color=${productDNA.color}; wick=${productDNA.hasWick ? "present" : "not present"}.`,
    `Protected features: ${protectedFeatures.join(", ")}.`,
    `Preservation rules: ${options.preserveShape ? "preserve exact shape and proportions;" : ""} ${options.preserveDetails ? "preserve handcrafted details and physical construction;" : ""} always preserve the visible wick; do not invent objects.`,
    `Requested edits: background=${options.background?.mode ?? "unchanged"}; colors=${options.colors?.mode ?? "unchanged"}; lighting=${options.lighting?.mode ?? "unchanged"}; shadows=${options.shadows?.mode ?? "unchanged"}; quality=${options.improveQuality ? "improve naturally" : "unchanged"}; instruction=${instruction || "none"}.`,
    options.background?.mode === "transparent" ? "Output must be PNG with a genuine alpha channel." : `Output purpose: ${options.output?.purpose ?? "product-card"}; aspect ratio=${options.output?.aspectRatio ?? "original"}.`,
    transparentBackgroundInstructions,
    "Do not add text or logos. Do not redesign the product or alter its physical construction.",
  ].filter(Boolean).join("\n\n");
}

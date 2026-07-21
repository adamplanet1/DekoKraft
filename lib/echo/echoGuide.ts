import type { SmartProductSpecifications } from "./echoProductDNA";

export type BackgroundMode = "original" | "white" | "black" | "blurred" | "glass" | "transparent" | "custom";
export type ColorMode = "preserve" | "enhance" | "warm" | "cool" | "monochrome" | "custom";
export type LightingMode = "original" | "natural" | "soft-studio" | "bright" | "dramatic";
export type ShadowMode = "preserve" | "soften" | "reduce" | "remove";
export type EchoUserRole = "artisan" | "visitor" | "admin";
export type EchoGuideIntent = "image_edit" | "product_improvement" | "gift_selection" | "quality_review" | "learning_support" | "general_guidance";
export type SmartEditFlowStatus = "idle" | "editing-request" | "waiting-confirmation" | "confirmed" | "generating" | "generated" | "failed" | "provider-not-connected";

export type SmartEditOptions = {
  background?: { mode: BackgroundMode; customColor?: string };
  colors?: { mode: ColorMode; customColor?: string };
  lighting?: { mode: LightingMode; strength: number };
  shadows?: { mode: ShadowMode; strength: number };
  preserveShape: boolean;
  preserveDetails: boolean;
  improveQuality: boolean;
  output?: { purpose: "product-card" | "advertisement" | "catalog" | "social-media" | "gift-preview"; aspectRatio: "original" | "1:1" | "4:5" | "16:9" };
};

export const echoCapabilities = {
  smartImageEdit: true,
  giftAdvisor: true,
  qualityReview: true,
  learningCoach: false,
  embroideryCoach: false,
  scan3DCoach: false,
  laserCoach: false,
} as const;

export function detectEchoIntent(message: string, role: EchoUserRole): EchoGuideIntent {
  const value = message.toLowerCase();
  if (role === "visitor" || /gift|هدية|geschenk|cadeau|budget|ميزانية/.test(value)) return "gift_selection";
  if (/quality|جودة|qualität|qualité|راجع/.test(value)) return "quality_review";
  if (/علمني|كيف|learn|teach|lernen|apprendre/.test(value)) return "learning_support";
  if (/جميل|أجمل|improve|verbesser|amélior/.test(value)) return "product_improvement";
  if (/background|خلفية|لون|إضاءة|ظل|edit|hintergrund|arrière-plan/.test(value)) return "image_edit";
  return role === "admin" ? "quality_review" : "general_guidance";
}

export function buildEchoConfirmationSummary({ productDNA, smartEditOptions, userInstruction }: {
  productDNA: SmartProductSpecifications;
  smartEditOptions: SmartEditOptions;
  userInstruction: string;
}) {
  const changes = [
    smartEditOptions.background && `background: ${smartEditOptions.background.mode}`,
    smartEditOptions.colors && `colors: ${smartEditOptions.colors.mode}`,
    smartEditOptions.lighting && `lighting: ${smartEditOptions.lighting.mode} (${smartEditOptions.lighting.strength}%)`,
    smartEditOptions.shadows && `shadows: ${smartEditOptions.shadows.mode} (${smartEditOptions.shadows.strength}%)`,
    smartEditOptions.improveQuality && "quality enhancement",
    userInstruction.trim(),
  ].filter(Boolean) as string[];
  const protectedProperties = [smartEditOptions.preserveShape && productDNA.shape, smartEditOptions.preserveDetails && productDNA.material, productDNA.hasWick && "wick"].filter(Boolean) as string[];
  return {
    intent: detectEchoIntent(userInstruction || changes.join(" "), "artisan"),
    understood: `Preserve ${productDNA.productType} identity and apply ${changes.join(", ") || "the selected improvements"}.`,
    changes,
    protectedProperties,
    purpose: smartEditOptions.output?.purpose ?? "product-card",
    aspectRatio: smartEditOptions.output?.aspectRatio ?? "original",
  };
}

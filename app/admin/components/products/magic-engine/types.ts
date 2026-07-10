export type ProductHealthLevel = "weak" | "fair" | "good" | "excellent";

export type MagicConfidenceLevel = "low" | "medium" | "high" | "veryHigh";

export type EstimatedTimeToPublishId =
  | "ready"
  | "oneSmallItem"
  | "mediumItems"
  | "severalItems"
  | "almostEmpty";

export type PublishChecklistItemId =
  | "has-product-name"
  | "has-category"
  | "has-price"
  | "has-description"
  | "has-at-least-one-image"
  | "has-main-image"
  | "product-health-is-good"
  | "no-high-priority-recommendations";

export type RecommendationPriority = "high" | "medium" | "low";

export type RecommendationId =
  | "no-images-uploaded"
  | "add-main-product-image"
  | "description-too-short"
  | "missing-category"
  | "missing-price"
  | "more-gallery-images"
  | "add-seo-keywords"
  | "add-image-alt-text"
  | "product-card-ready"
  | "product-can-be-published"
  | "product-health-below-good"
  | "ready-for-final-review";

export type AutoFixStatus = "suggested" | "notAvailable";

export type NextBestActionId =
  | "add-product-name"
  | "choose-category"
  | "improve-description"
  | "add-price"
  | "upload-product-image"
  | "select-main-image"
  | "improve-product-details"
  | "ready-for-final-review";

export type MarketDemandLevel = "low" | "medium" | "high" | "very-high";

export type MarketAudienceId =
  | "gift-buyers"
  | "parents"
  | "teachers"
  | "students"
  | "diy-makers"
  | "hobbyists"
  | "collectors"
  | "home-decor"
  | "wedding"
  | "repair"
  | "workshop"
  | "small-business"
  | "artists"
  | "pet-lovers"
  | "seasonal-buyers"
  | "general-buyers";

export type AudienceReasonId =
  | "handmade-product"
  | "gift-category"
  | "decorative-keywords"
  | "educational-purpose"
  | "craft-keywords"
  | "tool-keywords"
  | "repair-keywords"
  | "wedding-keywords"
  | "pet-keywords"
  | "seasonal-keywords"
  | "business-keywords"
  | "collector-keywords"
  | "price-signal"
  | "general-match";

export type MarketMarketplaceId =
  | "etsy"
  | "ebay"
  | "amazon-handmade"
  | "kleinanzeigen"
  | "facebook-marketplace"
  | "instagram"
  | "pinterest"
  | "local-marketplace"
  | "own-shop";

export type MarketplaceReasonId =
  | "handmade-market-fit"
  | "decor-market-fit"
  | "repair-market-fit"
  | "visual-market-fit"
  | "local-simple-product"
  | "brand-ready-product"
  | "incomplete-product"
  | "audience-market-fit"
  | "price-market-fit";

export type PricingReasonId =
  | "current-price-used"
  | "premium-supported"
  | "repair-practical-pricing"
  | "low-health-confidence"
  | "marketplace-fit"
  | "audience-fit"
  | "missing-price";

export type DemandReasonId =
  | "strong-product-health"
  | "weak-product-health"
  | "audience-confidence"
  | "marketplace-confidence"
  | "pricing-confidence"
  | "price-missing"
  | "image-ready"
  | "image-missing"
  | "seasonal-keywords"
  | "gift-keywords"
  | "decor-keywords"
  | "repair-keywords"
  | "education-keywords";

export type FastSaleChance = "low" | "medium" | "high" | "very-high";

export type FastSaleReasonId =
  | "publish-ready"
  | "not-publish-ready"
  | "strong-demand"
  | "weak-demand"
  | "marketplace-confidence"
  | "pricing-confidence"
  | "image-ready"
  | "image-missing"
  | "price-present"
  | "price-missing"
  | "gift-decor-keywords"
  | "repair-keywords"
  | "education-keywords"
  | "strong-product-health"
  | "weak-product-health";

export type PreviewImage = {
  role?: string;
};

export type MagicEnginePreviewInput = {
  productName: string;
  productCategory: string;
  productPrice: string;
  productDescription: string;
  images: PreviewImage[];
};

export type PublishChecklistItem = {
  id: PublishChecklistItemId;
  passed: boolean;
};

export type MagicRecommendation = {
  id: RecommendationId;
  priority: RecommendationPriority;
};

export type AutoFixPlanAction = {
  id: NextBestActionId;
  status: AutoFixStatus;
};

export type AudiencePredictionResult = {
  primaryAudience: MarketAudienceId;
  secondaryAudiences: MarketAudienceId[];
  confidence: number;
  reasons: AudienceReasonId[];
};

export type MarketplacePredictionResult = {
  bestMarketplace: MarketMarketplaceId;
  alternativeMarketplaces: MarketMarketplaceId[];
  confidence: number;
  reasons: MarketplaceReasonId[];
};

export type PricingPredictionResult = {
  recommendedPrice: string | null;
  aggressivePrice: string | null;
  premiumPrice: string | null;
  wholesalePrice: string | null;
  pricingConfidence: number;
  reasons: PricingReasonId[];
};

export type DemandPredictionResult = {
  demandLevel: MarketDemandLevel;
  demandConfidence: number;
  reasons: DemandReasonId[];
};

export type FastSalePredictionResult = {
  chance: FastSaleChance;
  confidence: number;
  reasons: FastSaleReasonId[];
};

export type MarketOpportunitySummaryId =
  | "strong-opportunity"
  | "moderate-opportunity"
  | "low-opportunity";

export type MarketingTipId =
  | "add-basics-first"
  | "gift-lifestyle-photos"
  | "repair-use-case"
  | "pinterest-home-decor"
  | "education-classroom"
  | "marketplace-story"
  | "premium-brand-story";

export type MarketingTipReasonId =
  | "missing-price-or-image"
  | "gift-audience"
  | "repair-audience"
  | "visual-marketplace"
  | "education-audience"
  | "marketplace-match"
  | "premium-opportunity";

export type MarketingTipResult = {
  tip: MarketingTipId;
  reason: MarketingTipReasonId;
};

export type MarketingChannelId =
  | "instagram-reels"
  | "pinterest"
  | "facebook-groups"
  | "facebook-marketplace"
  | "etsy-search"
  | "ebay-search"
  | "whatsapp"
  | "own-shop-content"
  | "local-community";

export type MarketingChannelReasonId =
  | "visual-product"
  | "repair-search"
  | "education-community"
  | "local-simple-product"
  | "own-shop-ready"
  | "etsy-marketplace-fit"
  | "direct-local-sharing";

export type MarketingChannelPredictionResult = {
  channel: MarketingChannelId;
  confidence: number;
  reason: MarketingChannelReasonId;
};

export type CompetitionLevel = "low" | "medium" | "high";

export type CompetitionReasonId =
  | "personalization-detected"
  | "handmade-differentiation"
  | "repair-part-niche"
  | "educational-niche"
  | "decorative-common"
  | "customizable-option"
  | "niche-keywords"
  | "broad-category";

export type CompetitionPredictionResult = {
  competitionLevel: CompetitionLevel;
  differentiationScore: number;
  confidence: number;
  reasons: CompetitionReasonId[];
};

export type BusinessRecommendationId =
  | "publish-now"
  | "improve-product-first"
  | "add-price-first"
  | "improve-images-first"
  | "focus-on-etsy"
  | "focus-on-ebay"
  | "focus-on-instagram"
  | "lower-price"
  | "premium-positioning"
  | "niche-positioning";

export type BusinessRecommendationReasonId =
  | "missing-price"
  | "image-readiness"
  | "strong-demand"
  | "weak-market-readiness"
  | "marketplace-fit"
  | "repair-market-fit"
  | "visual-channel-fit"
  | "pricing-pressure"
  | "premium-fit"
  | "niche-advantage";

export type BusinessRecommendationResult = {
  recommendation: BusinessRecommendationId;
  confidence: number;
  reasons: BusinessRecommendationReasonId[];
};

export type MarketPotential = {
  magicScore: number;
  opportunitySummary: MarketOpportunitySummaryId;
  marketingTip: MarketingTipResult;
  marketingChannel: MarketingChannelPredictionResult;
  competitionPrediction: CompetitionPredictionResult;
  businessRecommendation: BusinessRecommendationResult;
  expectedDemand: MarketDemandLevel;
  demandPrediction: DemandPredictionResult;
  audiencePrediction: AudiencePredictionResult;
  marketplacePrediction: MarketplacePredictionResult;
  pricingPrediction: PricingPredictionResult;
  fastSalePrediction: FastSalePredictionResult;
  bestMarketplace: MarketMarketplaceId;
  recommendedPrice: string | null;
  chanceOfFastSale: FastSaleChance;
};

// Magic Engine preview calculations live here only; UI components receive props
// and should not calculate product state.
import {
  type AudiencePredictionResult,
  type AudienceReasonId,
  type AutoFixPlanAction,
  type BusinessRecommendationId,
  type BusinessRecommendationReasonId,
  type BusinessRecommendationResult,
  type CompetitionLevel,
  type CompetitionPredictionResult,
  type CompetitionReasonId,
  type DemandPredictionResult,
  type DemandReasonId,
  type EstimatedTimeToPublishId,
  type FastSalePredictionResult,
  type FastSaleReasonId,
  type MagicConfidenceLevel,
  type MagicEnginePreviewInput,
  type MagicRecommendation,
  type MarketAudienceId,
  type MarketDemandLevel,
  type MarketMarketplaceId,
  type MarketOpportunitySummaryId,
  type MarketPotential,
  type MarketingChannelId,
  type MarketingChannelPredictionResult,
  type MarketingChannelReasonId,
  type MarketingTipResult,
  type MarketplacePredictionResult,
  type MarketplaceReasonId,
  type NextBestActionId,
  type PricingPredictionResult,
  type PricingReasonId,
  type ProductHealthLevel,
  type PublishChecklistItem,
} from "./magic-engine/types";

export {
  type AudiencePredictionResult,
  type AudienceReasonId,
  type AutoFixPlanAction,
  type BusinessRecommendationId,
  type BusinessRecommendationReasonId,
  type BusinessRecommendationResult,
  type CompetitionLevel,
  type CompetitionPredictionResult,
  type CompetitionReasonId,
  type DemandPredictionResult,
  type DemandReasonId,
  type AutoFixStatus,
  type EstimatedTimeToPublishId,
  type FastSalePredictionResult,
  type FastSaleReasonId,
  type FastSaleChance,
  type MagicConfidenceLevel,
  type MagicEnginePreviewInput,
  type MagicRecommendation,
  type MarketAudienceId,
  type MarketDemandLevel,
  type MarketMarketplaceId,
  type MarketOpportunitySummaryId,
  type MarketPotential,
  type MarketingChannelId,
  type MarketingChannelPredictionResult,
  type MarketingChannelReasonId,
  type MarketingTipId,
  type MarketingTipReasonId,
  type MarketingTipResult,
  type MarketplacePredictionResult,
  type MarketplaceReasonId,
  type NextBestActionId,
  type PricingPredictionResult,
  type PricingReasonId,
  type PreviewImage,
  type ProductHealthLevel,
  type PublishChecklistItem,
  type PublishChecklistItemId,
  type RecommendationId,
  type RecommendationPriority,
} from "./magic-engine/types";

function includesAnyKeyword(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

type AudiencePredictionInput = {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  price?: string;
};

type AudienceRule = {
  audience: MarketAudienceId;
  keywords: string[];
  reason: AudienceReasonId;
};

const audienceRules: AudienceRule[] = [
  {
    audience: "gift-buyers",
    keywords: ["gift", "present", "هدية", "geschenk", "cadeau", "candle", "شمعة", "kerze", "bougie"],
    reason: "gift-category",
  },
  {
    audience: "home-decor",
    keywords: ["decor", "decoration", "home", "ديكور", "منزل", "deko", "décor", "maison", "wall art"],
    reason: "decorative-keywords",
  },
  {
    audience: "wedding",
    keywords: ["wedding", "bride", "bridal", "زفاف", "hochzeit", "mariage", "candle"],
    reason: "wedding-keywords",
  },
  {
    audience: "hobbyists",
    keywords: ["embroidery", "craft", "hobby", "stitch", "تطريز", "basteln", "broderie"],
    reason: "craft-keywords",
  },
  {
    audience: "small-business",
    keywords: ["embroidery", "custom", "logo", "packaging", "small business", "brand", "shop"],
    reason: "business-keywords",
  },
  {
    audience: "artists",
    keywords: ["embroidery", "art", "artist", "paint", "creative", "فن", "kunst", "artiste"],
    reason: "craft-keywords",
  },
  {
    audience: "diy-makers",
    keywords: ["laser", "diy", "maker", "kit", "mdf", "wood", "خشب", "werkzeug", "bricolage"],
    reason: "tool-keywords",
  },
  {
    audience: "workshop",
    keywords: ["laser", "tool", "workshop", "repair", "part", "mdf", "ورشة", "atelier", "werkstatt"],
    reason: "tool-keywords",
  },
  {
    audience: "repair",
    keywords: ["replacement", "spare", "part", "repair", "fix", "إصلاح", "قطعة", "ersatz", "réparation"],
    reason: "repair-keywords",
  },
  {
    audience: "parents",
    keywords: ["game", "kids", "children", "child", "school", "mdf game", "لعبة", "kind", "enfant"],
    reason: "educational-purpose",
  },
  {
    audience: "teachers",
    keywords: ["teacher", "classroom", "educational", "learning", "school", "game", "تعليمي", "schule", "école"],
    reason: "educational-purpose",
  },
  {
    audience: "students",
    keywords: ["student", "learning", "school", "study", "educational", "game", "طالب", "étudiant"],
    reason: "educational-purpose",
  },
  {
    audience: "collectors",
    keywords: ["collectible", "limited", "vintage", "rare", "collector", "مجموعة", "sammler", "collection"],
    reason: "collector-keywords",
  },
  {
    audience: "pet-lovers",
    keywords: ["pet", "dog", "cat", "animal", "حيوان", "hund", "katze", "chien", "chat"],
    reason: "pet-keywords",
  },
  {
    audience: "seasonal-buyers",
    keywords: ["christmas", "ramadan", "eid", "seasonal", "holiday", "عيد", "weihnachten", "noël"],
    reason: "seasonal-keywords",
  },
];

function addAudienceScore(
  scores: Record<MarketAudienceId, number>,
  reasons: AudienceReasonId[],
  audience: MarketAudienceId,
  points: number,
  reason: AudienceReasonId
) {
  scores[audience] += points;

  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

export function predictTargetAudience({
  title,
  description,
  category,
  tags = [],
  price,
}: AudiencePredictionInput): AudiencePredictionResult {
  const searchText = [title, description, category, ...tags]
    .join(" ")
    .toLowerCase();
  const scores: Record<MarketAudienceId, number> = {
    "gift-buyers": 0,
    parents: 0,
    teachers: 0,
    students: 0,
    "diy-makers": 0,
    hobbyists: 0,
    collectors: 0,
    "home-decor": 0,
    wedding: 0,
    repair: 0,
    workshop: 0,
    "small-business": 0,
    artists: 0,
    "pet-lovers": 0,
    "seasonal-buyers": 0,
    "general-buyers": 1,
  };
  const reasons: AudienceReasonId[] = [];

  audienceRules.forEach((rule) => {
    const matches = rule.keywords.filter((keyword) =>
      searchText.includes(keyword)
    ).length;

    if (matches > 0) {
      addAudienceScore(scores, reasons, rule.audience, matches * 2, rule.reason);
    }
  });

  if (includesAnyKeyword(searchText, ["handmade", "يدوي", "handgemacht", "fait main", "artisan"])) {
    addAudienceScore(scores, reasons, "gift-buyers", 1, "handmade-product");
    addAudienceScore(scores, reasons, "small-business", 1, "handmade-product");
  }

  const numericPrice = Number(price);
  if (numericPrice > 0) {
    const priceAudience: MarketAudienceId =
      numericPrice >= 75 ? "collectors" : "gift-buyers";
    addAudienceScore(scores, reasons, priceAudience, 1, "price-signal");
  }

  const rankedAudiences = (Object.entries(scores) as Array<
    [MarketAudienceId, number]
  >).sort((first, second) => second[1] - first[1]);
  const [primaryAudience, primaryScore] = rankedAudiences[0];
  const secondaryAudiences = rankedAudiences
    .filter(([audience, score]) => audience !== primaryAudience && score > 0)
    .slice(0, 3)
    .map(([audience]) => audience);
  const confidence = Math.max(
    20,
    Math.min(95, Math.round(primaryScore * 18 + secondaryAudiences.length * 6))
  );

  if (reasons.length === 0) {
    reasons.push("general-match");
  }

  return {
    primaryAudience,
    secondaryAudiences,
    confidence,
  reasons: reasons.slice(0, 4),
  };
}

type MarketplacePredictionInput = {
  title: string;
  description: string;
  category: string;
  price?: string;
};

function addMarketplaceScore(
  scores: Record<MarketMarketplaceId, number>,
  reasons: MarketplaceReasonId[],
  marketplace: MarketMarketplaceId,
  points: number,
  reason: MarketplaceReasonId
) {
  scores[marketplace] += points;

  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

export function predictBestMarketplace(
  { title, description, category, price }: MarketplacePredictionInput,
  audiencePrediction: AudiencePredictionResult
): MarketplacePredictionResult {
  const searchText = [title, description, category].join(" ").toLowerCase();
  const numericPrice = Number(price);
  const hasCoreProductData =
    Boolean(title.trim()) &&
    Boolean(category.trim()) &&
    description.trim().length >= 40;
  const scores: Record<MarketMarketplaceId, number> = {
    etsy: 0,
    "amazon-handmade": 0,
    ebay: 0,
    kleinanzeigen: 0,
    "facebook-marketplace": 0,
    instagram: 0,
    pinterest: 0,
    "local-marketplace": 1,
    "own-shop": 0,
  };
  const reasons: MarketplaceReasonId[] = [];
  const allAudiences = [
    audiencePrediction.primaryAudience,
    ...audiencePrediction.secondaryAudiences,
  ];

  if (!hasCoreProductData) {
    addMarketplaceScore(
      scores,
      reasons,
      "local-marketplace",
      8,
      "incomplete-product"
    );
  }

  if (
    includesAnyKeyword(searchText, [
      "handmade",
      "يدوي",
      "handgemacht",
      "fait main",
      "artisan",
    ])
  ) {
    addMarketplaceScore(scores, reasons, "etsy", 5, "handmade-market-fit");
    addMarketplaceScore(
      scores,
      reasons,
      "amazon-handmade",
      4,
      "handmade-market-fit"
    );
  }

  if (
    includesAnyKeyword(searchText, [
      "decor",
      "decoration",
      "candle",
      "gift",
      "شمعة",
      "هدية",
      "deko",
      "bougie",
      "cadeau",
    ]) ||
    allAudiences.some((audience) =>
      ["gift-buyers", "home-decor", "wedding"].includes(audience)
    )
  ) {
    addMarketplaceScore(scores, reasons, "etsy", 4, "decor-market-fit");
    addMarketplaceScore(scores, reasons, "instagram", 4, "visual-market-fit");
    addMarketplaceScore(scores, reasons, "pinterest", 3, "visual-market-fit");
  }

  if (
    includesAnyKeyword(searchText, [
      "repair",
      "replacement",
      "spare",
      "part",
      "tool",
      "إصلاح",
      "ersatz",
      "réparation",
      "werkzeug",
    ]) ||
    allAudiences.some((audience) =>
      ["repair", "workshop"].includes(audience)
    )
  ) {
    addMarketplaceScore(scores, reasons, "ebay", 6, "repair-market-fit");
    addMarketplaceScore(
      scores,
      reasons,
      "kleinanzeigen",
      4,
      "repair-market-fit"
    );
  }

  if (
    (numericPrice > 0 && numericPrice <= 25) ||
    includesAnyKeyword(searchText, ["local pickup", "simple", "basic"])
  ) {
    addMarketplaceScore(
      scores,
      reasons,
      "facebook-marketplace",
      4,
      "local-simple-product"
    );
    addMarketplaceScore(
      scores,
      reasons,
      "kleinanzeigen",
      3,
      "local-simple-product"
    );
  }

  if (
    hasCoreProductData &&
    numericPrice > 0 &&
    audiencePrediction.confidence >= 70
  ) {
    addMarketplaceScore(scores, reasons, "own-shop", 4, "brand-ready-product");
  }

  if (allAudiences.includes("small-business")) {
    addMarketplaceScore(scores, reasons, "own-shop", 2, "audience-market-fit");
    addMarketplaceScore(scores, reasons, "instagram", 2, "audience-market-fit");
  }

  if (numericPrice >= 75) {
    addMarketplaceScore(scores, reasons, "own-shop", 2, "price-market-fit");
    addMarketplaceScore(
      scores,
      reasons,
      "amazon-handmade",
      2,
      "price-market-fit"
    );
  }

  const rankedMarketplaces = (Object.entries(scores) as Array<
    [MarketMarketplaceId, number]
  >).sort((first, second) => second[1] - first[1]);
  const [bestMarketplace, bestScore] = rankedMarketplaces[0];
  const alternativeMarketplaces = rankedMarketplaces
    .filter(
      ([marketplace, score]) => marketplace !== bestMarketplace && score > 0
    )
    .slice(0, 3)
    .map(([marketplace]) => marketplace);
  const confidence = Math.max(
    25,
    Math.min(95, Math.round(bestScore * 12 + alternativeMarketplaces.length * 4))
  );

  return {
    bestMarketplace,
    alternativeMarketplaces,
    confidence,
    reasons: reasons.slice(0, 4),
  };
}

type PricingPredictionInput = {
  title: string;
  description: string;
  category: string;
  price?: string;
  productHealthScore: number;
};

type PricingMarketContext = {
  audiencePrediction: AudiencePredictionResult;
  marketplacePrediction: MarketplacePredictionResult;
};

function formatNicePrice(price: number) {
  const floorPrice = Math.max(0, Math.floor(price));
  const niceEnding = floorPrice >= 10 ? 0.9 : 0.99;

  return (floorPrice + niceEnding).toFixed(2);
}

function addPricingReason(
  reasons: PricingReasonId[],
  reason: PricingReasonId
) {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

export function predictPricingStrategy(
  {
    title,
    description,
    category,
    price,
    productHealthScore,
  }: PricingPredictionInput,
  marketPotential: PricingMarketContext
): PricingPredictionResult {
  const numericPrice = Number(price);
  const searchText = [title, description, category].join(" ").toLowerCase();
  const reasons: PricingReasonId[] = [];

  if (!(numericPrice > 0)) {
    return {
      recommendedPrice: null,
      aggressivePrice: null,
      premiumPrice: null,
      wholesalePrice: null,
      pricingConfidence: 20,
      reasons: ["missing-price"],
    };
  }

  addPricingReason(reasons, "current-price-used");

  if (
    includesAnyKeyword(searchText, [
      "decor",
      "gift",
      "handmade",
      "candle",
      "ديكور",
      "هدية",
      "يدوي",
      "deko",
      "geschenk",
      "handgemacht",
      "décor",
      "cadeau",
      "fait main",
    ]) ||
    ["etsy", "amazon-handmade", "own-shop"].includes(
      marketPotential.marketplacePrediction.bestMarketplace
    )
  ) {
    addPricingReason(reasons, "premium-supported");
  }

  if (
    includesAnyKeyword(searchText, [
      "repair",
      "replacement",
      "part",
      "tool",
      "spare",
      "إصلاح",
      "قطعة",
      "werkzeug",
      "réparation",
    ]) ||
    marketPotential.audiencePrediction.primaryAudience === "repair"
  ) {
    addPricingReason(reasons, "repair-practical-pricing");
  }

  if (productHealthScore < 70) {
    addPricingReason(reasons, "low-health-confidence");
  }

  addPricingReason(reasons, "marketplace-fit");
  addPricingReason(reasons, "audience-fit");

  const confidence = Math.max(
    25,
    Math.min(
      95,
      Math.round(
        productHealthScore * 0.55 +
          marketPotential.marketplacePrediction.confidence * 0.25 +
          marketPotential.audiencePrediction.confidence * 0.2
      )
    )
  );

  return {
    recommendedPrice: formatNicePrice(numericPrice),
    aggressivePrice: formatNicePrice(numericPrice * 0.85),
    premiumPrice: formatNicePrice(numericPrice * 1.25),
    wholesalePrice: formatNicePrice(numericPrice * 0.65),
    pricingConfidence: confidence,
    reasons: reasons.slice(0, 4),
  };
}

type DemandPredictionInput = {
  title: string;
  description: string;
  category: string;
  productHealthScore: number;
  hasPrice: boolean;
  hasAnyImage: boolean;
  hasMainImage: boolean;
};

function addDemandReason(
  reasons: DemandReasonId[],
  reason: DemandReasonId
) {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

export function predictExpectedDemand(
  {
    title,
    description,
    category,
    productHealthScore,
    hasPrice,
    hasAnyImage,
    hasMainImage,
  }: DemandPredictionInput,
  audiencePrediction: AudiencePredictionResult,
  marketplacePrediction: MarketplacePredictionResult,
  pricingPrediction: PricingPredictionResult
): DemandPredictionResult {
  const searchText = [title, description, category].join(" ").toLowerCase();
  let demandScore = Math.round(productHealthScore * 0.35);
  const reasons: DemandReasonId[] = [];

  demandScore += Math.round(audiencePrediction.confidence * 0.2);
  demandScore += Math.round(marketplacePrediction.confidence * 0.2);
  demandScore += Math.round(pricingPrediction.pricingConfidence * 0.15);

  if (productHealthScore >= 70) {
    demandScore += 8;
    addDemandReason(reasons, "strong-product-health");
  } else {
    demandScore -= 10;
    addDemandReason(reasons, "weak-product-health");
  }

  if (audiencePrediction.confidence >= 70) {
    demandScore += 6;
    addDemandReason(reasons, "audience-confidence");
  }

  if (marketplacePrediction.confidence >= 70) {
    demandScore += 6;
    addDemandReason(reasons, "marketplace-confidence");
  }

  if (pricingPrediction.pricingConfidence >= 70) {
    demandScore += 5;
    addDemandReason(reasons, "pricing-confidence");
  }

  if (hasPrice) {
    demandScore += 5;
  } else {
    demandScore -= 10;
    addDemandReason(reasons, "price-missing");
  }

  if (hasAnyImage && hasMainImage) {
    demandScore += 8;
    addDemandReason(reasons, "image-ready");
  } else {
    demandScore -= 8;
    addDemandReason(reasons, "image-missing");
  }

  if (
    includesAnyKeyword(searchText, [
      "christmas",
      "ramadan",
      "eid",
      "seasonal",
      "holiday",
      "عيد",
      "weihnachten",
      "noël",
    ])
  ) {
    demandScore += 7;
    addDemandReason(reasons, "seasonal-keywords");
  }

  if (includesAnyKeyword(searchText, ["gift", "present", "هدية", "geschenk", "cadeau"])) {
    demandScore += 6;
    addDemandReason(reasons, "gift-keywords");
  }

  if (
    includesAnyKeyword(searchText, [
      "decor",
      "decoration",
      "home",
      "candle",
      "ديكور",
      "شمعة",
      "deko",
      "décor",
      "bougie",
    ])
  ) {
    demandScore += 6;
    addDemandReason(reasons, "decor-keywords");
  }

  if (
    includesAnyKeyword(searchText, [
      "repair",
      "replacement",
      "spare",
      "part",
      "tool",
      "إصلاح",
      "ersatz",
      "réparation",
    ])
  ) {
    demandScore += 4;
    addDemandReason(reasons, "repair-keywords");
  }

  if (
    includesAnyKeyword(searchText, [
      "educational",
      "learning",
      "school",
      "teacher",
      "student",
      "game",
      "تعليمي",
      "schule",
      "école",
    ])
  ) {
    demandScore += 5;
    addDemandReason(reasons, "education-keywords");
  }

  const demandConfidence = Math.max(10, Math.min(95, demandScore));
  const demandLevel: MarketDemandLevel =
    demandConfidence >= 85
      ? "very-high"
      : demandConfidence >= 70
        ? "high"
        : demandConfidence >= 40
          ? "medium"
          : "low";

  return {
    demandLevel,
    demandConfidence,
    reasons: reasons.slice(0, 4),
  };
}

type FastSalePredictionInput = {
  title: string;
  description: string;
  category: string;
  productHealthScore: number;
  hasPrice: boolean;
  hasAnyImage: boolean;
  hasMainImage: boolean;
  isPublishReady: boolean;
};

function addFastSaleReason(
  reasons: FastSaleReasonId[],
  reason: FastSaleReasonId
) {
  if (!reasons.includes(reason)) {
    reasons.push(reason);
  }
}

export function predictFastSaleChance(
  {
    title,
    description,
    category,
    productHealthScore,
    hasPrice,
    hasAnyImage,
    hasMainImage,
    isPublishReady,
  }: FastSalePredictionInput,
  audiencePrediction: AudiencePredictionResult,
  marketplacePrediction: MarketplacePredictionResult,
  pricingPrediction: PricingPredictionResult,
  demandPrediction: DemandPredictionResult
): FastSalePredictionResult {
  const searchText = [title, description, category].join(" ").toLowerCase();
  let saleScore = Math.round(productHealthScore * 0.25);
  const reasons: FastSaleReasonId[] = [];

  saleScore += Math.round(demandPrediction.demandConfidence * 0.3);
  saleScore += Math.round(marketplacePrediction.confidence * 0.15);
  saleScore += Math.round(pricingPrediction.pricingConfidence * 0.15);
  saleScore += Math.round(audiencePrediction.confidence * 0.1);

  if (isPublishReady) {
    saleScore += 10;
    addFastSaleReason(reasons, "publish-ready");
  } else {
    saleScore -= 10;
    addFastSaleReason(reasons, "not-publish-ready");
  }

  if (demandPrediction.demandLevel === "very-high") {
    saleScore += 10;
    addFastSaleReason(reasons, "strong-demand");
  } else if (demandPrediction.demandLevel === "high") {
    saleScore += 6;
    addFastSaleReason(reasons, "strong-demand");
  } else if (demandPrediction.demandLevel === "low") {
    saleScore -= 8;
    addFastSaleReason(reasons, "weak-demand");
  }

  if (marketplacePrediction.confidence >= 70) {
    saleScore += 5;
    addFastSaleReason(reasons, "marketplace-confidence");
  }

  if (pricingPrediction.pricingConfidence >= 70) {
    saleScore += 5;
    addFastSaleReason(reasons, "pricing-confidence");
  }

  if (hasAnyImage && hasMainImage) {
    saleScore += 8;
    addFastSaleReason(reasons, "image-ready");
  } else {
    saleScore -= 8;
    addFastSaleReason(reasons, "image-missing");
  }

  if (hasPrice) {
    saleScore += 5;
    addFastSaleReason(reasons, "price-present");
  } else {
    saleScore -= 10;
    addFastSaleReason(reasons, "price-missing");
  }

  if (productHealthScore >= 70) {
    saleScore += 6;
    addFastSaleReason(reasons, "strong-product-health");
  } else {
    saleScore -= 8;
    addFastSaleReason(reasons, "weak-product-health");
  }

  if (
    includesAnyKeyword(searchText, [
      "gift",
      "decor",
      "decoration",
      "candle",
      "هدية",
      "ديكور",
      "شمعة",
      "geschenk",
      "deko",
      "cadeau",
      "décor",
    ])
  ) {
    saleScore += 5;
    addFastSaleReason(reasons, "gift-decor-keywords");
  }

  if (
    includesAnyKeyword(searchText, [
      "repair",
      "replacement",
      "spare",
      "part",
      "tool",
      "إصلاح",
      "قطعة",
      "ersatz",
      "réparation",
    ])
  ) {
    saleScore += 3;
    addFastSaleReason(reasons, "repair-keywords");
  }

  if (
    includesAnyKeyword(searchText, [
      "educational",
      "learning",
      "school",
      "teacher",
      "student",
      "game",
      "تعليمي",
      "schule",
      "école",
    ])
  ) {
    saleScore += 4;
    addFastSaleReason(reasons, "education-keywords");
  }

  const confidence = Math.max(10, Math.min(95, saleScore));
  const chance: FastSaleChance =
    confidence >= 85
      ? "very-high"
      : confidence >= 70
        ? "high"
        : confidence >= 40
          ? "medium"
          : "low";

  return {
    chance,
    confidence,
    reasons: reasons.slice(0, 4),
  };
}

function buildMarketOpportunitySummary({
  magicScore,
  demandPrediction,
  fastSalePrediction,
  hasPrice,
  hasAnyImage,
  hasMainImage,
  hasProductName,
  hasProductCategory,
}: {
  magicScore: number;
  demandPrediction: DemandPredictionResult;
  fastSalePrediction: FastSalePredictionResult;
  hasPrice: boolean;
  hasAnyImage: boolean;
  hasMainImage: boolean;
  hasProductName: boolean;
  hasProductCategory: boolean;
}): MarketOpportunitySummaryId {
  const hasCoreBasics =
    hasProductName && hasProductCategory && hasPrice && hasAnyImage && hasMainImage;

  if (
    magicScore >= 75 &&
    hasCoreBasics &&
    ["high", "very-high"].includes(demandPrediction.demandLevel) &&
    ["high", "very-high"].includes(fastSalePrediction.chance)
  ) {
    return "strong-opportunity";
  }

  if (!hasCoreBasics || magicScore < 40) {
    return "low-opportunity";
  }

  return "moderate-opportunity";
}

function buildActionableMarketingTip({
  primaryAudience,
  bestMarketplace,
  demandLevel,
  hasPrice,
  hasMainImage,
  productHealthScore,
  fastSaleChance,
}: {
  primaryAudience: MarketAudienceId;
  bestMarketplace: MarketMarketplaceId;
  demandLevel: MarketDemandLevel;
  hasPrice: boolean;
  hasMainImage: boolean;
  productHealthScore: number;
  fastSaleChance: FastSaleChance;
}): MarketingTipResult {
  if (!hasPrice || !hasMainImage) {
    return {
      tip: "add-basics-first",
      reason: "missing-price-or-image",
    };
  }

  if (primaryAudience === "repair" || primaryAudience === "workshop") {
    return {
      tip: "repair-use-case",
      reason: "repair-audience",
    };
  }

  if (
    primaryAudience === "home-decor" ||
    bestMarketplace === "pinterest" ||
    bestMarketplace === "instagram"
  ) {
    return {
      tip: "pinterest-home-decor",
      reason: "visual-marketplace",
    };
  }

  if (
    primaryAudience === "parents" ||
    primaryAudience === "teachers" ||
    primaryAudience === "students"
  ) {
    return {
      tip: "education-classroom",
      reason: "education-audience",
    };
  }

  if (
    primaryAudience === "gift-buyers" ||
    primaryAudience === "wedding" ||
    ["high", "very-high"].includes(fastSaleChance)
  ) {
    return {
      tip: "gift-lifestyle-photos",
      reason: "gift-audience",
    };
  }

  if (
    productHealthScore >= 80 &&
    demandLevel !== "low" &&
    bestMarketplace === "own-shop"
  ) {
    return {
      tip: "premium-brand-story",
      reason: "premium-opportunity",
    };
  }

  return {
    tip: "marketplace-story",
    reason: "marketplace-match",
  };
}

function predictMarketingChannel(
  {
    category,
    description,
    title,
    hasPrice,
    hasMainImage,
    productHealthScore,
  }: {
    category: string;
    description: string;
    title: string;
    hasPrice: boolean;
    hasMainImage: boolean;
    productHealthScore: number;
  },
  audiencePrediction: AudiencePredictionResult,
  marketplacePrediction: MarketplacePredictionResult,
  demandPrediction: DemandPredictionResult,
  fastSalePrediction: FastSalePredictionResult
): MarketingChannelPredictionResult {
  const searchText = [title, description, category].join(" ").toLowerCase();
  const primaryAudience = audiencePrediction.primaryAudience;
  let channel: MarketingChannelId = "local-community";
  let confidence = Math.round(
    (audiencePrediction.confidence +
      marketplacePrediction.confidence +
      demandPrediction.demandConfidence +
      fastSalePrediction.confidence) /
      4
  );
  let reason: MarketingChannelReasonId = "direct-local-sharing";

  if (!hasPrice || !hasMainImage) {
    return {
      channel: hasPrice ? "facebook-marketplace" : "whatsapp",
      confidence: Math.max(25, confidence - 20),
      reason: "local-simple-product",
    };
  }

  if (
    marketplacePrediction.bestMarketplace === "own-shop" &&
    productHealthScore >= 80
  ) {
    channel = "own-shop-content";
    confidence += 8;
    reason = "own-shop-ready";
  } else if (
    primaryAudience === "repair" ||
    primaryAudience === "workshop" ||
    includesAnyKeyword(searchText, ["repair", "part", "tool", "replacement"])
  ) {
    channel =
      marketplacePrediction.bestMarketplace === "ebay"
        ? "ebay-search"
        : "facebook-groups";
    confidence += 6;
    reason = "repair-search";
  } else if (
    primaryAudience === "parents" ||
    primaryAudience === "teachers" ||
    primaryAudience === "students"
  ) {
    channel = "facebook-groups";
    confidence += 5;
    reason = "education-community";
  } else if (
    marketplacePrediction.bestMarketplace === "etsy" ||
    marketplacePrediction.bestMarketplace === "amazon-handmade"
  ) {
    channel = "etsy-search";
    confidence += 6;
    reason = "etsy-marketplace-fit";
  } else if (
    primaryAudience === "home-decor" ||
    primaryAudience === "gift-buyers" ||
    primaryAudience === "wedding" ||
    includesAnyKeyword(searchText, ["decor", "gift", "candle", "wedding"])
  ) {
    channel =
      fastSalePrediction.chance === "high" ||
      fastSalePrediction.chance === "very-high"
        ? "instagram-reels"
        : "pinterest";
    confidence += 7;
    reason = "visual-product";
  } else if (
    marketplacePrediction.bestMarketplace === "facebook-marketplace" ||
    marketplacePrediction.bestMarketplace === "kleinanzeigen" ||
    demandPrediction.demandLevel === "low"
  ) {
    channel = "facebook-marketplace";
    confidence += 4;
    reason = "local-simple-product";
  }

  return {
    channel,
    confidence: Math.max(20, Math.min(95, confidence)),
    reason,
  };
}

function predictCompetition({
  category,
  description,
  title,
}: {
  category: string;
  description: string;
  title: string;
}): CompetitionPredictionResult {
  const searchText = [title, description, category].join(" ").toLowerCase();
  const reasons: CompetitionReasonId[] = [];
  let competitionScore = 55;
  let differentiationScore = 45;
  let confidence = 48;

  const addReason = (reason: CompetitionReasonId) => {
    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }
  };

  if (
    includesAnyKeyword(searchText, [
      "personalized",
      "personalised",
      "personalis",
      "name",
      "initial",
      "monogram",
      "custom text",
    ])
  ) {
    competitionScore -= 15;
    differentiationScore += 20;
    confidence += 10;
    addReason("personalization-detected");
  }

  if (
    includesAnyKeyword(searchText, [
      "custom",
      "customizable",
      "customisable",
      "made to order",
      "bespoke",
    ])
  ) {
    competitionScore -= 12;
    differentiationScore += 18;
    confidence += 8;
    addReason("customizable-option");
  }

  if (
    includesAnyKeyword(searchText, [
      "handmade",
      "handcrafted",
      "craft",
      "artisan",
      "embroidered",
      "embroidery",
    ])
  ) {
    competitionScore -= 10;
    differentiationScore += 15;
    confidence += 8;
    addReason("handmade-differentiation");
  }

  if (
    includesAnyKeyword(searchText, [
      "repair",
      "replacement",
      "spare",
      "part",
      "compatible",
      "fix",
    ])
  ) {
    competitionScore -= 15;
    differentiationScore += 18;
    confidence += 10;
    addReason("repair-part-niche");
  }

  if (
    includesAnyKeyword(searchText, [
      "education",
      "educational",
      "teacher",
      "student",
      "classroom",
      "school",
      "learning",
      "montessori",
    ])
  ) {
    competitionScore -= 10;
    differentiationScore += 12;
    confidence += 8;
    addReason("educational-niche");
  }

  if (
    includesAnyKeyword(searchText, [
      "decor",
      "decoration",
      "home",
      "wall art",
      "candle",
      "gift",
      "wedding",
    ])
  ) {
    competitionScore += 12;
    differentiationScore += 5;
    confidence += 6;
    addReason("decorative-common");
  }

  if (
    includesAnyKeyword(searchText, [
      "laser",
      "mdf",
      "engraved",
      "engraving",
      "template",
      "kit",
      "miniature",
      "limited",
      "niche",
    ])
  ) {
    competitionScore -= 12;
    differentiationScore += 16;
    confidence += 8;
    addReason("niche-keywords");
  }

  if (reasons.length === 0) {
    competitionScore += 15;
    differentiationScore -= 10;
    confidence -= 5;
    addReason("broad-category");
  }

  const competitionLevel: CompetitionLevel =
    competitionScore >= 65
      ? "high"
      : competitionScore >= 40
        ? "medium"
        : "low";

  return {
    competitionLevel,
    differentiationScore: Math.max(0, Math.min(100, differentiationScore)),
    confidence: Math.max(20, Math.min(95, confidence)),
    reasons: reasons.slice(0, 4),
  };
}

function buildBusinessRecommendation(
  marketPotential: {
    magicScore: number;
    hasPrice: boolean;
    hasAnyImage: boolean;
    hasMainImage: boolean;
  },
  demandPrediction: DemandPredictionResult,
  marketplacePrediction: MarketplacePredictionResult,
  pricingPrediction: PricingPredictionResult,
  fastSalePrediction: FastSalePredictionResult,
  competitionPrediction: CompetitionPredictionResult
): BusinessRecommendationResult {
  const reasons: BusinessRecommendationReasonId[] = [];
  let recommendation: BusinessRecommendationId = "improve-product-first";
  let confidence = Math.round(
    (demandPrediction.demandConfidence +
      marketplacePrediction.confidence +
      pricingPrediction.pricingConfidence +
      fastSalePrediction.confidence +
      competitionPrediction.confidence) /
      5
  );

  const addReason = (reason: BusinessRecommendationReasonId) => {
    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }
  };

  if (!marketPotential.hasPrice) {
    return {
      recommendation: "add-price-first",
      confidence: Math.max(35, confidence - 15),
      reasons: ["missing-price"],
    };
  }

  if (!marketPotential.hasAnyImage || !marketPotential.hasMainImage) {
    return {
      recommendation: "improve-images-first",
      confidence: Math.max(35, confidence - 10),
      reasons: ["image-readiness"],
    };
  }

  if (
    marketPotential.magicScore >= 85 &&
    ["high", "very-high"].includes(demandPrediction.demandLevel) &&
    ["high", "very-high"].includes(fastSalePrediction.chance)
  ) {
    recommendation = "publish-now";
    confidence += 10;
    addReason("strong-demand");
  } else if (
    competitionPrediction.competitionLevel === "low" &&
    competitionPrediction.differentiationScore >= 70
  ) {
    recommendation = "niche-positioning";
    confidence += 8;
    addReason("niche-advantage");
  } else if (
    pricingPrediction.reasons.includes("premium-supported") &&
    competitionPrediction.differentiationScore >= 60
  ) {
    recommendation = "premium-positioning";
    confidence += 6;
    addReason("premium-fit");
  } else if (
    marketplacePrediction.bestMarketplace === "etsy" ||
    marketplacePrediction.bestMarketplace === "amazon-handmade"
  ) {
    recommendation = "focus-on-etsy";
    confidence += 5;
    addReason("marketplace-fit");
  } else if (
    marketplacePrediction.bestMarketplace === "ebay" ||
    marketplacePrediction.bestMarketplace === "kleinanzeigen"
  ) {
    recommendation = "focus-on-ebay";
    confidence += 5;
    addReason("repair-market-fit");
  } else if (
    marketplacePrediction.bestMarketplace === "instagram" ||
    marketplacePrediction.bestMarketplace === "pinterest"
  ) {
    recommendation = "focus-on-instagram";
    confidence += 5;
    addReason("visual-channel-fit");
  } else if (
    competitionPrediction.competitionLevel === "high" &&
    ["low", "medium"].includes(fastSalePrediction.chance)
  ) {
    recommendation = "lower-price";
    confidence += 4;
    addReason("pricing-pressure");
  } else {
    recommendation = "improve-product-first";
    confidence += marketPotential.magicScore < 60 ? 4 : 0;
    addReason("weak-market-readiness");
  }

  if (
    marketplacePrediction.confidence >= 70 &&
    !reasons.includes("marketplace-fit") &&
    ["focus-on-etsy", "focus-on-instagram"].includes(recommendation)
  ) {
    addReason("marketplace-fit");
  }

  if (
    pricingPrediction.reasons.includes("repair-practical-pricing") &&
    !reasons.includes("repair-market-fit")
  ) {
    addReason("repair-market-fit");
  }

  return {
    recommendation,
    confidence: Math.max(25, Math.min(95, confidence)),
    reasons: reasons.slice(0, 3),
  };
}

export function getProductHealthLevel(score: number): ProductHealthLevel {
  if (score >= 90) {
    return "excellent";
  }

  if (score >= 70) {
    return "good";
  }

  if (score >= 40) {
    return "fair";
  }

  return "weak";
}

export function getMagicConfidenceLevel(score: number): MagicConfidenceLevel {
  if (score >= 90) {
    return "veryHigh";
  }

  if (score >= 70) {
    return "high";
  }

  if (score >= 40) {
    return "medium";
  }

  return "low";
}

export function buildMagicEnginePreviewState({
  productName,
  productCategory,
  productPrice,
  productDescription,
  images,
}: MagicEnginePreviewInput) {
  const hasProductName = Boolean(productName.trim());
  const hasProductDescription = Boolean(productDescription.trim());
  const hasProductCategory = Boolean(productCategory.trim());
  const hasProductPrice = Number(productPrice) > 0;
  const hasAnyImage = images.length > 0;
  const hasMainImage = images.some((image) => image.role === "main");
  const hasGalleryImage = images.some((image) => image.role === "gallery");
  const hasSeoReadiness =
    hasProductName && hasProductCategory && hasProductDescription;
  const productHealthScore =
    (hasProductName ? 10 : 0) +
    (hasProductDescription ? 20 : 0) +
    (hasProductCategory ? 10 : 0) +
    (hasProductPrice ? 10 : 0) +
    (hasAnyImage ? 15 : 0) +
    (hasMainImage ? 10 : 0) +
    (hasGalleryImage ? 10 : 0) +
    (hasSeoReadiness ? 15 : 0);
  const hasGoodProductHealth = productHealthScore >= 70;
  const magicRecommendations: MagicRecommendation[] = [];

  if (!hasAnyImage) {
    magicRecommendations.push({
      id: "no-images-uploaded",
      priority: "high",
    });
  } else if (!hasMainImage) {
    magicRecommendations.push({
      id: "add-main-product-image",
      priority: "high",
    });
  }

  if (!hasProductCategory) {
    magicRecommendations.push({
      id: "missing-category",
      priority: "high",
    });
  }

  if (productDescription.trim().length < 40) {
    magicRecommendations.push({
      id: "description-too-short",
      priority: "medium",
    });
  }

  if (!hasProductPrice) {
    magicRecommendations.push({
      id: "missing-price",
      priority: "high",
    });
  }

  if (!hasGoodProductHealth) {
    magicRecommendations.push({
      id: "product-health-below-good",
      priority: "medium",
    });
  }

  if (magicRecommendations.length === 0) {
    magicRecommendations.push({
      id: "ready-for-final-review",
      priority: "low",
    });
  }

  const autoFixPlanActions: AutoFixPlanAction[] = [];

  if (!hasProductName) {
    autoFixPlanActions.push({
      id: "add-product-name",
      status: "suggested",
    });
  }

  if (!hasProductCategory) {
    autoFixPlanActions.push({
      id: "choose-category",
      status: "suggested",
    });
  }

  if (productDescription.trim().length < 40) {
    autoFixPlanActions.push({
      id: "improve-description",
      status: "suggested",
    });
  }

  if (!hasProductPrice) {
    autoFixPlanActions.push({
      id: "add-price",
      status: "suggested",
    });
  }

  if (!hasAnyImage) {
    autoFixPlanActions.push({
      id: "upload-product-image",
      status: "suggested",
    });
  } else if (!hasMainImage) {
    autoFixPlanActions.push({
      id: "select-main-image",
      status: "suggested",
    });
  }

  if (!hasGoodProductHealth) {
    autoFixPlanActions.push({
      id: "improve-product-details",
      status: "suggested",
    });
  }

  if (autoFixPlanActions.length === 0) {
    autoFixPlanActions.push({
      id: "ready-for-final-review",
      status: "notAvailable",
    });
  }

  const highPriorityRecommendationsCount = magicRecommendations.filter(
    (recommendation) => recommendation.priority === "high"
  ).length;
  const hasHighPriorityRecommendations = highPriorityRecommendationsCount > 0;
  const publishChecklistItems: PublishChecklistItem[] = [
    {
      id: "has-product-name",
      passed: hasProductName,
    },
    {
      id: "has-description",
      passed: hasProductDescription,
    },
    {
      id: "has-category",
      passed: hasProductCategory,
    },
    {
      id: "has-price",
      passed: hasProductPrice,
    },
    {
      id: "has-at-least-one-image",
      passed: hasAnyImage,
    },
    {
      id: "has-main-image",
      passed: hasMainImage,
    },
    {
      id: "product-health-is-good",
      passed: hasGoodProductHealth,
    },
    {
      id: "no-high-priority-recommendations",
      passed: !hasHighPriorityRecommendations,
    },
  ];
  const passedPublishChecklistItems = publishChecklistItems.filter(
    (item) => item.passed
  ).length;
  const publishChecklistProgress = {
    passed: passedPublishChecklistItems,
    total: publishChecklistItems.length,
    percentage: Math.round(
      (passedPublishChecklistItems / publishChecklistItems.length) * 100
    ),
  };
  const magicConfidenceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        productHealthScore * 0.6 +
          publishChecklistProgress.percentage * 0.4 -
          highPriorityRecommendationsCount * 10
      )
    )
  );
  const isPublishReady = publishChecklistItems.every((item) => item.passed);
  const remainingWorkItemsCount = [
    !hasProductName,
    !hasProductCategory,
    productDescription.trim().length < 40,
    !hasProductPrice,
    !hasAnyImage,
    !hasMainImage,
    !hasGoodProductHealth,
  ].filter(Boolean).length;
  const isProductAlmostEmpty =
    !hasProductName &&
    !hasProductCategory &&
    !hasProductDescription &&
    !hasProductPrice &&
    !hasAnyImage;
  const estimatedTimeToPublishId: EstimatedTimeToPublishId = isPublishReady
    ? "ready"
    : isProductAlmostEmpty
      ? "almostEmpty"
      : remainingWorkItemsCount <= 1
        ? "oneSmallItem"
        : remainingWorkItemsCount <= 3
          ? "mediumItems"
          : "severalItems";
  const firstFailedPublishChecklistItem = publishChecklistItems.find(
    (item) => !item.passed
  );
  const completionScore = Math.round(
    (productHealthScore +
      publishChecklistProgress.percentage +
      magicConfidenceScore) /
      3
  );
  const completionScoreColor =
    completionScore >= 90
      ? "#16a34a"
      : completionScore >= 70
        ? "#2563eb"
        : completionScore >= 40
          ? "#f59e0b"
          : "#dc2626";
  const nextBestActionId: NextBestActionId = !hasProductName
    ? "add-product-name"
    : !hasProductCategory
      ? "choose-category"
      : productDescription.trim().length < 40
        ? "improve-description"
        : !hasProductPrice
          ? "add-price"
          : !hasAnyImage
            ? "upload-product-image"
            : !hasMainImage
              ? "select-main-image"
              : !hasGoodProductHealth
                ? "improve-product-details"
                : "ready-for-final-review";
  const marketMagicScore = Math.round(
    (productHealthScore +
      magicConfidenceScore +
      publishChecklistProgress.percentage) /
      3
  );
  const audiencePrediction = predictTargetAudience({
    title: productName,
    description: productDescription,
    category: productCategory,
    tags: [],
    price: productPrice,
  });
  const marketplacePrediction = predictBestMarketplace(
    {
      title: productName,
      description: productDescription,
      category: productCategory,
      price: productPrice,
    },
    audiencePrediction
  );
  const pricingPrediction = predictPricingStrategy(
    {
      title: productName,
      description: productDescription,
      category: productCategory,
      price: productPrice,
      productHealthScore,
    },
    {
      audiencePrediction,
      marketplacePrediction,
    }
  );
  const demandPrediction = predictExpectedDemand(
    {
      title: productName,
      description: productDescription,
      category: productCategory,
      productHealthScore,
      hasPrice: hasProductPrice,
      hasAnyImage,
      hasMainImage,
    },
    audiencePrediction,
    marketplacePrediction,
    pricingPrediction
  );
  const fastSalePrediction = predictFastSaleChance(
    {
      title: productName,
      description: productDescription,
      category: productCategory,
      productHealthScore,
      hasPrice: hasProductPrice,
      hasAnyImage,
      hasMainImage,
      isPublishReady,
    },
    audiencePrediction,
    marketplacePrediction,
    pricingPrediction,
    demandPrediction
  );
  const opportunitySummary = buildMarketOpportunitySummary({
    magicScore: marketMagicScore,
    demandPrediction,
    fastSalePrediction,
    hasPrice: hasProductPrice,
    hasAnyImage,
    hasMainImage,
    hasProductName,
    hasProductCategory,
  });
  const marketingTip = buildActionableMarketingTip({
    primaryAudience: audiencePrediction.primaryAudience,
    bestMarketplace: marketplacePrediction.bestMarketplace,
    demandLevel: demandPrediction.demandLevel,
    hasPrice: hasProductPrice,
    hasMainImage,
    productHealthScore,
    fastSaleChance: fastSalePrediction.chance,
  });
  const marketingChannel = predictMarketingChannel(
    {
      title: productName,
      description: productDescription,
      category: productCategory,
      hasPrice: hasProductPrice,
      hasMainImage,
      productHealthScore,
    },
    audiencePrediction,
    marketplacePrediction,
    demandPrediction,
    fastSalePrediction
  );
  const competitionPrediction = predictCompetition({
    title: productName,
    description: productDescription,
    category: productCategory,
  });
  const businessRecommendation = buildBusinessRecommendation(
    {
      magicScore: marketMagicScore,
      hasPrice: hasProductPrice,
      hasAnyImage,
      hasMainImage,
    },
    demandPrediction,
    marketplacePrediction,
    pricingPrediction,
    fastSalePrediction,
    competitionPrediction
  );
  const marketPotential: MarketPotential = {
    magicScore: marketMagicScore,
    opportunitySummary,
    marketingTip,
    marketingChannel,
    competitionPrediction,
    businessRecommendation,
    expectedDemand: demandPrediction.demandLevel,
    demandPrediction,
    audiencePrediction,
    marketplacePrediction,
    pricingPrediction,
    fastSalePrediction,
    bestMarketplace: marketplacePrediction.bestMarketplace,
    recommendedPrice: hasProductPrice ? productPrice.trim() : null,
    chanceOfFastSale: fastSalePrediction.chance,
  };

  return {
    autoFixPlanActions,
    completionScore,
    completionScoreColor,
    estimatedTimeToPublishId,
    firstFailedPublishChecklistItem,
    isPublishReady,
    magicConfidenceLevel: getMagicConfidenceLevel(magicConfidenceScore),
    magicConfidenceScore,
    magicRecommendations,
    marketPotential,
    nextBestActionId,
    productHealthLevel: getProductHealthLevel(productHealthScore),
    productHealthScore,
    publishChecklistItems,
    publishChecklistProgress,
  };
}

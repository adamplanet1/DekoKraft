import { CardGrid, CardItem, SectionHeader } from "./ui";

type MarketPotentialCardProps = {
  aggressivePrice: string;
  alternativeMarketplaceLabels: string[];
  bestMarketplaceLabel: string;
  businessRecommendationConfidence: number;
  businessRecommendationLabel: string;
  businessRecommendationReasons: string[];
  chanceOfFastSaleLabel: string;
  competitionConfidence: number;
  competitionLevelLabel: string;
  competitionReasons: string[];
  demandConfidence: number;
  demandReasons: string[];
  differentiationScore: number;
  expectedDemandLabel: string;
  fastSaleConfidence: number;
  fastSaleReasons: string[];
  labels: {
    alternativeMarketplaces: string;
    aggressivePrice: string;
    bestMarketplace: string;
    businessRecommendation: string;
    businessRecommendationConfidence: string;
    businessRecommendationWhy: string;
    chanceOfFastSale: string;
    competitionConfidence: string;
    competitionLevel: string;
    competitionWhy: string;
    demandConfidence: string;
    demandWhy: string;
    differentiationScore: string;
    expectedDemand: string;
    fastSaleConfidence: string;
    fastSaleWhy: string;
    magicScore: string;
    marketingChannel: string;
    marketingChannelConfidence: string;
    marketingChannelWhy: string;
    marketingTip: string;
    marketingTipReason: string;
    marketplaceConfidence: string;
    marketplaceWhy: string;
    opportunitySummary: string;
    premiumPrice: string;
    pricingConfidence: string;
    pricingWhy: string;
    predictionConfidence: string;
    primaryAudience: string;
    recommendedPrice: string;
    secondaryAudiences: string;
    wholesalePrice: string;
    why: string;
  };
  magicScore: number;
  marketplaceConfidence: number;
  marketplaceReasons: string[];
  marketingChannel: string;
  marketingChannelConfidence: number;
  marketingChannelReason: string;
  opportunitySummary: string;
  premiumPrice: string;
  marketingTip: string;
  marketingTipReason: string;
  pricingConfidence: number;
  pricingReasons: string[];
  predictionConfidence: number;
  primaryAudienceLabel: string;
  reasons: string[];
  recommendedPrice: string;
  secondaryAudienceLabels: string[];
  title: string;
  wholesalePrice: string;
};

export function MarketPotentialCard({
  aggressivePrice,
  alternativeMarketplaceLabels,
  bestMarketplaceLabel,
  businessRecommendationConfidence,
  businessRecommendationLabel,
  businessRecommendationReasons,
  chanceOfFastSaleLabel,
  competitionConfidence,
  competitionLevelLabel,
  competitionReasons,
  demandConfidence,
  demandReasons,
  differentiationScore,
  expectedDemandLabel,
  fastSaleConfidence,
  fastSaleReasons,
  labels,
  magicScore,
  marketplaceConfidence,
  marketplaceReasons,
  marketingChannel,
  marketingChannelConfidence,
  marketingChannelReason,
  opportunitySummary,
  premiumPrice,
  marketingTip,
  marketingTipReason,
  pricingConfidence,
  pricingReasons,
  predictionConfidence,
  primaryAudienceLabel,
  reasons,
  recommendedPrice,
  secondaryAudienceLabels,
  title,
  wholesalePrice,
}: MarketPotentialCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        <CardItem>
          <span>{labels.opportunitySummary}</span>
          <p>{opportunitySummary}</p>
        </CardItem>
        <CardItem>
          <span>{labels.marketingTip}</span>
          <strong>{marketingTip}</strong>
          <p>{marketingTipReason}</p>
        </CardItem>
        <CardItem>
          <span>{labels.marketingChannel}</span>
          <strong>{marketingChannel}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.marketingChannelConfidence}</span>
          <strong>{marketingChannelConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.marketingChannelWhy}</span>
          <p>{marketingChannelReason}</p>
        </CardItem>
        <CardItem>
          <span>{labels.competitionLevel}</span>
          <strong>{competitionLevelLabel}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.differentiationScore}</span>
          <strong>{differentiationScore}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.competitionConfidence}</span>
          <strong>{competitionConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.businessRecommendation}</span>
          <strong>{businessRecommendationLabel}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.businessRecommendationConfidence}</span>
          <strong>{businessRecommendationConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.magicScore}</span>
          <strong>{magicScore}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.expectedDemand}</span>
          <strong>{expectedDemandLabel}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.demandConfidence}</span>
          <strong>{demandConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.primaryAudience}</span>
          <strong>{primaryAudienceLabel}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.secondaryAudiences}</span>
          <strong>{secondaryAudienceLabels.join(", ")}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.predictionConfidence}</span>
          <strong>{predictionConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.bestMarketplace}</span>
          <strong>{bestMarketplaceLabel}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.alternativeMarketplaces}</span>
          <strong>{alternativeMarketplaceLabels.join(", ")}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.marketplaceConfidence}</span>
          <strong>{marketplaceConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.recommendedPrice}</span>
          <strong>{recommendedPrice}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.aggressivePrice}</span>
          <strong>{aggressivePrice}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.premiumPrice}</span>
          <strong>{premiumPrice}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.wholesalePrice}</span>
          <strong>{wholesalePrice}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.pricingConfidence}</span>
          <strong>{pricingConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.chanceOfFastSale}</span>
          <strong>{chanceOfFastSaleLabel}</strong>
        </CardItem>
        <CardItem>
          <span>{labels.fastSaleConfidence}</span>
          <strong>{fastSaleConfidence}%</strong>
        </CardItem>
        <CardItem>
          <span>{labels.why}</span>
          {reasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </CardItem>
        <CardItem>
          <span>{labels.demandWhy}</span>
          {demandReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </CardItem>
        <CardItem>
          <span>{labels.marketplaceWhy}</span>
          {marketplaceReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </CardItem>
        <CardItem>
          <span>{labels.pricingWhy}</span>
          {pricingReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </CardItem>
        <CardItem>
          <span>{labels.fastSaleWhy}</span>
          {fastSaleReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </CardItem>
        <CardItem>
          <span>{labels.competitionWhy}</span>
          {competitionReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </CardItem>
        <CardItem>
          <span>{labels.businessRecommendationWhy}</span>
          {businessRecommendationReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </CardItem>
      </CardGrid>
    </>
  );
}

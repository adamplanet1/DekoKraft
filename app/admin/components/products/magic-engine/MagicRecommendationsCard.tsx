import {
  type MagicRecommendation,
  type RecommendationId,
  type RecommendationPriority,
} from "./types";
import { CardGrid, CardItem, SectionHeader } from "./ui";

type MagicRecommendationsCardProps = {
  priorities: Record<RecommendationPriority, string>;
  recommendations: MagicRecommendation[];
  recommendationText: Record<
    RecommendationId,
    {
      description: string;
      title: string;
    }
  >;
  title: string;
};

export function MagicRecommendationsCard({
  priorities,
  recommendations,
  recommendationText,
  title,
}: MagicRecommendationsCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        {recommendations.map((recommendation) => (
          <CardItem key={recommendation.id}>
            <span>{priorities[recommendation.priority]}</span>
            <strong>{recommendationText[recommendation.id].title}</strong>
            <p>{recommendationText[recommendation.id].description}</p>
          </CardItem>
        ))}
      </CardGrid>
    </>
  );
}

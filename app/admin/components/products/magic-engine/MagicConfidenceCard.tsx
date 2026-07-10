import { CardGrid, CardItem, SectionHeader } from "./ui";

type MagicConfidenceCardProps = {
  percentage: number;
  title: string;
  levelLabel: string;
};

export function MagicConfidenceCard({
  percentage,
  title,
  levelLabel,
}: MagicConfidenceCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        <CardItem>
          <span>{levelLabel}</span>
          <strong>{percentage}%</strong>
        </CardItem>
      </CardGrid>
    </>
  );
}

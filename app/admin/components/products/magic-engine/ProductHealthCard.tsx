import { CardGrid, CardItem, SectionHeader } from "./ui";

type ProductHealthCardProps = {
  levelLabel: string;
  score: number;
  summary: string;
  title: string;
};

export function ProductHealthCard({
  levelLabel,
  score,
  summary,
  title,
}: ProductHealthCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        <CardItem>
          <span>{levelLabel}</span>
          <strong>{score}%</strong>
          <p>{summary}</p>
        </CardItem>
      </CardGrid>
    </>
  );
}

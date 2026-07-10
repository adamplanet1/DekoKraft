import { CardGrid, CardItem, SectionHeader } from "./ui";

type EstimatedTimeCardProps = {
  explanation: string;
  time: string;
  title: string;
};

export function EstimatedTimeCard({
  explanation,
  time,
  title,
}: EstimatedTimeCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        <CardItem>
          <strong>{time}</strong>
          <p>{explanation}</p>
        </CardItem>
      </CardGrid>
    </>
  );
}

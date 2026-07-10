import { CardGrid, CardItem } from "./ui";

type OverallStatusCardProps = {
  message: string;
  title: string;
};

export function OverallStatusCard({ message, title }: OverallStatusCardProps) {
  return (
    <CardGrid>
      <CardItem>
        <strong>{title}</strong>
        <p>{message}</p>
      </CardItem>
    </CardGrid>
  );
}

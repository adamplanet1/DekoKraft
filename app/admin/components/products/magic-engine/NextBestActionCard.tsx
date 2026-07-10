import { CardGrid, CardItem } from "./ui";

type NextBestActionTone = {
  background: string;
  border: string;
  boxShadow: string;
  color: string;
};

type NextBestActionCardProps = {
  message: string;
  priorityLabel: string;
  title: string;
  tone: NextBestActionTone;
};

export function NextBestActionCard({
  message,
  priorityLabel,
  title,
  tone,
}: NextBestActionCardProps) {
  return (
    <CardGrid>
      <CardItem
        style={{
          background: tone.background,
          border: tone.border,
          boxShadow: tone.boxShadow,
        }}
      >
        <strong>{title}</strong>
        <p>{message}</p>
        <span
          style={{
            color: tone.color,
            fontWeight: 700,
          }}
        >
          {priorityLabel}
        </span>
      </CardItem>
    </CardGrid>
  );
}

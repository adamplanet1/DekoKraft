import { CardGrid, CardItem, SectionHeader } from "./ui";

type MagicProgressCardProps = {
  completed: number;
  helpText: string;
  percentage: number;
  title: string;
  total: number;
};

export function MagicProgressCard({
  completed,
  helpText,
  percentage,
  title,
  total,
}: MagicProgressCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        <CardItem>
          <span>
            {completed} / {total}
          </span>
          <strong>{percentage}%</strong>
          <p>{helpText}</p>
          <div
            aria-hidden="true"
            style={{
              background: "#dbe4f0",
              borderRadius: "999px",
              height: "8px",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              style={{
                background: "#2563eb",
                height: "100%",
                width: `${percentage}%`,
              }}
            />
          </div>
        </CardItem>
      </CardGrid>
    </>
  );
}

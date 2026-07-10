import { CardGrid, CardItem } from "./ui";

type DashboardItem = {
  icon: string;
  title: string;
  value: string;
};

type MagicDashboardProps = {
  completionScore: number;
  completionScoreColor: string;
  completionScoreLabel: string;
  dashboardItems: DashboardItem[];
};

export function MagicDashboard({
  completionScore,
  completionScoreColor,
  completionScoreLabel,
  dashboardItems,
}: MagicDashboardProps) {
  return (
    <CardGrid
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      }}
    >
      <CardItem
        style={{
          alignItems: "center",
          gap: "0.4rem",
          minHeight: "auto",
          padding: "0.75rem",
        }}
      >
        <div
          aria-label={`${completionScoreLabel}: ${completionScore}%`}
          role="img"
          style={{
            alignItems: "center",
            background: `conic-gradient(${completionScoreColor} ${completionScore}%, #dbe4f0 0)`,
            borderRadius: "999px",
            display: "inline-flex",
            height: "64px",
            justifyContent: "center",
            width: "64px",
          }}
        >
          <span
            style={{
              alignItems: "center",
              background: "#ffffff",
              borderRadius: "999px",
              color: completionScoreColor,
              display: "inline-flex",
              fontSize: "0.9rem",
              fontWeight: 800,
              height: "46px",
              justifyContent: "center",
              width: "46px",
            }}
          >
            {completionScore}%
          </span>
        </div>
        <strong
          style={{
            fontSize: "0.8rem",
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          {completionScoreLabel}
        </strong>
      </CardItem>
      {dashboardItems.map((item) => (
        <CardItem
          key={item.title}
          style={{
            gap: "0.25rem",
            minHeight: "auto",
            padding: "0.75rem",
          }}
        >
          <span aria-hidden="true">{item.icon}</span>
          <strong
            style={{
              fontSize: "0.8rem",
              lineHeight: 1.2,
            }}
          >
            {item.title}
          </strong>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
            }}
        >
          {item.value}
        </p>
        </CardItem>
      ))}
    </CardGrid>
  );
}

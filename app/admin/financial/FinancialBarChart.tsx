import type { MonthlyFinancialPoint } from "../../../lib/financial-dashboard/types";

export type FinancialChartMetric = Exclude<keyof MonthlyFinancialPoint, "month">;

export default function FinancialBarChart({
  title,
  points,
  metric,
  formatValue,
  tone,
}: {
  title: string;
  points: MonthlyFinancialPoint[];
  metric: FinancialChartMetric;
  formatValue: (value: number) => string;
  tone: "blue" | "green" | "purple" | "amber" | "navy";
}) {
  const maximum = Math.max(...points.map((point) => point[metric]), 1);

  return (
    <article className={`financialChart financialChart--${tone}`}>
      <h3>{title}</h3>
      <div className="financialChartPlot" role="img" aria-label={title}>
        {points.map((point) => {
          const value = point[metric];
          const height = value > 0 ? Math.max(7, (value / maximum) * 100) : 2;
          return (
            <div className="financialChartColumn" key={`${metric}-${point.month}`} title={`${point.month}: ${formatValue(value)}`}>
              <span className="financialChartValue">{formatValue(value)}</span>
              <span className="financialChartBarTrack" aria-hidden="true">
                <span className="financialChartBar" style={{ height: `${height}%` }} />
              </span>
              <time dateTime={point.month}>{point.month.slice(5)}</time>
            </div>
          );
        })}
      </div>
    </article>
  );
}

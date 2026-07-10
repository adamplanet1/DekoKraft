import { translations, type Lang } from "../../config/translations";

type Props = {
  lang: Lang;
};

export default function Statistics({ lang }: Props) {
  const t = translations[lang];

  const items = [
    {
      icon: "🛒",
      value: 36,
      label: t.dashboard.stats.orders,
    },
    {
      icon: "👥",
      value: 89,
      label: t.dashboard.stats.customers,
    },
    {
      icon: "🖼",
      value: 128,
      label: t.dashboard.stats.gallery,
    },
    {
      icon: "📦",
      value: 245,
      label: t.dashboard.stats.products,
    },
  ];

  return (
    <section className="dkStatsGrid">
      {items.map((item) => (
        <article key={item.label} className="dkStatCard">
          <div className="dkStatIcon">{item.icon}</div>
          <h2>{item.value}</h2>
          <p>{item.label}</p>
        </article>
      ))}
    </section>
  );
}
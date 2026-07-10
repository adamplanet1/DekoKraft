import { translations, type Lang } from "../../config/translations";

type Props = {
  lang: Lang;
  dir: "rtl" | "ltr";
};

export default function Statistics({ lang, dir }: Props) {
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
    <section className="dkStatsGrid" dir={dir}>
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

import { translations, type Lang } from "../../config/translations";
import { type CmsTabId } from "../../config/cmsTabs";

type Props = {
  lang: Lang;
  setActiveTab: (tab: CmsTabId) => void;
};

export default function QuickAccess({
  lang,
  setActiveTab,
}: Props) {
  const t = translations[lang];

  const buttons = [
    {
      id: "products" as CmsTabId,
      label: t.dashboard.quick.products,
    },
    {
      id: "gallery" as CmsTabId,
      label: t.dashboard.quick.gallery,
    },
    {
      id: "backgrounds" as CmsTabId,
      label: t.dashboard.quick.backgrounds,
    },
    {
      id: "colors" as CmsTabId,
      label: t.dashboard.quick.colors,
    },
    {
      id: "statistics" as CmsTabId,
      label: t.dashboard.quick.statistics,
    },
  ];

  return (
    <section className="dkQuickSection">
      <h3>{t.dashboard.quickTitle}</h3>

      <div className="dkQuickGrid">
        {buttons.map((button) => (
          <button
            key={button.id}
            className="dkQuickButton"
            onClick={() => setActiveTab(button.id)}
          >
            {button.label}
          </button>
        ))}
      </div>
    </section>
  );
}
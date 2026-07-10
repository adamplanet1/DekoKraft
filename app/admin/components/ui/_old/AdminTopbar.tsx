// app/admin/components/AdminTopbar.tsx
import { cmsTabs, type CmsTabId } from "../../../config/cmsTabs";
import { translations } from "../../../config/translations";

type Props = {
  activeTab: CmsTabId;
};

export default function AdminTopbar({ activeTab }: Props) {
  const active = cmsTabs.find((tab) => tab.id === activeTab);
  const t = translations.ar;

  return (
    <header className="studioTopbar">
      <div>
        <h1>
          {active?.icon} {active ? t.sidebar[active.id] : ""}
        </h1>
        <p>DekoKraft CMS — منصة إدارة المتجر ومنصة الحرفيين</p>
      </div>

      <div className="studioTopActions">
        <button type="button">AR</button>
        <button type="button">DE</button>
        <button type="button">EN</button>
        <button type="button">⚙️</button>
      </div>
    </header>
  );
}

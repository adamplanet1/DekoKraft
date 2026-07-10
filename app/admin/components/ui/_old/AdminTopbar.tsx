// app/admin/components/AdminTopbar.tsx
import { cmsTabs, type CmsTabId } from '../config/cmsTabs';

type Props = {
  activeTab: CmsTabId;
};

export default function AdminTopbar({ activeTab }: Props) {
  const active = cmsTabs.find((tab) => tab.id === activeTab);

  return (
    <header className="studioTopbar">
      <div>
        <h1>
          {active?.icon} {active?.ar}
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
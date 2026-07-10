"use client";

import Logo from "./Logo";
import { cmsTabs, type CmsTabId } from "../../config/cmsTabs";
import { translations, type Lang } from "../../config/translations";

type Props = {
  activeTab: CmsTabId;
  setActiveTab: (tab: CmsTabId) => void;
  lang: Lang;
};

export default function Sidebar({ activeTab, setActiveTab, lang }: Props) {
  const t = translations[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <aside className="dkSidebar" dir={dir}>
      <Logo />

      <nav className="dkNavigation">
        {cmsTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`dkNavButton ${activeTab === tab.id ? "active" : ""}`}
          >
            <span className="dkNavText">{t.sidebar[tab.id]}</span>
            <span className="dkNavIcon">{tab.icon}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="dkLogout">
        ↩ {lang === "ar" ? "تسجيل خروج" : "Logout"}
      </button>
    </aside>
  );
}

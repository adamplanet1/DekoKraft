import { cmsTabs, type CmsTabId } from "../config/cmsTabs";
import { type Lang } from "../config/translations";

type Props = {
  activeTab: CmsTabId;
  setActiveTab: (tab: CmsTabId) => void;
  lang: Lang;
};

export default function Sidebar({
  activeTab,
  setActiveTab,
  lang,
}: Props) {
  return (
    <aside className="dkSidebar">
      <div className="dkLogoBox">
        <div className="dkLogoIcon">DK</div>

        <h2>DekoKraft</h2>

        <p>Adamplanet | كوكب آدم</p>
      </div>

      <nav className="dkNav">
        {cmsTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "dkNavBtn active"
                : "dkNavBtn"
            }
          >
            <span>
              {lang === "ar"
                ? tab.ar
                : lang === "de"
                ? tab.de
                : lang === "fr"
                ? tab.fr
                : tab.en}
            </span>

            <span className="dkNavIcon">
              {tab.icon}
            </span>
          </button>
        ))}
      </nav>

      <button className="dkLogout" type="button">
        {lang === "ar"
          ? "تسجيل خروج ↩"
          : lang === "de"
          ? "Abmelden ↩"
          : lang === "fr"
          ? "Déconnexion ↩"
          : "Logout ↩"}
      </button>
    </aside>
  );
}
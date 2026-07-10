import { cmsTabs, type CmsTabId } from "../config/cmsTabs";

type Props = {
  activeTab: CmsTabId;
  setActiveTab: (tab: CmsTabId) => void;
};

export default function Sidebar({ activeTab, setActiveTab }: Props) {
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
            className={activeTab === tab.id ? "dkNavBtn active" : "dkNavBtn"}
          >
            <span>{tab.ar}</span>
            <span className="dkNavIcon">{tab.icon}</span>
          </button>
        ))}
      </nav>

      <button className="dkLogout" type="button">
        تسجيل خروج ↩
      </button>
    </aside>
  );
}
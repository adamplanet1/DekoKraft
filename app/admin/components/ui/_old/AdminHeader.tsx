import { cmsTabs, type CmsTabId } from "../config/cmsTabs";

type Lang = "ar" | "fr" | "de" | "en";

type Props = {
  activeTab: CmsTabId;
  lang: Lang;
  setLang: (lang: Lang) => void;
  showLangMenu: boolean;
  setShowLangMenu: (value: boolean) => void;
};

export default function AdminHeader({
  activeTab,
  lang,
  setLang,
  showLangMenu,
  setShowLangMenu,
}: Props) {
  const active = cmsTabs.find((tab) => tab.id === activeTab);

  return (
    <header className="dkHeader">
      <div>
        <h1>
          {active?.ar} {active?.icon}
        </h1>
        <p>DekoKraft CMS — منصة إدارة المتجر ومنصة الحرفيين</p>
      </div>

      <div className="dkHeaderActions">
        <div className="dkLangBox">
          <button
            type="button"
            className="dkLangMain"
            onClick={() => setShowLangMenu(!showLangMenu)}
          >
            {lang.toUpperCase()}⌃
          </button>

          {showLangMenu && (
            <div className="dkLangMenu">
              {(["ar", "fr", "de", "en"] as Lang[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setLang(item);
                    setShowLangMenu(false);
                  }}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="dkSettings">
          ⚙️
        </button>
      </div>
    </header>
  );
}
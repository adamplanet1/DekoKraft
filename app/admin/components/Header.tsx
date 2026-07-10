"use client";

import { useEffect, useRef, useState } from "react";
import { cmsTabs, type CmsTabId } from "../config/cmsTabs";
import { translations, type Lang } from "../config/translations";
import { languageOptions } from "../../../locales";
import { useLanguage } from "../../components/LanguageProvider";

type Props = {
  activeTab?: CmsTabId;
  lang?: Lang;
  setLang?: (lang: Lang) => void;
};

export default function AdminHeader({
  activeTab,
  lang: controlledLang,
  setLang,
}: Props) {
  const { lang: contextLang, setLang: setContextLang, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langBoxRef = useRef<HTMLDivElement>(null);
  const safeLang = controlledLang ?? contextLang;
  const active = cmsTabs.find((tab) => tab.id === activeTab);
  const activeLabel = activeTab ? translations[safeLang].sidebar[activeTab] : "";
  const currentLanguage = languageOptions.find(
    (option) => option.value === safeLang
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        langBoxRef.current &&
        !langBoxRef.current.contains(event.target as Node)
      ) {
        setShowLangMenu(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectLanguage(nextLang: Lang) {
    if (setLang) {
      setLang(nextLang);
    }

    setContextLang(nextLang);
    setShowLangMenu(false);
  }

  return (
    <header className="dkHeader">
      <div>
        <h1>
          {activeLabel} {active?.icon}
        </h1>
        <p>{t.header.cmsDescription}</p>
      </div>

      <div className="dkHeaderActions">
        <div className="dkLangBox" ref={langBoxRef}>
          <button
            type="button"
            className="dkLangMain"
            onClick={() => setShowLangMenu((isOpen) => !isOpen)}
          >
            {currentLanguage?.label ?? "العربية 🇸🇦"}
          </button>

          {showLangMenu && (
            <div className="dkLangMenu">
              {languageOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectLanguage(option.value)}
                >
                  {option.value === safeLang ? "✓ " : ""}
                  {option.label}
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

"use client";

import { useEffect, useRef, useState } from "react";
import { cmsTabs, type CmsTabId } from "../../config/cmsTabs";
import { translations, type Lang } from "../../config/translations";
import {
  languageOptions,
  translations as localeTranslations,
} from "../../../../locales";

type Props = {
  activeTab: CmsTabId;
  lang: Lang;
  setLang: (lang: Lang) => void;
  onAddProduct: () => void;
};

export default function Header({
  activeTab,
  lang,
  setLang,
  onAddProduct,
}: Props) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langBoxRef = useRef<HTMLDivElement>(null);
  const safeLang = lang ?? "ar";
  const active = cmsTabs.find((tab) => tab.id === activeTab);
  const activeLabel = translations[safeLang].sidebar[activeTab];
  const currentLanguage = languageOptions.find(
    (option) => option.value === safeLang
  );
  const addProductLabel = translations[safeLang].addProduct;

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
    setLang(nextLang);
    setShowLangMenu(false);
  }

  return (
    <header className="dkHeader">
      <div className="dkHeaderTitle">
        <h1>
          {active?.icon} {activeLabel}
        </h1>
        <p>{localeTranslations[safeLang].header.cmsDescription}</p>
      </div>

      <div className="dkHeaderActions">
        <button
          type="button"
          className="dkPrimaryButton dkHeaderAddProduct"
          onClick={onAddProduct}
        >
          <span aria-hidden="true">+</span>
          {addProductLabel}
        </button>

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

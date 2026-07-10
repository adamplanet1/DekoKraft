"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getStoredLanguage,
  languageStorageKey,
  translations,
  type Lang,
  type LocaleMessages,
} from "../../locales";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: LocaleMessages;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getStoredLanguage);
  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem(languageStorageKey, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
    }),
    [lang, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}

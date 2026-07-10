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
const initialLanguage: Lang = "ar";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLanguage);
  const [hasHydrated, setHasHydrated] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    setLang(getStoredLanguage());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;

    if (hasHydrated) {
      localStorage.setItem(languageStorageKey, lang);
    }
  }, [hasHydrated, lang]);

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

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
  createTranslator,
  languageStorageKey,
  safeLang,
  translations,
  type Lang,
  type LocaleMessages,
  type Translator,
} from "../../locales";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  direction: LocaleMessages["dir"];
  dictionary: LocaleMessages;
  t: Translator;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const initialLanguage: Lang = "ar";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLanguage);
  const [hasHydrated, setHasHydrated] = useState(false);
  const dictionary = translations[lang];
  const t = useMemo(() => createTranslator(lang), [lang]);

  useEffect(() => {
    setLang(getStoredLanguage());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dictionary.dir;

    if (hasHydrated) {
      try {
        localStorage.setItem(languageStorageKey, lang);
      } catch {
        // The language still works in memory when storage is unavailable.
      }
    }
  }, [dictionary.dir, hasHydrated, lang]);

  useEffect(() => {
    const syncLanguage = (event: StorageEvent) => {
      if (event.key === languageStorageKey && event.newValue) {
        setLang(safeLang(event.newValue));
      }
    };

    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      direction: dictionary.dir,
      dictionary,
      t,
    }),
    [dictionary, lang, t]
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

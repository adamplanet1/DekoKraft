import { ar } from "./ar";
import { de } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { type LanguageOption, type Lang, type LocaleMessages } from "./types";

export type { Direction, LanguageOption, Lang, LocaleMessages } from "./types";

export const languageStorageKey = "dekokraft-lang";

export const languageOptions: LanguageOption[] = [
  { value: "ar", label: "🇸🇦 العربية" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "en", label: "🇬🇧 English" },
  { value: "fr", label: "🇫🇷 Français" },
];

export const translations: Record<Lang, LocaleMessages> = {
  ar,
  de,
  en,
  fr,
};

export function isLang(value: string | null): value is Lang {
  return value === "ar" || value === "de" || value === "en" || value === "fr";
}

export function getTextDirection(lang: Lang) {
  return translations[lang].dir;
}

export function getStoredLanguage(): Lang {
  if (typeof window === "undefined") {
    return "ar";
  }

  const savedLang = localStorage.getItem(languageStorageKey);

  return isLang(savedLang) ? savedLang : "ar";
}

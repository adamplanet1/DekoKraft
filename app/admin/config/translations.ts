import {
  translations as localeTranslations,
  type Lang,
} from "../../../locales";

export type { Lang };

export const translations = {
  ar: localeTranslations.ar.admin,
  de: localeTranslations.de.admin,
  en: localeTranslations.en.admin,
  fr: localeTranslations.fr.admin,
} as const satisfies Record<Lang, (typeof localeTranslations)[Lang]["admin"]>;

"use client";

import { getLocalizedValue, type LocalizedValue } from "../../locales";
import { useLanguage } from "./LanguageProvider";

export default function LocalizedValueText({ value }: { value: LocalizedValue<string> }) {
  const { lang } = useLanguage();
  return getLocalizedValue(value, lang) ?? "";
}

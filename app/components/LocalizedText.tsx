"use client";

import { useLanguage } from "./LanguageProvider";
type TextKey = string;

export default function LocalizedText({ textKey }: { textKey: TextKey }) {
  const { t } = useLanguage();

  return t(textKey);
}

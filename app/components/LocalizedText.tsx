"use client";

import { useLanguage } from "./LanguageProvider";
import { type LocaleMessages } from "../../locales";

type TextKey = string;

function readText(messages: LocaleMessages, key: TextKey): string {
  return key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }

    return undefined;
  }, messages) as string;
}

export default function LocalizedText({ textKey }: { textKey: TextKey }) {
  const { t } = useLanguage();

  return readText(t, textKey) ?? "";
}

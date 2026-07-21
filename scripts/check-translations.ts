import { translations, type Lang } from "../locales/index.ts";

const referenceLanguage: Lang = "ar";
const languages = Object.keys(translations) as Lang[];

function collectKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.length
      ? value.flatMap((child, index) => collectKeys(child, `${prefix}.${index}`))
      : [`${prefix}.__emptyArray`];
  }
  if (!value || typeof value !== "object") {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

function sortedKeys(lang: Lang) {
  return [...new Set(collectKeys(translations[lang]))].filter(Boolean).sort();
}

const referenceKeys = sortedKeys(referenceLanguage);
let hasErrors = false;

for (const lang of languages) {
  if (lang === referenceLanguage) continue;

  const keys = sortedKeys(lang);
  const keySet = new Set(keys);
  const referenceSet = new Set(referenceKeys);
  const missing = referenceKeys.filter((key) => !keySet.has(key));
  const extra = keys.filter((key) => !referenceSet.has(key));

  if (missing.length || extra.length) {
    hasErrors = true;
    console.error(`\n[${lang.toUpperCase()}] translation structure mismatch:`);
    if (missing.length) console.error(`  Missing (${missing.length}): ${missing.join(", ")}`);
    if (extra.length) console.error(`  Extra (${extra.length}): ${extra.join(", ")}`);
  } else {
    console.log(`✓ ${lang.toUpperCase()}: ${keys.length} keys match ${referenceLanguage.toUpperCase()}`);
  }
}

if (hasErrors) {
  process.exitCode = 1;
} else {
  console.log(`\nAll ${languages.length} locale dictionaries share the same ${referenceKeys.length}-key structure.`);
}

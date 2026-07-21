import type { Lang } from "../config/translations";

export type ProductUnderstandingField =
  | "suggestedProductName"
  | "category"
  | "material"
  | "scent"
  | "dimensions"
  | "availableColors"
  | "suggestedKeywords"
  | "shortDescription"
  | "seoTitle"
  | "seoDescription"
  | "urlSlug"
  | "imageAltText";

export type ProductUnderstandingResult = {
  suggestions: Partial<Record<ProductUnderstandingField, string>>;
  colors: string[];
  hasUsefulInformation: boolean;
};

type LocalizedTerm = {
  keywords: string[];
  labels: Record<Lang, string>;
};

const categories: Array<LocalizedTerm & { name: string }> = [
  { name: "candles", keywords: ["candle", "candles", "شمعة", "شموع", "kerze", "kerzen", "bougie", "bougies", "wax", "شمع", "wachs", "cire"], labels: { ar: "الشموع", de: "Kerzen", en: "Candles", fr: "Bougies" } },
  { name: "gifts", keywords: ["gift", "gifts", "هدية", "هدايا", "geschenk", "geschenke", "cadeau", "cadeaux", "personalized", "personalisiert", "personnalisé", "مخصص"], labels: { ar: "الهدايا", de: "Geschenke", en: "Gifts", fr: "Cadeaux" } },
  { name: "packaging", keywords: ["packaging", "package", "box", "boxes", "تغليف", "علبة", "صندوق", "verpackung", "schachtel", "boxen", "emballage", "boîte", "coffret"], labels: { ar: "التغليف والعلب", de: "Verpackungen und Boxen", en: "Packaging and boxes", fr: "Emballages et boîtes" } },
  { name: "kids", keywords: ["children", "child", "kids", "educational", "learning", "game", "أطفال", "طفل", "تعليمي", "لعبة", "lernen", "lernspiel", "kinder", "pädagogisch", "enfant", "enfants", "éducatif", "jeu"], labels: { ar: "منتجات الأطفال والتعليم", de: "Kinder- und Lernprodukte", en: "Children and educational products", fr: "Produits pour enfants et éducatifs" } },
  { name: "decor", keywords: ["decor", "decoration", "ornament", "ديكور", "زينة", "زخرفة", "dekoration", "deko", "décoration", "décor"], labels: { ar: "الديكور", de: "Dekoration", en: "Decoration", fr: "Décoration" } },
];

const materials: LocalizedTerm[] = [
  { keywords: ["mdf", "خشب mdf"], labels: { ar: "MDF", de: "MDF", en: "MDF", fr: "MDF" } },
  { keywords: ["wood", "wooden", "خشب", "خشبي", "holz", "bois"], labels: { ar: "خشب", de: "Holz", en: "Wood", fr: "Bois" } },
  { keywords: ["pla"], labels: { ar: "PLA", de: "PLA", en: "PLA", fr: "PLA" } },
  { keywords: ["tpu"], labels: { ar: "TPU", de: "TPU", en: "TPU", fr: "TPU" } },
  { keywords: ["soy wax", "soywax", "شمع الصويا", "صويا", "sojawachs", "cire de soja"], labels: { ar: "شمع الصويا", de: "Sojawachs", en: "Soy wax", fr: "Cire de soja" } },
  { keywords: ["paraffin", "بارافين", "paraffinwachs", "paraffine"], labels: { ar: "شمع البارافين", de: "Paraffinwachs", en: "Paraffin wax", fr: "Cire de paraffine" } },
];

const colors: Array<LocalizedTerm & { value: string }> = [
  { value: "#d93d3d", keywords: ["red", "أحمر", "rot", "rouge"], labels: { ar: "أحمر", de: "Rot", en: "Red", fr: "Rouge" } },
  { value: "#2563eb", keywords: ["blue", "أزرق", "blau", "bleu"], labels: { ar: "أزرق", de: "Blau", en: "Blue", fr: "Bleu" } },
  { value: "#2f9e44", keywords: ["green", "أخضر", "grün", "vert"], labels: { ar: "أخضر", de: "Grün", en: "Green", fr: "Vert" } },
  { value: "#f59e0b", keywords: ["yellow", "أصفر", "gelb", "jaune"], labels: { ar: "أصفر", de: "Gelb", en: "Yellow", fr: "Jaune" } },
  { value: "#ec4899", keywords: ["pink", "وردي", "rosa", "rose"], labels: { ar: "وردي", de: "Rosa", en: "Pink", fr: "Rose" } },
  { value: "#f8fafc", keywords: ["white", "أبيض", "weiß", "weiss", "blanc"], labels: { ar: "أبيض", de: "Weiß", en: "White", fr: "Blanc" } },
  { value: "#111827", keywords: ["black", "أسود", "schwarz", "noir"], labels: { ar: "أسود", de: "Schwarz", en: "Black", fr: "Noir" } },
  { value: "#d4af37", keywords: ["gold", "golden", "ذهبي", "doré"], labels: { ar: "ذهبي", de: "Gold", en: "Gold", fr: "Doré" } },
  { value: "#c0c0c0", keywords: ["silver", "فضي", "silber", "argenté"], labels: { ar: "فضي", de: "Silber", en: "Silver", fr: "Argenté" } },
  { value: "#8b5a2b", keywords: ["brown", "بني", "braun", "marron"], labels: { ar: "بني", de: "Braun", en: "Brown", fr: "Marron" } },
  { value: "#8b5cf6", keywords: ["purple", "بنفسجي", "lila", "violet"], labels: { ar: "بنفسجي", de: "Lila", en: "Purple", fr: "Violet" } },
  { value: "#d8c3a5", keywords: ["beige", "بيج"], labels: { ar: "بيج", de: "Beige", en: "Beige", fr: "Beige" } },
];

const scents: LocalizedTerm[] = [
  { keywords: ["vanilla", "فانيلا", "vanille"], labels: { ar: "فانيلا", de: "Vanille", en: "Vanilla", fr: "Vanille" } },
  { keywords: ["rose scent", "rose fragrance", "رائحة الورد", "ورد", "rosenduft", "parfum de rose"], labels: { ar: "ورد", de: "Rose", en: "Rose", fr: "Rose" } },
  { keywords: ["lavender", "لافندر", "خزامى", "lavendel", "lavande"], labels: { ar: "لافندر", de: "Lavendel", en: "Lavender", fr: "Lavande" } },
  { keywords: ["cinnamon", "قرفة", "zimt", "cannelle"], labels: { ar: "قرفة", de: "Zimt", en: "Cinnamon", fr: "Cannelle" } },
  { keywords: ["lemon", "ليمون", "zitrone", "citron"], labels: { ar: "ليمون", de: "Zitrone", en: "Lemon", fr: "Citron" } },
  { keywords: ["coffee", "قهوة", "kaffee", "café"], labels: { ar: "قهوة", de: "Kaffee", en: "Coffee", fr: "Café" } },
  { keywords: ["unscented", "بدون رائحة", "duftfrei", "sans parfum"], labels: { ar: "بدون رائحة", de: "Duftfrei", en: "Unscented", fr: "Sans parfum" } },
];

const featureTerms: LocalizedTerm[] = [
  { keywords: ["engraving", "engraved", "نقش", "محفور", "gravur", "graviert", "gravure", "gravé"], labels: { ar: "نقش", de: "Gravur", en: "Engraving", fr: "Gravure" } },
  { keywords: ["personalized", "custom", "مخصص", "شخصي", "personalisiert", "individuell", "personnalisé", "sur mesure"], labels: { ar: "مخصص", de: "Personalisiert", en: "Personalized", fr: "Personnalisé" } },
];

const copy = {
  ar: { product: "منتج", short: "منتج {category} مصنوع من {material} بتفاصيل مختارة بعناية.", seo: "اكتشف {name} من DekoKraft. {details}", alt: "صورة {name}", fallbackMaterial: "مواد مختارة" },
  de: { product: "Produkt", short: "{category} aus {material} mit sorgfältig ausgewählten Details.", seo: "Entdecken Sie {name} von DekoKraft. {details}", alt: "Produktbild von {name}", fallbackMaterial: "ausgewählten Materialien" },
  en: { product: "Product", short: "{category} made from {material} with carefully selected details.", seo: "Discover {name} from DekoKraft. {details}", alt: "Product image of {name}", fallbackMaterial: "selected materials" },
  fr: { product: "Produit", short: "{category} en {material}, avec des détails soigneusement sélectionnés.", seo: "Découvrez {name} de DekoKraft. {details}", alt: "Image produit de {name}", fallbackMaterial: "matériaux sélectionnés" },
} satisfies Record<Lang, Record<string, string>>;

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function matches(searchText: string, term: LocalizedTerm) {
  return term.keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    if (normalizedKeyword.length > 3) return searchText.includes(normalizedKeyword);
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, "u").test(searchText);
  });
}

function fill(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, value), template);
}

function findDimensions(description: string) {
  const match = description.match(/\b\d+(?:[.,]\d+)?\s*(?:x|×)\s*\d+(?:[.,]\d+)?(?:\s*(?:x|×)\s*\d+(?:[.,]\d+)?)?\s*(?:mm|cm|m|in|inch|zoll|سم|مم|متر)?\b/iu);
  return match?.[0].trim();
}

function makeSlug(value: string) {
  return normalize(value).replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function analyzeProductDescription(description: string, lang: Lang): ProductUnderstandingResult {
  const cleanDescription = description.trim().replace(/\s+/g, " ");
  if (!cleanDescription) return { suggestions: {}, colors: [], hasUsefulInformation: false };

  const searchText = normalize(cleanDescription);
  const category = ["candles", "kids", "packaging", "decor", "gifts"]
    .map((name) => categories.find((item) => item.name === name))
    .find((item) => item && matches(searchText, item));
  const material = materials.find((item) => matches(searchText, item));
  const scent = scents.find((item) => matches(searchText, item));
  const matchedColors = colors.filter((item) => matches(searchText, item));
  const features = featureTerms.filter((item) => matches(searchText, item));
  const dimensions = findDimensions(cleanDescription);
  const recognized = [category, material, scent, dimensions, ...matchedColors, ...features].filter(Boolean);
  const hasUsefulInformation = recognized.length > 0;

  const categoryLabel = category?.labels[lang];
  const materialLabel = material?.labels[lang];
  const featureLabels = features.map((item) => item.labels[lang]);
  const colorLabels = matchedColors.map((item) => item.labels[lang]);
  const keywordValues = [categoryLabel, materialLabel, scent?.labels[lang], ...featureLabels, ...colorLabels].filter((value): value is string => Boolean(value));
  const nameParts = [...featureLabels, materialLabel, categoryLabel].filter((value): value is string => Boolean(value));
  const suggestedProductName = nameParts.slice(0, 3).join(" ") || categoryLabel || copy[lang].product;
  const shortDescription = categoryLabel
    ? fill(copy[lang].short, { category: categoryLabel, material: materialLabel || copy[lang].fallbackMaterial })
    : cleanDescription.slice(0, 180);
  const seoDescription = fill(copy[lang].seo, { name: suggestedProductName, details: shortDescription }).slice(0, 160);

  return {
    hasUsefulInformation,
    colors: matchedColors.map((item) => item.value),
    suggestions: {
      suggestedProductName,
      ...(categoryLabel ? { category: categoryLabel } : {}),
      ...(materialLabel ? { material: materialLabel } : {}),
      ...(scent ? { scent: scent.labels[lang] } : {}),
      ...(dimensions ? { dimensions } : {}),
      ...(colorLabels.length ? { availableColors: colorLabels.join(", ") } : {}),
      ...(keywordValues.length ? { suggestedKeywords: keywordValues.join(", ") } : {}),
      shortDescription,
      seoTitle: `${suggestedProductName} | DekoKraft`.slice(0, 60),
      seoDescription,
      urlSlug: makeSlug(suggestedProductName),
      imageAltText: fill(copy[lang].alt, { name: suggestedProductName }),
    },
  };
}

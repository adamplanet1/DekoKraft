// app/admin/config/productFields.ts

// تعريف قائمة الأقسام مع تسميات بعدة لغات
export const categories = [
  {
    value: "candles",
    label_ar: "الشموع",
    label_de: "Kerzen",
    label_en: "Candles",
  },
  {
    value: "gifts",
    label_ar: "الهدايا",
    label_de: "Geschenke",
    label_en: "Gifts",
  },
  {
    value: "decor",
    label_ar: "الديكور",
    label_de: "Dekoration",
    label_en: "Decoration",
  },
  {
    value: "kids",
    label_ar: "الألعاب التعليمية",
    label_de: "Lernspiele",
    label_en: "Educational Games",
  },
  {
    value: "services",
    label_ar: "الخدمات",
    label_de: "Dienstleistungen",
    label_en: "Services",
  },
];

// تعريف أنواع المنتجات لكل قسم مع الترجمة
export const productTypes = {
  candles: [
    { value: "flower",   ar: "شموع زهور",       de: "Blumenkerzen",      en: "Flower Candles" },
    { value: "round",    ar: "شموع دائرية",     de: "Runde Kerzen",      en: "Round Candles" },
    { value: "square",   ar: "شموع مربعة",      de: "Quadratische Kerzen",en: "Square Candles" },
    { value: "gift",     ar: "شموع هدايا",      de: "Geschenkkerzen",    en: "Gift Candles" },
  ],
  gifts: [
    { value: "boxes",    ar: "صناديق",           de: "Boxen",             en: "Boxes" },
    { value: "keychains",ar: "ميداليات",         de: "Schlüsselanhänger",en: "Keychains" },
    { value: "names",    ar: "أسماء",            de: "Namensschilder",    en: "Names" },
    { value: "personal", ar: "هدايا شخصية",      de: "Personalisierte Geschenke", en: "Personal Gifts" },
  ],
  decor: [
    { value: "wood",     ar: "ديكور خشبي",        de: "Holzdekoration",     en: "Wood Decoration" },
    { value: "3d",       ar: "ديكور ثلاثي الأبعاد",de: "3D-Dekoration",     en: "3D Decoration" },
    { value: "acrylic",  ar: "ديكور أكريليك",      de: "Acryldekoration",    en: "Acrylic Decoration" },
    { value: "metal",    ar: "ديكور معدني",        de: "Metalldekoration",   en: "Metal Decoration" },
  ],
  kids: [
    { value: "memory",   ar: "لعبة الذاكرة",       de: "Memoryspiel",        en: "Memory Game" },
    { value: "letters",  ar: "الحروف",             de: "Buchstaben",         en: "Letters" },
    { value: "numbers",  ar: "الأرقام",             de: "Zahlen",             en: "Numbers" },
    { value: "animals",  ar: "الحيوانات",           de: "Tiere",              en: "Animals" },
  ],
  services: [
    { value: "printing3d", ar: "طباعة ثلاثية الأبعاد", de: "3D-Druck",        en: "3D Printing" },
    { value: "scan3d",     ar: "مسح ثلاثي الأبعاد",     de: "3D-Scan",        en: "3D Scanning" },
    { value: "laser",      ar: "النقش بالليزر",         de: "Lasergravur",     en: "Laser Engraving" },
    { value: "embroidery", ar: "الطباعة والطرز",        de: "Druck & Stickerei",en: "Printing & Embroidery" },
    { value: "spareparts", ar: "قطع غيار مطبوعة",       de: "3D-Ersatzteile",  en: "3D Printed Spare Parts" },
  ],
};

// يمكن تخصيص حقول إضافية (المواصفات) لكل قسم
export const productFields = {
  candles: [
    { key: "material",  ar: "المواد",  de: "Material",       en: "Material" },
    { key: "color",     ar: "اللون",    de: "Farbe",          en: "Colour" },
    { key: "fragrance", ar: "العطر",    de: "Duft",           en: "Fragrance" },
    { key: "weight_g",  ar: "الوزن (غ)",de: "Gewicht (g)",     en: "Weight (g)" },
    { key: "size_cm",   ar: "الحجم (سم)",de: "Größe (cm)",    en: "Size (cm)" },
    { key: "shape",     ar: "الشكل",    de: "Form",           en: "Shape" },
    { key: "brand",     ar: "العلامة",   de: "Marke",           en: "Brand" },
    { key: "tags",      ar: "وسوم",     de: "Tags",           en: "Tags" },
  ],
  // بقية الأقسام لها حقول خاصة بها إذا لزم الأمر
  gifts:    [],
  decor:    [],
  kids:     [],
  services: [],
};
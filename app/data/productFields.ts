export const categories = [
  { value: "candles", label_ar: "الشموع", label_de: "Kerzen", label_en: "Candles" },
  { value: "gift", label_ar: "الهدايا", label_de: "Geschenke", label_en: "Gifts" },
  { value: "kids", label_ar: "الألعاب التعليمية", label_de: "Lernspiele", label_en: "Educational Games" },
  { value: "services", label_ar: "الخدمات", label_de: "Services", label_en: "Services" },
  { value: "decor3d", label_ar: "ديكور 3D", label_de: "3D Deko", label_en: "3D Decor" },
  { value: "textile", label_ar: "طباعة وطرز", label_de: "Textil & Stickerei", label_en: "Textile & Embroidery" },
  { value: "gypsum-decor", label_ar: "ديكور من الجبس", label_de: "Gipsdekor", label_en: "Gypsum Decor" },
];

type ProductField = {
  key: string;
  ar: string;
  de: string;
  en: string;
};

export const productFields: Record<string, ProductField[]> = {
  "gypsum-decor": [
    { key: "material", ar: "المادة", de: "Material", en: "Material" },
    { key: "shape", ar: "الشكل", de: "Form", en: "Shape" },
    { key: "color", ar: "اللون", de: "Farbe", en: "Color" },
    { key: "size_cm", ar: "الأبعاد", de: "Größe", en: "Dimensions" },
  ],
  candles: [
    { key: "fragrance", ar: "الرائحة", de: "Duft", en: "Fragrance" },
    { key: "color", ar: "اللون", de: "Farbe", en: "Color" },
    { key: "weight_g", ar: "الوزن بالغرام", de: "Gewicht g", en: "Weight g" },
    { key: "size_cm", ar: "الحجم", de: "Größe", en: "Size" },
    { key: "material", ar: "نوع الشمع", de: "Wachsart", en: "Wax type" },
  ],

  gift: [
    { key: "material", ar: "المادة", de: "Material", en: "Material" },
    { key: "color", ar: "اللون", de: "Farbe", en: "Color" },
    { key: "size_cm", ar: "الأبعاد", de: "Größe", en: "Size" },
    { key: "engraving", ar: "إمكانية النقش", de: "Gravur möglich", en: "Engraving" },
  ],

  kids: [
    { key: "age", ar: "العمر المناسب", de: "Alter", en: "Age" },
    { key: "pieces", ar: "عدد القطع", de: "Teile", en: "Pieces" },
    { key: "material", ar: "المادة", de: "Material", en: "Material" },
  ],

  services: [
    { key: "service_type", ar: "نوع الخدمة", de: "Serviceart", en: "Service type" },
    { key: "delivery_time", ar: "مدة التنفيذ", de: "Lieferzeit", en: "Delivery time" },
  ],

  decor3d: [
    { key: "material", ar: "مادة الطباعة", de: "Druckmaterial", en: "Print material" },
    { key: "color", ar: "اللون", de: "Farbe", en: "Color" },
    { key: "size_cm", ar: "الحجم", de: "Größe", en: "Size" },
    { key: "printer", ar: "نوع الطابعة", de: "Drucker", en: "Printer" },
  ],

  textile: [
    { key: "fabric", ar: "نوع القماش", de: "Stoffart", en: "Fabric" },
    { key: "print_type", ar: "نوع العمل", de: "Arbeitsart", en: "Work type" },
    { key: "thread", ar: "نوع الخيط", de: "Garn", en: "Thread" },
    { key: "size_cm", ar: "الحجم", de: "Größe", en: "Size" },
  ],
};

import { type LocaleMessages } from "./types";

export const ar: LocaleMessages = {
  languageName: "العربية",
  dir: "rtl",
  header: {
    cmsDescription: "DekoKraft CMS — منصة إدارة المتجر ومنصة الحرفيين",
  },
  common: {
    packaging: "التعليب",
    candles: "الشموع",
    gifts: "الهدايا",
    educationalGames: "الألعاب التعليمية",
    models: "الموديلات",
    back: "رجوع",
    buy: "شراء",
    customBox: "علبة حسب الطلب",
    selectedModel: "الموديل المختار",
    thumbnailAlt: "صورة مصغرة",
  },
  home: {
    heroDescription: "أقسام مختارة للهدايا والتعليب والشموع والأطفال.",
    sections: {
      packaging: {
        title: "قسم التعليب",
        description: "علب جميلة لتعليب المنتجات حسب الذوق والمناسبة.",
      },
      candles: {
        title: "قسم الشموع",
        description: "شموع أنيقة بروائح دافئة تضيف لمسة هادئة لكل مساحة.",
      },
      gifts: {
        title: "قسم الهدايا",
        description: "اختيارات لطيفة ومميزة للمناسبات واللحظات القريبة من القلب.",
      },
      kids: {
        title: "قسم الأطفال",
        description: "ألعاب تعليمية ممتعة تساعد الأطفال على التعلم والابتكار.",
      },
    },
  },
  category: {
    notFound: "القسم غير موجود",
    sections: {
      boxes: {
        title: "قسم التعليب",
        description: "علب جميلة لتعليب المنتجات حسب الذوق والمناسبة.",
      },
      gift: {
        title: "قسم التعليب",
        description: "علب جميلة لتعليب المنتجات حسب الذوق والمناسبة.",
      },
      candles: {
        title: "قسم الشموع",
        description: "شموع مصممة بعناية للهدايا والديكور.",
      },
      kids: {
        title: "قسم الأطفال",
        description: "ألعاب تعليمية ممتعة لتنمية التركيز والذاكرة.",
      },
    },
  },
  product: {
    boxTitle: "علبة هدية",
    boxDescription: "علب جميلة لتعليب المنتجات حسب الذوق والمناسبة.",
    dimensions: {
      length: "الطول",
      width: "العرض",
      height: "الإرتفاع",
      minNotice: "الحد الأدنى {value} مم",
      maxNotice: "الحد الأقصى {value} مم",
      acceptedNotice: "{input} تم اعتمادها كـ {value} مم",
    },
    boxModels: [
      { name: "موديل 1", description: "صندوق مكعب كلاسيكي" },
      { name: "موديل 2", description: "صندوق درج" },
      { name: "موديل 3", description: "صندوق بغطاء مفصلي" },
      { name: "موديل 4", description: "صندوق بغطاء منفصل" },
      { name: "موديل 5", description: "صندوق نافذة شفافة" },
      { name: "موديل 6", description: "صندوق هدايا فاخر" },
      { name: "موديل 7", description: "صندوق مغناطيسي" },
      { name: "موديل 8", description: "صندوق أسطواني" },
      { name: "موديل 9", description: "صندوق بيد حمل" },
      { name: "موديل 10", description: "صندوق عرض مفتوح" },
    ],
  },
  admin: {
    readySection: "هذا القسم جاهز، وسنبرمجه لاحقًا خطوة بخطوة.",
    version: "الإصدار 1.0.0",
    rights: "© 2025 DekoKraft CMS. جميع الحقوق محفوظة.",
    addProduct: "إضافة منتج",
    dashboard: {
      heroTitle: "🏠 DekoKraft Creator Studio",
      heroText:
        "DekoKraft CMS — منصة إدارة المتجر ومنصة الحرفيين. من هنا ستدير المنتجات، المعرض، الخلفيات، الألوان، العروض، العملاء والطلبات.",
      stats: {
        orders: "طلبات جديدة",
        customers: "إجمالي العملاء",
        gallery: "في المعرض",
        products: "إجمالي المنتجات",
      },
      quickTitle: "⚡ الوصول السريع",
      quick: {
        products: "📦 المنتجات",
        gallery: "🖼️ المعرض",
        backgrounds: "🌄 الخلفيات",
        colors: "🎨 ألوان الموقع",
        statistics: "📊 الإحصائيات",
      },
    },
    sidebar: {
      dashboard: "الرئيسية",
      products: "المنتجات",
      gallery: "المعرض",
      videos: "الفيديوهات",
      backgrounds: "الخلفيات",
      colors: "ألوان الموقع",
      languages: "الترجمة",
      offers: "العروض",
      customers: "العملاء",
      orders: "الطلبات",
      statistics: "الإحصائيات",
    },
  },
};

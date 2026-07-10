import { type LocaleMessages } from "./types";

export const en: LocaleMessages = {
  languageName: "English",
  dir: "ltr",
  header: {
    cmsDescription: "DekoKraft CMS — Store and creator management",
  },
  common: {
    packaging: "Packaging",
    candles: "Candles",
    gifts: "Gifts",
    educationalGames: "Educational Games",
    models: "Models",
    back: "Back",
    buy: "Buy",
    customBox: "Custom Box",
    selectedModel: "Selected model",
    thumbnailAlt: "Thumbnail",
  },
  home: {
    heroDescription: "Selected sections for gifts, packaging, candles and children.",
    sections: {
      packaging: {
        title: "Packaging",
        description: "Beautiful boxes for packaging products by taste and occasion.",
      },
      candles: {
        title: "Candles",
        description: "Elegant candles with warm scents for a calm touch in every space.",
      },
      gifts: {
        title: "Gifts",
        description: "Thoughtful choices for occasions and heartfelt moments.",
      },
      kids: {
        title: "Educational Games",
        description: "Fun learning toys that help children explore and create.",
      },
    },
  },
  category: {
    notFound: "Category not found",
    sections: {
      boxes: {
        title: "Packaging",
        description: "Beautiful boxes for packaging products by taste and occasion.",
      },
      gift: {
        title: "Packaging",
        description: "Beautiful boxes for packaging products by taste and occasion.",
      },
      candles: {
        title: "Candles",
        description: "Carefully designed candles for gifts and decor.",
      },
      kids: {
        title: "Educational Games",
        description: "Fun educational games that develop focus and memory.",
      },
    },
  },
  product: {
    boxTitle: "Gift Box",
    boxDescription: "Beautiful boxes for packaging products by taste and occasion.",
    dimensions: {
      length: "Length",
      width: "Width",
      height: "Height",
      minNotice: "Minimum value is {value} mm",
      maxNotice: "Maximum value is {value} mm",
      acceptedNotice: "{input} was accepted as {value} mm",
    },
    boxModels: [
      { name: "Model 1", description: "Classic cube box" },
      { name: "Model 2", description: "Drawer box" },
      { name: "Model 3", description: "Box with hinged lid" },
      { name: "Model 4", description: "Box with separate lid" },
      { name: "Model 5", description: "Box with clear window" },
      { name: "Model 6", description: "Luxury gift box" },
      { name: "Model 7", description: "Magnetic box" },
      { name: "Model 8", description: "Cylindrical box" },
      { name: "Model 9", description: "Box with carry handle" },
      { name: "Model 10", description: "Open display box" },
    ],
  },
  admin: {
    readySection: "This section is ready and will be developed step by step.",
    version: "Version 1.0.0",
    rights: "© 2025 DekoKraft CMS. All rights reserved.",
    addProduct: "Add Product",
    dashboard: {
      heroTitle: "🏠 DekoKraft Creator Studio",
      heroText:
        "DekoKraft CMS — Manage products, gallery, backgrounds, colors, offers, customers and orders.",
      stats: {
        orders: "New orders",
        customers: "Total customers",
        gallery: "In gallery",
        products: "Total products",
      },
      quickTitle: "⚡ Quick access",
      quick: {
        products: "📦 Products",
        gallery: "🖼️ Gallery",
        backgrounds: "🌄 Backgrounds",
        colors: "🎨 Colors",
        statistics: "📊 Statistics",
      },
    },
    sidebar: {
      dashboard: "Dashboard",
      products: "Products",
      gallery: "Gallery",
      videos: "Videos",
      backgrounds: "Backgrounds",
      colors: "Colors",
      languages: "Languages",
      offers: "Offers",
      customers: "Customers",
      orders: "Orders",
      statistics: "Statistics",
    },
  },
};

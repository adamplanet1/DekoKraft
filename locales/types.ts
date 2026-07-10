export type Lang = "ar" | "de" | "en" | "fr";

export type Direction = "rtl" | "ltr";

export type LanguageOption = {
  value: Lang;
  label: string;
};

export type BoxModelText = {
  name: string;
  description: string;
};

export type LocaleMessages = {
  languageName: string;
  dir: Direction;
  header: {
    cmsDescription: string;
  };
  common: {
    packaging: string;
    candles: string;
    gifts: string;
    educationalGames: string;
    models: string;
    back: string;
    buy: string;
    customBox: string;
    selectedModel: string;
    thumbnailAlt: string;
  };
  home: {
    heroDescription: string;
    sections: {
      packaging: {
        title: string;
        description: string;
      };
      candles: {
        title: string;
        description: string;
      };
      gifts: {
        title: string;
        description: string;
      };
      kids: {
        title: string;
        description: string;
      };
    };
  };
  category: {
    notFound: string;
    sections: {
      boxes: {
        title: string;
        description: string;
      };
      gift: {
        title: string;
        description: string;
      };
      candles: {
        title: string;
        description: string;
      };
      kids: {
        title: string;
        description: string;
      };
    };
  };
  product: {
    boxTitle: string;
    boxDescription: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      minNotice: string;
      maxNotice: string;
      acceptedNotice: string;
    };
    boxModels: BoxModelText[];
  };
  admin: {
    readySection: string;
    version: string;
    rights: string;
    addProduct: string;
    dashboard: {
      heroTitle: string;
      heroText: string;
      stats: {
        orders: string;
        customers: string;
        gallery: string;
        products: string;
      };
      quickTitle: string;
      quick: {
        products: string;
        gallery: string;
        backgrounds: string;
        colors: string;
        statistics: string;
      };
    };
    sidebar: {
      dashboard: string;
      products: string;
      gallery: string;
      videos: string;
      backgrounds: string;
      colors: string;
      languages: string;
      offers: string;
      customers: string;
      orders: string;
      statistics: string;
    };
  };
};

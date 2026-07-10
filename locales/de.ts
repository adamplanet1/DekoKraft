import { type LocaleMessages } from "./types";

export const de: LocaleMessages = {
  languageName: "Deutsch",
  dir: "ltr",
  header: {
    cmsDescription: "DekoKraft CMS — Store- und Creator-Verwaltung",
  },
  common: {
    packaging: "Verpackung",
    candles: "Kerzen",
    gifts: "Geschenke",
    educationalGames: "Lernspiele",
    models: "Modelle",
    back: "Zurück",
    buy: "Kaufen",
    customBox: "Individuelle Box",
    selectedModel: "Ausgewähltes Modell",
    thumbnailAlt: "Miniaturbild",
  },
  home: {
    heroDescription: "Ausgewählte Bereiche für Geschenke, Verpackung, Kerzen und Kinder.",
    sections: {
      packaging: {
        title: "Verpackung",
        description: "Schöne Boxen zum Verpacken von Produkten nach Geschmack und Anlass.",
      },
      candles: {
        title: "Kerzen",
        description: "Elegante Kerzen mit warmen Düften für eine ruhige Atmosphäre.",
      },
      gifts: {
        title: "Geschenke",
        description: "Liebevolle und besondere Auswahl für Anlässe und persönliche Momente.",
      },
      kids: {
        title: "Lernspiele",
        description: "Spielerische Lernideen, die Kindern beim Entdecken und Gestalten helfen.",
      },
    },
  },
  category: {
    notFound: "Kategorie nicht gefunden",
    sections: {
      boxes: {
        title: "Verpackung",
        description: "Schöne Boxen zum Verpacken von Produkten nach Geschmack und Anlass.",
      },
      gift: {
        title: "Verpackung",
        description: "Schöne Boxen zum Verpacken von Produkten nach Geschmack und Anlass.",
      },
      candles: {
        title: "Kerzen",
        description: "Sorgfältig gestaltete Kerzen für Geschenke und Dekoration.",
      },
      kids: {
        title: "Lernspiele",
        description: "Unterhaltsame Lernspiele zur Förderung von Konzentration und Gedächtnis.",
      },
    },
  },
  product: {
    boxTitle: "Geschenkbox",
    boxDescription: "Schöne Boxen zum Verpacken von Produkten nach Geschmack und Anlass.",
    dimensions: {
      length: "Länge",
      width: "Breite",
      height: "Höhe",
      minNotice: "Mindestwert {value} mm",
      maxNotice: "Höchstwert {value} mm",
      acceptedNotice: "{input} wurde als {value} mm übernommen",
    },
    boxModels: [
      { name: "Modell 1", description: "Klassische Würfelbox" },
      { name: "Modell 2", description: "Schubladenbox" },
      { name: "Modell 3", description: "Box mit Scharnierdeckel" },
      { name: "Modell 4", description: "Box mit separatem Deckel" },
      { name: "Modell 5", description: "Box mit Sichtfenster" },
      { name: "Modell 6", description: "Luxuriöse Geschenkbox" },
      { name: "Modell 7", description: "Magnetbox" },
      { name: "Modell 8", description: "Zylindrische Box" },
      { name: "Modell 9", description: "Box mit Tragegriff" },
      { name: "Modell 10", description: "Offene Präsentationsbox" },
    ],
  },
  admin: {
    readySection:
      "Dieser Bereich ist bereit und wird Schritt für Schritt entwickelt.",
    version: "Version 1.0.0",
    rights: "© 2025 DekoKraft CMS. Alle Rechte vorbehalten.",
    addProduct: "Produkt hinzufügen",
    dashboard: {
      heroTitle: "🏠 DekoKraft Creator Studio",
      heroText:
        "DekoKraft CMS — Verwalten Sie Produkte, Galerie, Hintergründe, Farben, Angebote, Kunden und Bestellungen.",
      stats: {
        orders: "Neue Bestellungen",
        customers: "Kunden gesamt",
        gallery: "In der Galerie",
        products: "Produkte gesamt",
      },
      quickTitle: "⚡ Schnellzugriff",
      quick: {
        products: "📦 Produkte",
        gallery: "🖼️ Galerie",
        backgrounds: "🌄 Hintergründe",
        colors: "🎨 Farben",
        statistics: "📊 Statistik",
      },
    },
    sidebar: {
      dashboard: "Dashboard",
      products: "Produkte",
      gallery: "Galerie",
      videos: "Videos",
      backgrounds: "Hintergründe",
      colors: "Farben",
      languages: "Sprachen",
      offers: "Angebote",
      customers: "Kunden",
      orders: "Bestellungen",
      statistics: "Statistik",
    },
  },
};

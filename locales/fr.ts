import { type LocaleMessages } from "./types";

export const fr: LocaleMessages = {
  languageName: "Français",
  dir: "ltr",
  header: {
    cmsDescription: "DekoKraft CMS — Gestion de la boutique et des créateurs",
  },
  common: {
    packaging: "Emballage",
    candles: "Bougies",
    gifts: "Cadeaux",
    educationalGames: "Jeux éducatifs",
    models: "Modèles",
    back: "Retour",
    buy: "Acheter",
    customBox: "Boîte personnalisée",
    selectedModel: "Modèle sélectionné",
    thumbnailAlt: "Miniature",
  },
  home: {
    heroDescription: "Des sections choisies pour les cadeaux, l’emballage, les bougies et les enfants.",
    sections: {
      packaging: {
        title: "Emballage",
        description: "De belles boîtes pour emballer les produits selon le goût et l’occasion.",
      },
      candles: {
        title: "Bougies",
        description: "Des bougies élégantes aux parfums chaleureux pour une touche apaisante.",
      },
      gifts: {
        title: "Cadeaux",
        description: "Des choix délicats pour les occasions et les moments du cœur.",
      },
      kids: {
        title: "Jeux éducatifs",
        description: "Des jeux amusants qui aident les enfants à apprendre et créer.",
      },
    },
  },
  category: {
    notFound: "Section introuvable",
    sections: {
      boxes: {
        title: "Emballage",
        description: "De belles boîtes pour emballer les produits selon le goût et l’occasion.",
      },
      gift: {
        title: "Emballage",
        description: "De belles boîtes pour emballer les produits selon le goût et l’occasion.",
      },
      candles: {
        title: "Bougies",
        description: "Des bougies soigneusement conçues pour les cadeaux et la décoration.",
      },
      kids: {
        title: "Jeux éducatifs",
        description: "Des jeux éducatifs amusants pour développer la concentration et la mémoire.",
      },
    },
  },
  product: {
    boxTitle: "Boîte cadeau",
    boxDescription: "De belles boîtes pour emballer les produits selon le goût et l’occasion.",
    dimensions: {
      length: "Longueur",
      width: "Largeur",
      height: "Hauteur",
      minNotice: "Valeur minimale {value} mm",
      maxNotice: "Valeur maximale {value} mm",
      acceptedNotice: "{input} a été accepté comme {value} mm",
    },
    boxModels: [
      { name: "Modèle 1", description: "Boîte cubique classique" },
      { name: "Modèle 2", description: "Boîte tiroir" },
      { name: "Modèle 3", description: "Boîte avec couvercle à charnière" },
      { name: "Modèle 4", description: "Boîte avec couvercle séparé" },
      { name: "Modèle 5", description: "Boîte avec fenêtre transparente" },
      { name: "Modèle 6", description: "Boîte cadeau luxueuse" },
      { name: "Modèle 7", description: "Boîte magnétique" },
      { name: "Modèle 8", description: "Boîte cylindrique" },
      { name: "Modèle 9", description: "Boîte avec poignée" },
      { name: "Modèle 10", description: "Boîte de présentation ouverte" },
    ],
  },
  admin: {
    readySection:
      "Cette section est prête et sera développée étape par étape.",
    version: "Version 1.0.0",
    rights: "© 2025 DekoKraft CMS. Tous droits réservés.",
    addProduct: "Ajouter un produit",
    dashboard: {
      heroTitle: "🏠 DekoKraft Creator Studio",
      heroText:
        "DekoKraft CMS — Gérez les produits, la galerie, les arrière-plans, les couleurs, les offres, les clients et les commandes.",
      stats: {
        orders: "Nouvelles commandes",
        customers: "Total clients",
        gallery: "Dans la galerie",
        products: "Total produits",
      },
      quickTitle: "⚡ Accès rapide",
      quick: {
        products: "📦 Produits",
        gallery: "🖼️ Galerie",
        backgrounds: "🌄 Arrière-plans",
        colors: "🎨 Couleurs",
        statistics: "📊 Statistiques",
      },
    },
    sidebar: {
      dashboard: "Tableau de bord",
      products: "Produits",
      gallery: "Galerie",
      videos: "Vidéos",
      backgrounds: "Arrière-plans",
      colors: "Couleurs",
      languages: "Langues",
      offers: "Offres",
      customers: "Clients",
      orders: "Commandes",
      statistics: "Statistiques",
    },
  },
};

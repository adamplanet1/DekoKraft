export type CmsTabId =
  | "dashboard"
  | "products"
  | "dekobrain"
  | "gallery"
  | "videos"
  | "backgrounds"
  | "colors"
  | "languages"
  | "offers"
  | "customers"
  | "orders"
  | "statistics";

export const cmsTabs: { id: CmsTabId; icon: string }[] = [
  { id: "dashboard", icon: "🏠" },
  { id: "products", icon: "📦" },
  { id: "dekobrain", icon: "🧠" },
  { id: "gallery", icon: "🖼️" },
  { id: "videos", icon: "🎥" },
  { id: "backgrounds", icon: "🌄" },
  { id: "colors", icon: "🎨" },
  { id: "languages", icon: "🌍" },
  { id: "offers", icon: "📣" },
  { id: "customers", icon: "👥" },
  { id: "orders", icon: "🛒" },
  { id: "statistics", icon: "📊" },
];

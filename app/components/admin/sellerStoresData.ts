export type AdminSellerStoreNameKey =
  | "demoName"
  | "craftBoxesName"
  | "homeColorsName"
  | "woodStoryName"
  | "potsdamName";

export type AdminSellerStoreCityKey = "berlin" | "hamburg" | "potsdam";

export type AdminSellerStore = {
  id: string;
  nameKey: AdminSellerStoreNameKey;
  cityKey: AdminSellerStoreCityKey;
  badge: string;
  href: string;
  descriptionKey?: "potsdamDescription";
};

export const adminSellerStores: AdminSellerStore[] = [
  { id: "seller-001", nameKey: "demoName", cityKey: "berlin", badge: "De", href: "/seller/seller-001" },
  { id: "seller-002", nameKey: "craftBoxesName", cityKey: "hamburg", badge: "صن", href: "/seller/seller-002" },
  { id: "seller-003", nameKey: "homeColorsName", cityKey: "berlin", badge: "ال", href: "/seller/seller-003" },
  { id: "seller-004", nameKey: "woodStoryName", cityKey: "berlin", badge: "خش", href: "/seller/seller-004" },
  {
    id: "seller-potsdam",
    nameKey: "potsdamName",
    cityKey: "potsdam",
    badge: "P",
    href: "/seller/seller-potsdam",
    descriptionKey: "potsdamDescription",
  },
];


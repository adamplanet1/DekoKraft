import { publicPath } from "../lib/publicPath";

export const categories = [
  {
    slug: "candles",
    folder: "candles",
    title: "الشموع",
    description: "شموع مميزة ومعطرة للتزيين",
    image: publicPath(
      "/images/homepage/candles/candel-001/candel-001-01-600.webp"
    ),
  },
  {
    slug: "gift",
    folder: "gift",
    title: "الهدايا",
    description: "هدايا جميلة للتزيين والمناسبات",
    image: publicPath("/images/homepage/gift/gift-001/gift-001-01-600.webp"),
  },
  {
    slug: "kids",
    folder: "kids",
    title: "الألعاب التعليمية",
    description: "امنح لأولادك هدية تعليمية",
    image: publicPath(
      "/images/homepage/kids/rosememory-001/rosememory-001-01-600.webp"
    ),
  },
  {
    slug: "services",
    folder: "services",
    title: "الخدمات",
    description: "طلبات خاصة، تصليح، طباعة وطرز",
    image: publicPath("/images/homepage/services/service-01/service-01-01.jpg"),
  },
];

import {
  Box,
  Crop,
  DraftingCompass,
  Film,
  House,
  Image,
  Lightbulb,
  ScanLine,
  Scissors,
  Sparkles,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export type StudioV2ActivityId =
  | "welcome"
  | "image"
  | "video"
  | "background"
  | "crop"
  | "threeD"
  | "cnc"
  | "embroidery"
  | "interiorDesign"
  | "engineeringDesign"
  | "suggestion";

export type StudioV2Activity = {
  id: StudioV2ActivityId;
  label: string;
  description: string;
  accent: string;
  icon: LucideIcon;
};

export const studioV2Activities: StudioV2Activity[] = [
  { id: "welcome", label: "الرئيسية / الترحيب", description: "العودة إلى مساحة البداية", accent: "blue", icon: Sparkles },
  { id: "image", label: "معالجة الصور", description: "رفع الصور وضبط خصائصها", accent: "green", icon: Image },
  { id: "video", label: "معالجة الفيديو", description: "مساحة تجهيز الفيديو", accent: "violet", icon: Film },
  { id: "threeD", label: "التصميم ثلاثي الأبعاد", description: "إعداد العناصر ثلاثية الأبعاد", accent: "indigo", icon: Box },
  { id: "cnc", label: "CNC / Laser", description: "تجهيز ملفات القص والحفر", accent: "orange", icon: ScanLine },
  { id: "embroidery", label: "التطريز", description: "تحويل الأفكار إلى نمط تطريز", accent: "rose", icon: Scissors },
  { id: "suggestion", label: "اقتراح نشاط جديد", description: "شاركنا نشاطًا جديدًا", accent: "slate", icon: Lightbulb },
];

export const studioV2FutureActivities: StudioV2Activity[] = [
  { id: "interiorDesign", label: "التصميم الداخلي", description: "تخطيط المساحات والتصور الداخلي", accent: "cyan", icon: House },
  { id: "engineeringDesign", label: "التصميم الهندسي", description: "إعداد المخططات والأفكار الهندسية", accent: "amber", icon: DraftingCompass },
];

export const studioV2ImageProcessingTools = [
  { id: "removeBackground", label: "إزالة الخلفية", icon: WandSparkles },
  { id: "crop", label: "القص", icon: Crop },
] as const;

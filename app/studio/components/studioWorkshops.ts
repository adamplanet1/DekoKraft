import {
  Box,
  Boxes,
  ImageIcon,
  Layers3,
  PenTool,
  ScanLine,
  Settings2,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export type StudioWorkshopId =
  | "image"
  | "threeD"
  | "laser"
  | "embroidery"
  | "cnc"
  | "vector"
  | "mold"
  | "aiDesign";

export type StudioWorkshop = {
  id: StudioWorkshopId;
  titleKey: string;
  descriptionKey: string;
  statusKey: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentGlow: string;
};

export const studioWorkshops: StudioWorkshop[] = [
  {
    id: "image",
    titleKey: "studio.echo.workshops.image.title",
    descriptionKey: "studio.echo.workshops.image.description",
    statusKey: "studio.echo.status.experimental",
    icon: ImageIcon,
    accent: "#258a5d",
    accentSoft: "rgba(37, 138, 93, 0.13)",
    accentBorder: "rgba(37, 138, 93, 0.5)",
    accentGlow: "rgba(37, 138, 93, 0.2)",
  },
  {
    id: "threeD",
    titleKey: "studio.echo.workshops.threeD.title",
    descriptionKey: "studio.echo.workshops.threeD.description",
    statusKey: "studio.echo.status.development",
    icon: Box,
    accent: "#315eea",
    accentSoft: "rgba(49, 94, 234, 0.13)",
    accentBorder: "rgba(49, 94, 234, 0.5)",
    accentGlow: "rgba(49, 94, 234, 0.2)",
  },
  {
    id: "laser",
    titleKey: "studio.echo.workshops.laser.title",
    descriptionKey: "studio.echo.workshops.laser.description",
    statusKey: "studio.echo.status.development",
    icon: ScanLine,
    accent: "#c94747",
    accentSoft: "rgba(201, 71, 71, 0.13)",
    accentBorder: "rgba(201, 71, 71, 0.5)",
    accentGlow: "rgba(201, 71, 71, 0.2)",
  },
  {
    id: "embroidery",
    titleKey: "studio.echo.workshops.embroidery.title",
    descriptionKey: "studio.echo.workshops.embroidery.description",
    statusKey: "studio.echo.status.development",
    icon: Layers3,
    accent: "#7651c6",
    accentSoft: "rgba(118, 81, 198, 0.13)",
    accentBorder: "rgba(118, 81, 198, 0.5)",
    accentGlow: "rgba(118, 81, 198, 0.2)",
  },
  {
    id: "cnc",
    titleKey: "studio.echo.workshops.cnc.title",
    descriptionKey: "studio.echo.workshops.cnc.description",
    statusKey: "studio.echo.status.soon",
    icon: Settings2,
    accent: "#c87628",
    accentSoft: "rgba(200, 118, 40, 0.14)",
    accentBorder: "rgba(200, 118, 40, 0.52)",
    accentGlow: "rgba(200, 118, 40, 0.2)",
  },
  {
    id: "vector",
    titleKey: "studio.echo.workshops.vector.title",
    descriptionKey: "studio.echo.workshops.vector.description",
    statusKey: "studio.echo.status.soon",
    icon: PenTool,
    accent: "#a67b0d",
    accentSoft: "rgba(202, 157, 30, 0.15)",
    accentBorder: "rgba(166, 123, 13, 0.52)",
    accentGlow: "rgba(202, 157, 30, 0.22)",
  },
  {
    id: "mold",
    titleKey: "studio.echo.workshops.mold.title",
    descriptionKey: "studio.echo.workshops.mold.description",
    statusKey: "studio.echo.status.soon",
    icon: Boxes,
    accent: "#159a98",
    accentSoft: "rgba(21, 154, 152, 0.13)",
    accentBorder: "rgba(21, 154, 152, 0.5)",
    accentGlow: "rgba(21, 154, 152, 0.2)",
  },
  {
    id: "aiDesign",
    titleKey: "studio.echo.workshops.aiDesign.title",
    descriptionKey: "studio.echo.workshops.aiDesign.description",
    statusKey: "studio.echo.status.soon",
    icon: WandSparkles,
    accent: "#cc4f8a",
    accentSoft: "rgba(204, 79, 138, 0.13)",
    accentBorder: "rgba(204, 79, 138, 0.5)",
    accentGlow: "rgba(204, 79, 138, 0.2)",
  },
];

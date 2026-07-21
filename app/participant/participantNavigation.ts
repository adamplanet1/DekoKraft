import type { LucideIcon } from "lucide-react";
import { getDashboardMenu } from "../config/dashboardMenu";

export type ParticipantSection =
  | "products"
  | "orders"
  | "customers"
  | "analytics"
  | "media"
  | "earnings"
  | "settings"
  | "studio"
  | "aiCost"
  | "invoices"
  | "inventory"
  | "maintenance"
  | "support";

export type ParticipantNavigationItem = {
  key: ParticipantSection;
  href: string;
  icon: LucideIcon;
  labelKey: string;
  descriptionKey?: string;
};

export const participantNavigationItems: ParticipantNavigationItem[] = getDashboardMenu("participant").map((item) => ({
  key: item.id as ParticipantSection,
  href: item.href,
  icon: item.icon,
  labelKey: item.labelKey,
  descriptionKey: item.descriptionKey,
}));

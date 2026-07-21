import {
  BrainCircuit,
  ChartNoAxesCombined,
  ClipboardCheck,
  Dna,
  FlaskConical,
  Network,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type DkBrainProgressKey =
  | "productIdentity"
  | "echoLearning"
  | "knowledgeTree"
  | "livingIdentity"
  | "progress"
  | "corrections"
  | "tests"
  | "reports";

export type DkBrainProgressItem = {
  id: DkBrainProgressKey;
  slug: string;
  href: string;
  icon: LucideIcon;
};

export const dkBrainProgressItems: DkBrainProgressItem[] = [
  { id: "productIdentity", slug: "product-identity", href: "/admin/dekobrain/product-identity", icon: Dna },
  { id: "echoLearning", slug: "echo-learning", href: "/admin/dekobrain/echo-learning", icon: BrainCircuit },
  { id: "knowledgeTree", slug: "knowledge-tree", href: "/admin/dekobrain/knowledge-tree", icon: Network },
  { id: "livingIdentity", slug: "living-identity", href: "/admin/dekobrain/living-identity", icon: Sparkles },
  { id: "progress", slug: "progress", href: "/admin/dekobrain/progress", icon: TrendingUp },
  { id: "corrections", slug: "corrections", href: "/admin/dekobrain/corrections", icon: ClipboardCheck },
  { id: "tests", slug: "tests", href: "/admin/dekobrain/tests", icon: FlaskConical },
  { id: "reports", slug: "reports", href: "/admin/dekobrain/reports", icon: ChartNoAxesCombined },
];

export type DkBrainStatKey =
  | "learnedProducts"
  | "savedCorrections"
  | "knowledgeRules"
  | "confidence"
  | "lastLearning";

export const dkBrainStats: Array<{ labelKey: DkBrainStatKey; value: string }> = [
  { labelKey: "learnedProducts", value: "0" },
  { labelKey: "savedCorrections", value: "0" },
  { labelKey: "knowledgeRules", value: "0" },
  { labelKey: "confidence", value: "0%" },
  { labelKey: "lastLearning", value: "noLearningYet" },
];

export function isDkBrainProgressSlug(value: string) {
  return dkBrainProgressItems.some((item) => item.slug === value);
}


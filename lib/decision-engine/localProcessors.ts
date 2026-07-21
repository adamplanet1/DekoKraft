import type { DecisionPlanAction } from "./types";

export interface LocalProcessorDefinition {
  id: string;
  label: string;
  supportedActions: DecisionPlanAction[];
  available: boolean;
  status: "available" | "planned";
}

export const LOCAL_PROCESSORS: readonly LocalProcessorDefinition[] = [
  { id: "local-pixel-background-removal", label: "إزالة الخلفية محليًا", supportedActions: ["background-removal"], available: true, status: "available" },
  { id: "local-edge-cleanup", label: "تنظيف الحواف محليًا", supportedActions: ["edge-cleanup"], available: false, status: "planned" },
  { id: "local-format-conversion", label: "تحويل الصيغة محليًا", supportedActions: ["format-conversion"], available: false, status: "planned" },
  { id: "local-resize", label: "تغيير الحجم محليًا", supportedActions: ["resize"], available: false, status: "planned" },
] as const;

export function findAvailableLocalProcessor(action: DecisionPlanAction) {
  return LOCAL_PROCESSORS.find((processor) => processor.available && processor.supportedActions.includes(action));
}

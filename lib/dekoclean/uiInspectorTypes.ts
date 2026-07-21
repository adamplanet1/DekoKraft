export type UIElementKind = "button" | "card" | "link" | "tab" | "control";
export type UIElementStatus = "working" | "unconnected" | "disabled" | "informational" | "unknown";
export type UIActionType = "navigate" | "open-details" | "select" | "toggle" | "submit" | "refresh" | "run-scan" | "repair" | "restore" | "validate" | "none";

export interface UIInspectorRecord {
  id: string;
  label: string;
  kind: UIElementKind;
  status: UIElementStatus;
  expectedAction: UIActionType;
  target?: string;
  source?: string;
  reason?: string;
  connected?: boolean;
  lastCheckedAt: string;
}

export type UIInspectionSummary = { total: number; working: number; unconnected: number; disabled: number; informational: number; unknown: number; healthPercent: number; lastCheckedAt?: string };

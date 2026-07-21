export const WORKSPACE_IDS = [
  "image",
  "video",
  "3d",
  "laser",
  "coloring",
  "embroidery",
  "cnc",
  "printing",
  "vector",
  "audio",
] as const;

export type WorkspaceId = (typeof WORKSPACE_IDS)[number];

export const WORKSPACE_TOOL_IDS = [
  "smart-edit",
  "background-remove",
  "cleanup",
  "enhance",
  "filters",
  "actions",
] as const;

export type WorkspaceToolId = (typeof WORKSPACE_TOOL_IDS)[number];

export type WorkspaceSelection = {
  activeWorkspace: WorkspaceId;
  activeTool: WorkspaceToolId | null;
};

export type SmartEditLaunchContext = {
  openSmartEdit: boolean;
  participantId?: string;
  sellerId?: string;
  productId?: string;
};

export function isWorkspaceId(value: unknown): value is WorkspaceId {
  return typeof value === "string" && WORKSPACE_IDS.includes(value as WorkspaceId);
}

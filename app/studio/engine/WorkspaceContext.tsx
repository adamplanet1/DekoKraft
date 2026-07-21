"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { WorkspaceId, WorkspaceSelection, WorkspaceToolId } from "./workspaceTypes";

type WorkspaceContextValue = WorkspaceSelection & {
  selectWorkspace: (workspace: WorkspaceId) => void;
  selectTool: (tool: WorkspaceToolId | null) => void;
  openSmartEdit: (workspace?: WorkspaceId) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children, initialWorkspace = "image", initialTool = null }: { children: ReactNode; initialWorkspace?: WorkspaceId; initialTool?: WorkspaceToolId | null }) {
  const [selection, setSelection] = useState<WorkspaceSelection>({
    activeWorkspace: initialWorkspace,
    activeTool: initialTool,
  });

  const selectWorkspace = useCallback((activeWorkspace: WorkspaceId) => {
    setSelection({ activeWorkspace, activeTool: null });
  }, []);

  const selectTool = useCallback((activeTool: WorkspaceToolId | null) => {
    setSelection((current) => ({ ...current, activeTool }));
  }, []);

  const openSmartEdit = useCallback((workspace?: WorkspaceId) => {
    setSelection((current) => ({
      activeWorkspace: workspace ?? current.activeWorkspace,
      activeTool: "smart-edit",
    }));
  }, []);

  const value = useMemo(() => ({ ...selection, selectWorkspace, selectTool, openSmartEdit }), [openSmartEdit, selectTool, selectWorkspace, selection]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider.");
  return context;
}

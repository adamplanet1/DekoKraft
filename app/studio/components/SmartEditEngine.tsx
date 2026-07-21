"use client";

import { useWorkspace } from "../engine/WorkspaceContext";
import SmartEditPanel from "./SmartEditPanel";
import type { SmartEditChatProps } from "./SmartEditChat";

export type SmartEditEngineProps = Omit<SmartEditChatProps, "workspace">;

/**
 * Universal engine boundary. Echo Guide, Product DNA and Echo Memory remain
 * inside the shared panel while the active workspace is supplied by context.
 */
export default function SmartEditEngine(props: SmartEditEngineProps) {
  const { activeWorkspace } = useWorkspace();
  return <SmartEditPanel {...props} workspace={activeWorkspace} />;
}


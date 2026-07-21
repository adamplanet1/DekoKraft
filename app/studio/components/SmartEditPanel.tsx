"use client";

import SmartEditChat, { type SmartEditChatProps } from "./SmartEditChat";

/** Shared Smart Edit surface used by every workspace. */
export default function SmartEditPanel(props: SmartEditChatProps) {
  return <SmartEditChat {...props} />;
}


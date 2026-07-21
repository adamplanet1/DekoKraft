import type { ReactNode } from "react";

export default function SmartEditMessages({ children }: { children: ReactNode }) {
  return <div className="smartEditMessages" role="log" aria-live="polite">{children}</div>;
}

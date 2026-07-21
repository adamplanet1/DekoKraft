import type { ReactNode } from "react";
import AdminSessionGate from "./components/AdminSessionGate";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminSessionGate>{children}</AdminSessionGate>;
}


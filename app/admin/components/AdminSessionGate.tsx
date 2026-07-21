"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CURRENT_USER_SESSION_COOKIE, serializeCurrentUserSession } from "../../../lib/auth/sessionTypes";

export default function AdminSessionGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(process.env.NODE_ENV !== "development");
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      document.cookie = `${CURRENT_USER_SESSION_COOKIE}=${serializeCurrentUserSession({ role: "admin", name: "DekoKraft Admin" })}; Path=/; SameSite=Lax`;
    }
    setReady(true);
  }, []);
  return ready ? children : <main className="adminGuardLoading">جاري تهيئة جلسة المدير...</main>;
}


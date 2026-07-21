import { redirect } from "next/navigation";

import { requireAdminSession } from "../../../lib/auth/participantAccess";
import DekoCleanCenter from "./DekoCleanCenter";

export default async function AdminDekoCleanPage() {
  const session = await requireAdminSession().catch(() => null);
  if (!session) redirect("/login");
  return <DekoCleanCenter />;
}

import { redirect } from "next/navigation";
import { requireAdminSession } from "../../../../lib/auth/participantAccess";
import { getParticipantRegistry } from "../../../../lib/participants/registry";
import { auditParticipantOwnership } from "../../../../lib/participants/ownershipAudit";

export default async function ParticipantOwnershipDebugPage() {
  if (process.env.NODE_ENV !== "development") return <main>هذه الصفحة متاحة في بيئة التطوير فقط.</main>;
  const session = await requireAdminSession().catch(() => null);
  if (!session) redirect("/admin");
  const audit = await auditParticipantOwnership();
  return <main className="adminParticipantDetail" dir="rtl"><header><span>Development diagnostics</span><h1>تدقيق ملكية المشاركين</h1><p>الدور الحالي: {session.role} · participantId الحالي: {session.participantId ?? "—"} · عدد المشاركين: {getParticipantRegistry().length}</p></header><pre>{JSON.stringify(audit, null, 2)}</pre></main>;
}

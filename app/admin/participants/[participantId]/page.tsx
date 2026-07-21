import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSellerProducts } from "../../../data/sellerProducts";
import { getParticipantProfile, getParticipantRegistry } from "../../../../lib/participants/registry";
import { listAICostRecords } from "../../../../lib/ai-cost/costStore";
import { listFinancialLedgerEntries } from "../../../../lib/financial-ledger/store";
import { requireAdminSession } from "../../../../lib/auth/participantAccess";
import "../../../participant/participant.css";

export default async function AdminParticipantDetailPage({ params }: { params: Promise<{ participantId: string }> }) {
  const session = await requireAdminSession().catch(() => null);
  if (!session) redirect("/admin");
  const { participantId } = await params;
  const participant = getParticipantProfile(participantId);
  if (!participant) notFound();
  const products = getSellerProducts(participantId);
  const [costs, ledger] = await Promise.all([listAICostRecords(), listFinancialLedgerEntries()]);
  const participantCosts = costs.filter((record) => (record.participantId ?? record.sellerId) === participantId);
  const participantLedger = ledger.filter((entry) => (entry.participantId ?? entry.sellerId) === participantId);
  const links = [
    ["المنتجات", "#products", products.length], ["الطلبات", "#orders", 0], ["العملاء", "#customers", 0], ["المخزون", "/admin/inventory", "مشترك"],
    ["تكلفة الذكاء الاصطناعي", `/admin/ai-cost?participantId=${participantId}`, participantCosts.length], ["الدفتر المالي", `/admin/finance?participantId=${participantId}`, participantLedger.length], ["الفواتير", "#invoices", 0], ["History", "#history", 0], ["Product DNA", "#product-dna", 0], ["Echo Learning", "#echo-learning", 0],
  ] as const;
  return <main className="adminParticipantDetail" dir="rtl">
    <header><Link href="/admin/sellers">العودة إلى المشاركين</Link><span>{participant.participantId}</span><h1>{participant.name}</h1><p>{participant.storeName} · {participant.status}</p></header>
    <section className="adminParticipantDetail__grid">{links.map(([label, href, value]) => <Link href={href} key={label}><strong>{label}</strong><span>{value}</span></Link>)}</section>
    <Link className="adminParticipantDetail__preview" href={`/admin/participants/${participantId}/studio`}>فتح استوديو المشارك للمعاينة</Link>
  </main>;
}

export function generateStaticParams() { return getParticipantRegistry().map((participant) => ({ participantId: participant.participantId })); }

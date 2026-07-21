"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type SellerAccountStatus } from "../../data/sellers";
import { getSellerProducts } from "../../data/sellerProducts";
import { getEffectiveSellers, setSellerStatus } from "../../seller/lib/sellerAccountStorage";
import { getParticipantInventory } from "../../../lib/inventory/inventoryStore";
import type { AICostRecord } from "../../../lib/ai-cost/types";
import AdminParticipantCreateModal from "./AdminParticipantCreateModal";

const statusLabel: Record<SellerAccountStatus, string> = { invited: "بانتظار قبول الدعوة", active: "نشط", paused: "متوقف مؤقتًا", suspended: "موقوف إداريًا" };

export default function AdminSellersTable() {
  const [sellers, setSellers] = useState(() => getEffectiveSellers());
  const [costRecords, setCostRecords] = useState<AICostRecord[]>([]);
  const [message, setMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const refresh = () => setSellers(getEffectiveSellers());
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.info("[Participant Registry] Add participant button mounted");
    refresh();
    window.addEventListener("seller-account-change", refresh);
    void fetch("/api/ai-cost").then(async (response) => {
      if (!response.ok) return;
      const payload = await response.json() as { records?: AICostRecord[] };
      setCostRecords(payload.records ?? []);
    }).catch(() => undefined);
    return () => window.removeEventListener("seller-account-change", refresh);
  }, []);
  const change = (id: string, status: SellerAccountStatus) => { setSellerStatus(id, status); refresh(); };
  const copy = async (id: string) => {
    const url = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/seller/accept-invite?sellerId=${id}`;
    await navigator.clipboard.writeText(url); setMessage(`تم نسخ رابط دعوة ${id}.`);
  };
  const openCreate = () => {
    if (process.env.NODE_ENV === "development") console.info("[Participant Registry] Add participant button clicked");
    setMessage("");
    setIsCreateOpen(true);
  };
  return <main className="adminSellersPage" dir="rtl">
    <header><div><span>Participant Registry</span><h1>إدارة المشاركين</h1><p>نفس السجل المستخدم في تسجيل الدخول واستوديو المشارك.</p></div><div className="adminSellerHeaderActions"><button type="button" className="adminAddParticipantButton" onClick={openCreate}>＋ إضافة مشارك جديد</button><Link href="/admin">العودة إلى لوحة الإدارة</Link></div></header>
    {message && <p className="adminSellerNotice">{message}</p>}
    <div className="adminSellersTableWrap"><table><thead><tr><th>participantId</th><th>اسم المشارك</th><th>اسم المتجر</th><th>البريد</th><th>الخطة</th><th>الحالة</th><th>المنتجات</th><th>الطلبات</th><th>تكلفة AI هذا الشهر</th><th>إجمالي المخزون</th><th>آخر نشاط</th><th>الإجراءات</th></tr></thead><tbody>
      {sellers.map((seller) => {
        const month = new Date().toISOString().slice(0, 7);
        const monthCost = costRecords.filter((record) => (record.participantId ?? record.sellerId) === seller.id && record.createdAt.startsWith(month)).reduce((sum, record) => sum + (record.actualCostUsd ?? record.estimatedCostUsd), 0);
        const inventory = getParticipantInventory(seller.id);
        const inventoryTotal = inventory.finishedProducts.reduce((sum, item) => sum + item.quantityAvailable, 0);
        return <tr key={seller.id}><td dir="ltr">{seller.id}</td><td>{seller.ownerName}</td><td>{seller.store.storeName}</td><td>{seller.email}</td><td>{seller.plan}</td><td><span className={`sellerAccountStatus sellerAccountStatus--${seller.status}`}>{statusLabel[seller.status]}</span></td><td>{getSellerProducts(seller.id).length}</td><td>0</td><td>${monthCost.toFixed(4)}</td><td>{inventoryTotal}</td><td>{seller.lastLoginAt ? new Date(seller.lastLoginAt).toLocaleString("ar") : "—"}</td><td><div>
        <Link href={`/admin/participants/${seller.id}`}>فتح لوحة المشارك</Link>
        <button onClick={() => change(seller.id, "active")}>تفعيل</button><button onClick={() => change(seller.id, "paused")}>إيقاف مؤقت</button><button onClick={() => change(seller.id, "suspended")}>تعليق</button><button onClick={() => void copy(seller.id)}>نسخ رابط الدعوة</button>
      </div></td></tr>;
      })}
    </tbody></table></div>
    {isCreateOpen && <AdminParticipantCreateModal onClose={() => setIsCreateOpen(false)} onCreated={() => { refresh(); setIsCreateOpen(false); setMessage("تم إنشاء المشارك بنجاح."); }} />}
  </main>;
}

"use client";

import { useEffect, useState } from "react";
import { Boxes, ClipboardCheck, Package, PackageX, Users } from "lucide-react";
import { DkGlassPanel } from "../../components/ui";
import { getAdminInventoryTotals, INVENTORY_CHANGE_EVENT } from "../../../lib/inventory/inventoryStore";

export default function AdminInventoryOverview() {
  const [totals, setTotals] = useState(() => getAdminInventoryTotals());

  useEffect(() => {
    const refresh = () => setTotals(getAdminInventoryTotals());
    window.addEventListener(INVENTORY_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(INVENTORY_CHANGE_EVENT, refresh);
  }, []);

  const cards = [
    { label: "المشاركون المسجل لهم مخزون", value: totals.participants, icon: Users },
    { label: "المنتجات الجاهزة المتاحة", value: totals.finishedAvailable, icon: Boxes },
    { label: "المنتجات المحجوزة", value: totals.finishedReserved, icon: Package },
    { label: "المنتجات التالفة", value: totals.finishedDamaged, icon: PackageX },
    { label: "وحدات المواد الخام", value: totals.rawMaterialUnits, icon: Package },
    { label: "حركات المخزون", value: totals.movementCount, icon: ClipboardCheck },
    { label: "فحوصات تنتظر التأكيد", value: totals.pendingInspections, icon: ClipboardCheck },
  ];

  return (
    <section className="adminInventory" dir="rtl" aria-labelledby="admin-inventory-title">
      <header><p>عرض إداري لجميع المشاركين</p><h1 id="admin-inventory-title">المخزون</h1></header>
      <div className="adminInventory__grid">
        {cards.map(({ label, value, icon: Icon }) => <DkGlassPanel key={label} as="article" className="adminInventory__card"><Icon aria-hidden="true" /><span>{label}</span><strong>{value}</strong></DkGlassPanel>)}
      </div>
      <DkGlassPanel as="aside" className="adminInventory__notice">
        <strong>قاعدة الصلاحيات</strong>
        <p>المدير يرى الإجماليات لجميع المشاركين. DekoBrain يقرأ المخزون للتحليل فقط، ولا يضيف أي كمية دون تأكيد المشارك المرتبط بفحص المنتج.</p>
      </DkGlassPanel>
    </section>
  );
}


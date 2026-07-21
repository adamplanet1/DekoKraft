"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { SellerAccount, SellerAccountStatus, SellerPlan } from "../../data/sellers";
import { createParticipant, type CreateParticipantInput } from "../../seller/lib/sellerAccountStorage";

type Props = {
  onClose: () => void;
  onCreated: (participant: SellerAccount) => void;
};

const initialForm: CreateParticipantInput = {
  ownerName: "",
  email: "",
  storeName: "",
  plan: "starter",
  craftType: "",
  language: "ar",
  temporaryPassword: "",
  status: "invited",
};

export default function AdminParticipantCreateModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submittingRef.current) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const update = <Key extends keyof CreateParticipantInput>(key: Key, value: CreateParticipantInput[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError("");
    try {
      onCreated(createParticipant(form));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إنشاء المشارك.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="adminParticipantModalBackdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) onClose(); }}>
      <section className="adminParticipantModal" role="dialog" aria-modal="true" aria-labelledby="create-participant-title">
        <header>
          <div><span>Participant Registry</span><h2 id="create-participant-title">إضافة مشارك جديد</h2></div>
          <button type="button" aria-label="إغلاق" disabled={isSubmitting} onClick={onClose}>×</button>
        </header>
        <form onSubmit={submit}>
          <div className="adminParticipantFormGrid">
            <label>الاسم الكامل<input ref={firstInputRef} required autoComplete="name" value={form.ownerName} onChange={(event) => update("ownerName", event.target.value)} /></label>
            <label>البريد الإلكتروني<input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
            <label>اسم المتجر<input required value={form.storeName} onChange={(event) => update("storeName", event.target.value)} /></label>
            <label>الخطة<select value={form.plan} onChange={(event) => update("plan", event.target.value as SellerPlan)}><option value="hobby">Hobby</option><option value="starter">Starter</option><option value="professional">Professional</option></select></label>
            <label>نوع الحرفة<input required value={form.craftType} onChange={(event) => update("craftType", event.target.value)} /></label>
            <label>اللغة<select value={form.language} onChange={(event) => update("language", event.target.value as CreateParticipantInput["language"])}><option value="ar">العربية</option><option value="de">Deutsch</option><option value="en">English</option><option value="fr">Français</option></select></label>
            <label>كلمة المرور المؤقتة<input required minLength={8} type="password" autoComplete="new-password" value={form.temporaryPassword} onChange={(event) => update("temporaryPassword", event.target.value)} /></label>
            <label>حالة الحساب<select value={form.status} onChange={(event) => update("status", event.target.value as SellerAccountStatus)}><option value="invited">بانتظار قبول الدعوة</option><option value="active">نشط</option><option value="paused">متوقف مؤقتًا</option><option value="suspended">موقوف إداريًا</option></select></label>
          </div>
          {error && <p className="adminParticipantFormError" role="alert">{error}</p>}
          <footer>
            <button type="submit" className="adminParticipantSubmit" disabled={isSubmitting}>{isSubmitting ? "جارٍ إنشاء المشارك..." : "إنشاء المشارك"}</button>
            <button type="button" disabled={isSubmitting} onClick={onClose}>إلغاء</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

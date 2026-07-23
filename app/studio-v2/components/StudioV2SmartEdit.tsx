"use client";

import { Sparkles, X } from "lucide-react";

type StudioV2SmartEditProps = {
  open: boolean;
  onToggle: () => void;
};

export default function StudioV2SmartEdit({ open, onToggle }: StudioV2SmartEditProps) {
  return (
    <aside className={`studioV2SmartEdit${open ? " is-open" : ""}`}>
      <button type="button" className="studioV2SmartEditButton" aria-expanded={open} onClick={onToggle}>
        <Sparkles aria-hidden="true" />
        <span>التعديل الذكي</span>
      </button>
      {open && (
        <div className="studioV2SmartEditPanel">
          <button type="button" className="studioV2IconButton" aria-label="إغلاق التعديل الذكي" onClick={onToggle}>
            <X aria-hidden="true" />
          </button>
          <strong>التعديل الذكي</strong>
          <p>ستُربط أدوات التعديل الذكي هنا في مرحلة لاحقة، داخل مساحة مستقرة لا تغطي لوحة العمل.</p>
        </div>
      )}
    </aside>
  );
}

import type { LucideIcon } from "lucide-react";
import type { ProductCategoryId } from "./CategoryDraftStore";

export default function ProductCategoryButton({ id, label, icon: Icon, active, onSelect }: {
  id: ProductCategoryId; label: string; icon: LucideIcon; active: boolean; onSelect: (id: ProductCategoryId) => void;
}) {
  return <button type="button" className="smartEditCategoryButton" aria-pressed={active} onClick={() => onSelect(id)}><Icon size={18} aria-hidden="true" /><span>{label}</span></button>;
}

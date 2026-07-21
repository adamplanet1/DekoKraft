import { Box, Boxes, Gift, Puzzle, Wrench, X } from "lucide-react";
import type { ProductCategoryId } from "./CategoryDraftStore";
import ProductCategoryButton from "./ProductCategoryButton";

const icons = { packaging: Box, candles: Boxes, gifts: Gift, kids: Puzzle, services: Wrench };

export default function ProductCategoryPanel({ activeCategory, labels, closeLabel, onSelect, onClose }: {
  activeCategory: ProductCategoryId; labels: Record<ProductCategoryId, string>; closeLabel: string;
  onSelect: (id: ProductCategoryId) => void; onClose: () => void;
}) {
  return <aside className="smartEditCategoryPanel" aria-label={labels[activeCategory]}>
    <div className="smartEditCategoryPanel__header"><strong>{labels[activeCategory]}</strong><button type="button" aria-label={closeLabel} onClick={onClose}><X size={17} /></button></div>
    <div className="smartEditCategoryPanel__list">{(Object.keys(labels) as ProductCategoryId[]).map((id) => <ProductCategoryButton key={id} id={id} label={labels[id]} icon={icons[id]} active={id === activeCategory} onSelect={onSelect} />)}</div>
  </aside>;
}


import { ImagePlus, Package } from "lucide-react";

export default function EmptyProductMemoryState({ onChooseProduct, onUploadImage }: { onChooseProduct: () => void; onUploadImage: () => void }) {
  return <section className="smartEditEmptyMemory" role="status">
    <Package size={34} aria-hidden="true" />
    <h3>لا توجد ذاكرة منتج نشطة.</h3>
    <p>اختر منتجًا من المنصة أو ارفع صورة جديدة. لن يعرض Echo بيانات منتج سابق.</p>
    <div className="smartEditChat__actions">
      <button type="button" onClick={onChooseProduct}><Package size={17} aria-hidden="true" />اختيار منتج</button>
      <button type="button" onClick={onUploadImage}><ImagePlus size={17} aria-hidden="true" />رفع صورة</button>
    </div>
  </section>;
}

"use client";

import { ArrowRight, Check, Images } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publicPath } from "../../lib/publicPath";

const libraryItems = [
  { id: "candles", label: "الشموع", image: "/images/homepage/candles/candel-002/candel-002-01-600.webp" },
  { id: "gifts", label: "الهدايا", image: "/images/homepage/gift/gift-001/gift-001-01-600.webp" },
  { id: "kids", label: "الأطفال", image: "/images/homepage/kids/rosememory-001/kids-001-01-1200.webp" },
  { id: "embroidery", label: "التطريز", image: "/images/homepage/services/service-03/20211217_162557.jpg" },
  { id: "laser", label: "الليزر", image: "/images/homepage/gift/gift-001/gift-001-06-600.webp" },
  { id: "three-d", label: "الطباعة ثلاثية الأبعاد", image: "/images/homepage/kids/rosememory-001/rosememory-001-05-1200.webp" },
  { id: "decor", label: "الديكور", image: "/images/homepage/candles/candel-002/candel-002-07-600.webp" },
] as const;

export default function StudioLibraryPage() {
  const router = useRouter();

  const selectImage = (image: string) => {
    sessionStorage.setItem("dekokraft.studio.librarySelection", publicPath(image));
    router.push("/studio");
  };

  return (
    <main className="studioLibraryPage" dir="rtl">
      <header className="studioLibraryHeader">
        <div>
          <span className="studioLibraryEyebrow"><Images size={18} aria-hidden="true" /> EchoDeko Studio</span>
          <h1>مكتبة الموقع</h1>
          <p>اختر صورة مرتبطة بنشاطك، ثم عد بها مباشرة إلى مساحة معالجة الصور.</p>
        </div>
        <Link className="studioLibraryBack" href="/studio"><ArrowRight size={18} aria-hidden="true" />العودة إلى الاستوديو</Link>
      </header>

      <section className="studioLibraryGrid" aria-label="صور وأنشطة مكتبة الموقع">
        {libraryItems.map((item) => (
          <article className="studioLibraryCard" key={item.id}>
            <div className="studioLibraryCard__preview">
              <Image src={publicPath(item.image)} alt={item.label} fill sizes="(max-width: 640px) 90vw, 280px" />
            </div>
            <div className="studioLibraryCard__footer">
              <strong>{item.label}</strong>
              <button type="button" onClick={() => selectImage(item.image)}><Check size={17} aria-hidden="true" />اختيار</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

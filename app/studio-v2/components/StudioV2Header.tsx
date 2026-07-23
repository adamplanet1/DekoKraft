"use client";

import Image from "next/image";
import { Languages } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";
import { publicPath } from "../../lib/publicPath";

export default function StudioV2Header() {
  const { lang, setLang } = useLanguage();

  return (
    <header className="studioV2Header">
      <div className="studioV2Brand">
        <Image
          src={publicPath("/logo-dekokraft-600.webp")}
          width={64}
          height={64}
          alt="DekoKraft"
          priority
        />
        <div>
          <strong>DekoKraft</strong>
        </div>
      </div>

      <div className="studioV2Heading">
        <div className="studioV2TitleRow">
          <h1>Echo Studio v2</h1>
          <span className="studioV2Status">نسخة تجريبية</span>
        </div>
        <p>مساحة مستقرة لمعالجة الصور والفيديو والتصميم</p>
      </div>

      <label className="studioV2Language">
        <Languages aria-hidden="true" />
        <span>اللغة</span>
        <select value={lang} onChange={(event) => setLang(event.target.value as typeof lang)}>
          <option value="ar">العربية</option>
          <option value="de">Deutsch</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </label>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useLanguage } from "../../components/LanguageProvider";
import { studioTools } from "../config/adminTools";
import { adminToolsTranslations } from "../config/adminToolsTranslations";
import AdminToolLauncher from "./AdminToolLauncher";
import StudioTopToolbar from "./layout/StudioTopToolbar";

export default function AdminStudioHub() {
  const { lang, setLang } = useLanguage();
  const copy = adminToolsTranslations[lang];
  const description =
    lang === "ar"
      ? "مركز أدوات معالجة صور المنتجات وإنشاء المحتوى وتجهيز الوسائط."
      : copy.entries.studio.description;

  return (
    <>
      <StudioTopToolbar lang={lang} setLang={setLang} menuHref="/admin" />
      <main className="dkStandaloneAdmin" dir={lang === "ar" ? "rtl" : "ltr"}>
        <header>
          <Link href="/admin">← {copy.back}</Link>
          <div>
            <h1>EcoDekoKraft Studio</h1>
            <p>{description}</p>
          </div>
        </header>
        <AdminToolLauncher
          lang={lang}
          tools={studioTools}
          heading={false}
          filterByAccess={false}
          showNumbers
        />
      </main>
    </>
  );
}

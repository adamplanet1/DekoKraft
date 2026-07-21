"use client";

import Link from "next/link";
import { useLanguage } from "../LanguageProvider";

export default function HomeV2Footer() {
  const { t } = useLanguage();
  return (
    <footer className="homeV2Footer">
      <div className="publicContentContainer">
        <div>
          <strong>{t("header.brand")}</strong>
          <p>{t("footer.description")}</p>
        </div>
        <nav aria-label={t("footer.navigationLabel")}>
          <Link href="/seller/login">{t("footer.sellerLogin")}</Link>
          <Link href="/seller/dashboard">{t("footer.sellerDashboard")}</Link>
          <Link href="/admin">{t("footer.admin")}</Link>
        </nav>
      </div>
    </footer>
  );
}

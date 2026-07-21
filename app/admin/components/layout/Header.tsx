"use client";

import { DkBrand, type DkMenuAnchor } from "../../../components/ui";
import { publicPath } from "../../../lib/publicPath";
import type { CmsTabId } from "../../config/cmsTabs";
import type { Lang } from "../../config/translations";
import { createTranslator } from "../../../../locales";
import StudioTopToolbar from "./StudioTopToolbar";

type Props = {
  activeTab: CmsTabId;
  lang: Lang;
  setLang: (lang: Lang) => void;
  isMenuOpen: boolean;
  onToggleMenu: (anchor: DkMenuAnchor) => void;
};

export default function Header({
  activeTab,
  lang,
  setLang,
  isMenuOpen,
  onToggleMenu,
}: Props) {
  const safeLang = lang ?? "ar";
  const t = createTranslator(safeLang);

  return (
    <>
      <StudioTopToolbar
        lang={lang}
        setLang={setLang}
        isMenuOpen={isMenuOpen}
        onToggleMenu={onToggleMenu}
      />

      <div className="dkHeader">
        <div className="dkHeaderTitle dk-brand-hero">
        <DkBrand
          className="dk-brand-heading"
          name={t("header.brand")}
          subtitle={t("header.tagline")}
          mediaSrc="/videos/logo/logo.mp4"
          mediaType="video"
          mediaAlt="DekoKraft animated logo"
          fallbackImageSrc={publicPath("/logo-dekokraft-600.webp")}
        />
        {activeTab === "dashboard" && (
          <div className="dkAdminPageHeading">
            <h2 className="dk-dashboard-title">{t("admin.dashboard.pageTitle")}</h2>
            <p className="dk-admin-subtitle">
              {t("admin.dashboard.pageSubtitle")}
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

"use client";

import VideoBackground from "../../../../src/components/VideoBackground";
import { useLanguage } from "../../../components/LanguageProvider";
import { DkBrand, DkButton, DkGlassPanel } from "../../../components/ui";
import { publicPath } from "../../../lib/publicPath";
import type { LocaleMessages } from "../../../../locales";
import AdminFooter from "../layout/AdminFooter";
import StudioTopToolbar from "../layout/StudioTopToolbar";
import "../../admin-v2.css";

type AdminSectionKey = keyof LocaleMessages["dashboardCards"];

export default function AdminSectionPlaceholder({ section }: { section: AdminSectionKey }) {
  const { lang, setLang, direction, t } = useLanguage();

  return (
    <main className="admin-video-page dk-studio-page adminSectionPage" dir={direction}>
      <VideoBackground src={publicPath("/videos/backgrounds/creator-bg.mp4")} />
      <div className="admin-video-overlay dk-video-overlay" aria-hidden="true" />
      <div className="admin-video-content dk-studio-content adminSectionPageContent">
        <StudioTopToolbar lang={lang} setLang={setLang} menuHref="/admin" />
        <header className="adminSectionHeader">
          <DkBrand
            name={t("header.brand")}
            subtitle={t(`dashboardCards.${section}`)}
            mediaSrc={publicPath("/videos/logo/logo.mp4")}
            mediaType="video"
            mediaAlt="DekoKraft"
            fallbackImageSrc={publicPath("/logo-dekokraft-600.webp")}
            href="/admin"
          />
        </header>
        <DkGlassPanel as="section" strength="normal" className="adminSectionPlaceholder">
          <h1>{t(`dashboardCards.${section}`)}</h1>
          <p>{t("admin.readySection")}</p>
          <DkButton href="/admin" variant="glass" size="md">
            {t("admin.brainCenter.backToDashboard")}
          </DkButton>
        </DkGlassPanel>
        <AdminFooter lang={lang} version={t("admin.version")} rights={t("admin.rights")} />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import VideoBackground from "../../../src/components/VideoBackground";
import { useLanguage } from "../../components/LanguageProvider";
import { DkBrand, type DkMenuAnchor } from "../../components/ui";
import { publicPath } from "../../lib/publicPath";
import AdminFooter from "../../admin/components/layout/AdminFooter";
import StudioTopToolbar from "../../admin/components/layout/StudioTopToolbar";
import ParticipantSidebar from "./ParticipantSidebar";

export default function ParticipantStudioShell({ children, participantId, viewerRole = "participant" }: { children: ReactNode; participantId: string; viewerRole?: "participant" | "admin" }) {
  const { lang, setLang, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<DkMenuAnchor | null>(null);
  const direction = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  return (
    <main
      className="participantStudioShell"
      dir={direction}
      data-dir={direction}
      data-menu-open={isMenuOpen || undefined}
    >
      <VideoBackground src={publicPath("/videos/backgrounds/creator-bg.mp4")} />
      <div className="participantStudioOverlay" aria-hidden="true" />
      <div className="participantStudioContent">
        {viewerRole === "admin" && <div className="participantAdminPreviewBanner" role="status"><strong>وضع معاينة المدير</strong><Link href="/admin/sellers">العودة إلى لوحة المدير</Link></div>}
        <StudioTopToolbar
          lang={lang}
          setLang={setLang}
          isMenuOpen={isMenuOpen}
          menuControlsId="participant-navigation"
          settingsHref="/participant/settings"
          onToggleMenu={(anchor) => {
            setMenuAnchor(anchor);
            setIsMenuOpen((open) => !open);
          }}
        />

        <header className="participantStudioHeader">
          <DkBrand
            className="participantStudioBrand"
            name={t("header.brand")}
            subtitle={t("participantStudio.title")}
            mediaSrc={publicPath("/videos/logo/logo.mp4")}
            mediaType="video"
            mediaAlt="DekoKraft"
            fallbackImageSrc={publicPath("/logo-dekokraft-600.webp")}
            href="/home"
          />
          <h1>{t("participantStudio.title")}</h1>
          <p>{t("participantStudio.description")} · {participantId}</p>
        </header>

        <ParticipantSidebar
          lang={lang}
          isOpen={isMenuOpen}
          anchor={menuAnchor}
          onClose={() => setIsMenuOpen(false)}
        />

        <div className="participantStudioMain">{children}</div>

        <AdminFooter lang={lang} version="DekoKraft Participant Studio" rights="" />
      </div>
    </main>
  );
}

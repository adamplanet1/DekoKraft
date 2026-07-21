"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import type { Lang } from "../../locales";
import { publicPath } from "../lib/publicPath";
import { useLanguage } from "./LanguageProvider";

export type AnnouncementStory = readonly [string, string, string, string];

export type AnnouncementTheme =
  | "default"
  | "spring"
  | "summer"
  | "autumn"
  | "winter"
  | "romantic"
  | "market"
  | "workshop"
  | "celebration";

type AnnouncementThemeSettings = {
  image: string;
  overlay: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
};

export const announcementThemes = {
  default: {
    image: "none",
    overlay:
      "linear-gradient(90deg, rgba(205, 145, 35, 0.68), rgba(247, 211, 118, 0.64), rgba(188, 119, 24, 0.68)), repeating-linear-gradient(92deg, rgba(101, 61, 20, 0.08) 0, rgba(101, 61, 20, 0.08) 2px, transparent 2px, transparent 15px)",
    textColor: "#3b2917",
    borderColor: "rgba(91, 57, 13, 0.28)",
    accentColor: "#6b4316",
  },
  spring: {
    image: "url('/images/announcement/spring.webp')",
    overlay: "linear-gradient(90deg, rgba(235, 246, 221, 0.92), rgba(255, 240, 204, 0.88))",
    textColor: "#24351f",
    borderColor: "rgba(55, 91, 43, 0.3)",
    accentColor: "#4e743e",
  },
  summer: {
    image: "url('/images/announcement/summer.webp')",
    overlay: "linear-gradient(90deg, rgba(255, 222, 121, 0.9), rgba(243, 177, 67, 0.88))",
    textColor: "#3b2912",
    borderColor: "rgba(111, 70, 15, 0.3)",
    accentColor: "#9a5c0d",
  },
  autumn: {
    image: "url('/images/announcement/autumn.webp')",
    overlay: "linear-gradient(90deg, rgba(221, 157, 77, 0.92), rgba(153, 79, 34, 0.88))",
    textColor: "#24170d",
    borderColor: "rgba(74, 38, 18, 0.38)",
    accentColor: "#7d3519",
  },
  winter: {
    image: "url('/images/announcement/winter.webp')",
    overlay: "linear-gradient(90deg, rgba(226, 240, 245, 0.94), rgba(189, 215, 226, 0.9))",
    textColor: "#1d3039",
    borderColor: "rgba(43, 78, 94, 0.3)",
    accentColor: "#3d7187",
  },
  romantic: {
    image: "url('/images/announcement/romantic.webp')",
    overlay: "linear-gradient(90deg, rgba(250, 222, 225, 0.94), rgba(224, 169, 178, 0.9))",
    textColor: "#422129",
    borderColor: "rgba(111, 43, 59, 0.3)",
    accentColor: "#9b4058",
  },
  market: {
    image: "url('/images/announcement/market.webp')",
    overlay: "linear-gradient(90deg, rgba(241, 218, 164, 0.93), rgba(195, 146, 81, 0.9))",
    textColor: "#342517",
    borderColor: "rgba(91, 60, 28, 0.34)",
    accentColor: "#795126",
  },
  workshop: {
    image: "url('/images/announcement/workshop.webp')",
    overlay: "linear-gradient(90deg, rgba(221, 205, 180, 0.94), rgba(170, 132, 88, 0.9))",
    textColor: "#2f2419",
    borderColor: "rgba(71, 50, 28, 0.34)",
    accentColor: "#694a2b",
  },
  celebration: {
    image: "url('/images/announcement/celebration.webp')",
    overlay: "linear-gradient(90deg, rgba(250, 214, 113, 0.92), rgba(226, 145, 77, 0.9))",
    textColor: "#38200f",
    borderColor: "rgba(105, 54, 17, 0.34)",
    accentColor: "#a24f17",
  },
} satisfies Record<AnnouncementTheme, AnnouncementThemeSettings>;

type AnnouncementThemeProperties = CSSProperties & {
  "--announcement-bg-image": string;
  "--announcement-overlay": string;
  "--announcement-text-color": string;
  "--announcement-border-color": string;
  "--announcement-accent-color": string;
};

function AnnouncementLogo() {
  return (
    <span className="announcementLogo" aria-hidden="true">
      <Image
        src={publicPath("/logo-dekokraft-600.webp")}
        alt=""
        width={34}
        height={34}
      />
    </span>
  );
}

function AnnouncementSequence({
  messages,
  lang,
  showLogo,
  duplicate = false,
}: {
  messages: AnnouncementStory;
  lang: Lang;
  showLogo: boolean;
  duplicate?: boolean;
}) {
  return (
    <span
      className="announcementSequence"
      dir={lang === "ar" ? "rtl" : "ltr"}
      aria-hidden={duplicate || undefined}
    >
      <span className="announcementMessage">{messages[0]}</span>
      <span className="announcementGap announcementGapSmall" aria-hidden="true" />
      <span className="announcementMessage">{messages[1]}</span>
      <span className="announcementGap announcementGapLarge" aria-hidden="true" />
      {showLogo && <AnnouncementLogo />}
      <span className="announcementGap announcementGapLarge" aria-hidden="true" />
      <span className="announcementMessage">{messages[2]}</span>
      <span className="announcementGap announcementGapSmall" aria-hidden="true" />
      <span className="announcementMessage">{messages[3]}</span>
      <span className="announcementGap announcementGapLarge" aria-hidden="true" />
      {showLogo && <AnnouncementLogo />}
      <span className="announcementGap announcementGapLarge" aria-hidden="true" />
    </span>
  );
}

export type DkNotificationBarProps = {
  theme?: AnnouncementTheme;
  variant?: AnnouncementTheme;
  messages?: AnnouncementStory;
  direction?: "rtl" | "ltr";
  showLogo?: boolean;
};

export function DkNotificationBar({
  theme,
  variant = "default",
  messages: customMessages,
  direction,
  showLogo = true,
}: DkNotificationBarProps) {
  const { lang, dictionary } = useLanguage();
  const messages = customMessages ?? dictionary.announcement;
  const activeTheme = theme ?? variant;
  const activeLanguage: Lang = direction
    ? direction === "rtl"
      ? "ar"
      : lang === "ar"
        ? "en"
        : lang
    : lang;
  const themeSettings = announcementThemes[activeTheme];
  const themeProperties: AnnouncementThemeProperties = {
    "--announcement-bg-image": themeSettings.image,
    "--announcement-overlay": themeSettings.overlay,
    "--announcement-text-color": themeSettings.textColor,
    "--announcement-border-color": themeSettings.borderColor,
    "--announcement-accent-color": themeSettings.accentColor,
  };

  return (
    <div
      className="publicAnnouncement"
      data-announcement-direction={activeLanguage === "ar" ? "rtl" : "ltr"}
      data-announcement-theme={activeTheme}
      style={themeProperties}
      tabIndex={0}
    >
      <div className="announcementViewport">
        <div className="announcementTrack">
          <AnnouncementSequence messages={messages} lang={activeLanguage} showLogo={showLogo} />
          <AnnouncementSequence messages={messages} lang={activeLanguage} showLogo={showLogo} duplicate />
        </div>
      </div>
    </div>
  );
}

export default DkNotificationBar;

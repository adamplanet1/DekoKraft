"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import PublicPageShell from "../../components/PublicPageShell";
import { DkButton, DkGlassPanel } from "../../components/ui";
import {
  type WelcomeCardKey,
} from "../../../locales/welcome";
import WelcomeCard from "./WelcomeCard";
import WelcomeIntro from "./WelcomeIntro";
import WelcomeServicesCenter, {
  WELCOME_SERVICES_CENTER_ID,
} from "./WelcomeServicesCenter";
import { routes } from "../../config/routes";

const WELCOME_STORAGE_KEY = "dekokraft_welcome_seen_v1";
const WELCOME_INTRO_DURATION_MS = 5200;

type WelcomeCardDefinition = {
  key: WelcomeCardKey;
  icon: string;
  href?: string;
};

const WELCOME_CARDS: WelcomeCardDefinition[] = [
  { key: "home", icon: "🏠", href: routes.home },
  { key: "market", icon: "🛍️", href: routes.market },
  { key: "artisans", icon: "🎨", href: routes.info("artisans") },
  { key: "join", icon: "🧑‍🎨", href: routes.register },
  { key: "login", icon: "🔑", href: routes.login },
  { key: "about", icon: "ℹ️", href: routes.info("about") },
  { key: "comments", icon: "💬", href: routes.info("comments") },
  { key: "suggestions", icon: "💡", href: routes.info("suggestions") },
];

type IntroState = "checking" | "visible" | "hidden";

export default function WelcomePortal() {
  const { lang, t } = useLanguage();
  const [introState, setIntroState] = useState<IntroState>("checking");
  const [introRevision, setIntroRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const forceIntro = new URLSearchParams(window.location.search).get("intro") === "1";
    let hasSeenWelcome = false;

    try {
      hasSeenWelcome = sessionStorage.getItem(WELCOME_STORAGE_KEY) === "true";
    } catch {
      // Some mobile/private browsing modes can reject storage access.
    }

    setIntroState(forceIntro || !hasSeenWelcome ? "visible" : "hidden");
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current !== null) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const finishIntro = useCallback(() => {
    setIntroState("hidden");

    try {
      sessionStorage.setItem(WELCOME_STORAGE_KEY, "true");
    } catch {
      // Closing the intro must never depend on storage availability.
    }
  }, []);

  useEffect(() => {
    if (introState !== "visible") return;
    const timeout = window.setTimeout(finishIntro, WELCOME_INTRO_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [finishIntro, introState]);

  const showComingSoon = useCallback(() => {
    setNotice(t("welcome.comingSoon"));
    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => setNotice(""), 3200);
  }, [t]);

  const replayWelcome = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();

    try {
      sessionStorage.removeItem(WELCOME_STORAGE_KEY);
    } catch {
      // Restarting the intro must not depend on session storage availability.
    }

    try {
      localStorage.removeItem(WELCOME_STORAGE_KEY);
    } catch {
      // Local storage is only a defensive cleanup path.
    }

    if (noticeTimerRef.current !== null) {
      window.clearTimeout(noticeTimerRef.current);
      noticeTimerRef.current = null;
    }

    setNotice("");
    setIntroRevision((revision) => revision + 1);
    setIntroState("visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PublicPageShell className="welcomePublicShell">
    <main className="welcomePage" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div
        className="welcomePageContent"
        aria-hidden={introState === "visible" || undefined}
        inert={introState === "visible" || undefined}
      >
        <DkGlassPanel
          as="section"
          strength="subtle"
          className="welcomePortalPanel"
          aria-label={t("welcome.navigationLabel")}
        >
          <header className="welcomePortalHeader">
            <h1>{t("welcome.title")}</h1>
            <p>{t("welcome.subtitle")}</p>
          </header>

          <nav className="welcomePortalGrid" aria-label={t("welcome.navigationLabel")}>
            {WELCOME_CARDS.map((card) => (
              <WelcomeCard
                key={card.key}
                title={t(`welcome.cards.${card.key}`)}
                icon={card.icon}
                href={card.href}
                onClick={card.href ? undefined : showComingSoon}
              />
            ))}
            <WelcomeCard
              title={t("servicesCenter.open")}
              icon="🛠️"
              aria-controls={WELCOME_SERVICES_CENTER_ID}
              onClick={() => {
                document.getElementById(WELCOME_SERVICES_CENTER_ID)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />
            <WelcomeCard
              title={t("studio.center.welcomeCard")}
              icon="🧠"
              href={routes.studio}
            />
          </nav>

          <DkButton
            className="welcomeReplayButton"
            size="sm"
            type="button"
            variant="transparent"
            onClick={replayWelcome}
          >
            {t("welcome.replay")}
          </DkButton>
        </DkGlassPanel>

        <WelcomeServicesCenter />
      </div>

      {notice && (
        <p className="welcomeNotice" role="status" aria-live="polite">
          {notice}
        </p>
      )}

      {introState === "visible" && (
        <WelcomeIntro
          key={introRevision}
          title={t("welcome.introTitle")}
          tagline={t("welcome.introTagline")}
          skipLabel={t("welcome.skip")}
          onComplete={finishIntro}
        />
      )}
    </main>
    </PublicPageShell>
  );
}

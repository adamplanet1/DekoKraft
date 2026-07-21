"use client";

import { Menu, Store, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createTranslator, type Lang } from "../../../../locales";
import {
  DkIconButton,
  DkToolbar,
  DkToolbarGroup,
  readMenuAnchor,
  type DkMenuAnchor,
} from "../../../components/ui";

type Props = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isMenuOpen?: boolean;
  onToggleMenu?: (anchor: DkMenuAnchor) => void;
  menuHref?: string;
  menuControlsId?: string;
  settingsHref?: string;
};

const toolbarLanguageOrder: Lang[] = ["ar", "en", "de", "fr"];

export default function StudioTopToolbar({
  lang,
  setLang,
  isMenuOpen = false,
  onToggleMenu,
  menuHref,
  menuControlsId = "dk-admin-navigation",
  settingsHref,
}: Props) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const langBoxRef = useRef<HTMLDivElement>(null);
  const menuAnchorRef = useRef<HTMLSpanElement>(null);
  const safeLang = lang ?? "ar";
  const t = createTranslator(safeLang);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (
        langBoxRef.current &&
        !langBoxRef.current.contains(event.target as Node)
      ) {
        setShowLangMenu(false);
      }
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setShowLangMenu(false);
    }

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  const menuButton = (
    <span className="dk-menu-anchor" ref={menuAnchorRef}>
      {menuHref ? (
        <DkIconButton
          href={menuHref}
          icon={<Menu />}
          label={t("toolbar.openMenu")}
          className="studioToolbarControl studioMenuButton"
          size="sm"
          variant="glass"
        />
      ) : (
        <DkIconButton
          icon={<Menu />}
          label={t("toolbar.openMenu")}
          className="studioToolbarControl studioMenuButton"
          size="sm"
          variant="glass"
          aria-expanded={isMenuOpen}
          aria-controls={menuControlsId}
          onClick={() => {
            if (menuAnchorRef.current && onToggleMenu) {
              onToggleMenu(readMenuAnchor(menuAnchorRef.current));
            }
          }}
        />
      )}
    </span>
  );

  return (
    <DkToolbar className="studioTopToolbar" aria-label="DekoKraft toolbar">
      <DkToolbarGroup
        position="start"
        className="studioTopToolbarLeft toolbarUtilityGroup"
      >
        <DkIconButton
          href={settingsHref}
          icon={<span className="studioToolbarIcon">⚙️</span>}
          label={t("toolbar.openSettings")}
          className="studioToolbarControl studioSettingsButton"
          size="sm"
          variant="glass"
        />

        <div
          className="studioToolbarControl studioLanguageButton"
          ref={langBoxRef}
        >
          <DkIconButton
            icon={<span className="studioLanguageCode">{safeLang.toUpperCase()}</span>}
            label={t("toolbar.changeLanguage")}
            className="studioLanguageTrigger"
            size="sm"
            variant="transparent"
            aria-haspopup="menu"
            aria-expanded={showLangMenu}
            onClick={() => setShowLangMenu((open) => !open)}
          />
          {showLangMenu && (
            <div className="dkLangMenu studioLanguageMenu" role="menu">
              {toolbarLanguageOrder.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="menuitemradio"
                  aria-checked={option === safeLang}
                  onClick={() => {
                    setLang(option);
                    setShowLangMenu(false);
                  }}
                >
                  {option.toUpperCase()}
                  {option === safeLang && <span aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </DkToolbarGroup>

      <DkToolbarGroup
        position="end"
        className="studioTopToolbarRight toolbarPrimaryGroup"
      >
        <DkIconButton
          href="/home#marketplace"
          icon={<Store />}
          label={t("toolbar.openMarket")}
          className="studioToolbarControl studioMarketButton"
          size="sm"
          variant="glass"
        />

        <DkIconButton
          icon={<UserRound />}
          label={isLoggedIn ? t("toolbar.signOut") : t("toolbar.signIn")}
          className="studioToolbarControl studioLoginButton"
          size="sm"
          variant="glass"
          active={isLoggedIn}
          onClick={() => setIsLoggedIn((value) => !value)}
        />

        {menuButton}
      </DkToolbarGroup>
    </DkToolbar>
  );
}

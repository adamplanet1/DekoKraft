"use client";

import { usePathname } from "next/navigation";
import {
  DkAnchoredMenu,
  DkButton,
  type DkMenuAnchor,
} from "../../components/ui";
import type { Lang } from "../../../locales";
import {
  participantNavigationItems,
} from "../participantNavigation";
import { createTranslator, getTextDirection } from "../../../locales";

type ParticipantSidebarProps = {
  lang: Lang;
  isOpen: boolean;
  anchor: DkMenuAnchor | null;
  onClose: () => void;
};

export default function ParticipantSidebar({
  lang,
  isOpen,
  anchor,
  onClose,
}: ParticipantSidebarProps) {
  const pathname = usePathname();
  const t = createTranslator(lang);
  const direction = getTextDirection(lang);

  return (
    <DkAnchoredMenu
      id="participant-navigation"
      isOpen={isOpen}
      anchor={anchor}
      direction={direction}
      label={t("participantStudio.navigationLabel")}
      closeLabel={t("participantStudio.closeMenu")}
      className="participantNavigationDrawer dk-sidebar-panel"
      backdropClassName="participantNavigationBackdrop"
      onClose={onClose}
    >
      <nav className="participantNavigationList" aria-label={t("participantStudio.navigationLabel")}>
        {participantNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <DkButton
              key={item.key}
              href={item.enabled ? item.href : undefined}
              disabled={!item.enabled}
              aria-label={t(item.labelKey)}
              icon={<Icon />}
              active={pathname === item.href}
              variant="transparent"
              size="md"
              onClick={onClose}
            >
              {t(item.labelKey)}{!item.enabled && " · قريبًا"}
            </DkButton>
          );
        })}
      </nav>
    </DkAnchoredMenu>
  );
}

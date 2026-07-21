"use client";

import { RotateCcw, ScanEye, X } from "lucide-react";
import type { PointerEvent, RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type VideoActionsPanelProps = {
  isOpen: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  hasVideo: boolean;
  isComparing: boolean;
  onClose: () => void;
  onReset: () => void;
  onCompareStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareStop: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareKeyChange: (pressed: boolean) => void;
};

export default function VideoActionsPanel({ isOpen, closeButtonRef, hasVideo, isComparing, onClose, onReset, onCompareStart, onCompareStop, onCompareKeyChange }: VideoActionsPanelProps) {
  const { direction, t } = useLanguage();
  return (
    <aside id="echo-video-actions-panel" className={`echoVideoFiltersPanel echoVideoActionsPanel${isOpen ? " echoVideoFiltersPanel--open" : " echoVideoFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.video.actionsTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoVideoFiltersPanel__header">
        <div><h3>{t("studio.video.actionsTitle")}</h3><p>{t("studio.video.actionsDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoVideoIconButton echoVideoFiltersPanel__close" aria-label={t("studio.video.closeActions")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoVideoFiltersPanel__content echoVideoActionsPanel__content">
        <div className="echoVideoActionsPanel__actions">
          <button type="button" className="echoVideoActionButton echoVideoActionButton--reset" onClick={onReset}><RotateCcw size={18} aria-hidden="true" />{t("studio.video.reset")}</button>
          <button type="button" className="echoVideoActionButton echoVideoActionButton--compare" disabled={!hasVideo} aria-pressed={isComparing} onPointerDown={onCompareStart} onPointerUp={onCompareStop} onPointerCancel={onCompareStop} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(true); }} onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(false); }} onBlur={() => onCompareKeyChange(false)}><ScanEye size={18} aria-hidden="true" />{t("studio.video.compare")}</button>
        </div>
      </div>
    </aside>
  );
}

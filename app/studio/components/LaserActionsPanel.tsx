"use client";

import { RotateCcw, ScanEye, X } from "lucide-react";
import type { PointerEvent, RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type LaserActionsPanelProps = {
  isOpen: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  hasLaserImage: boolean;
  isComparing: boolean;
  onClose: () => void;
  onReset: () => void;
  onCompareStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareStop: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareKeyChange: (pressed: boolean) => void;
};

export default function LaserActionsPanel({ isOpen, closeButtonRef, hasLaserImage, isComparing, onClose, onReset, onCompareStart, onCompareStop, onCompareKeyChange }: LaserActionsPanelProps) {
  const { direction, t } = useLanguage();
  return (
    <aside id="echo-laser-actions-panel" className={`echoLaserFiltersPanel echoLaserActionsPanel${isOpen ? " echoLaserFiltersPanel--open" : " echoLaserFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.laserProcessing.actionsTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoLaserFiltersPanel__header">
        <div><h3>{t("studio.laserProcessing.actionsTitle")}</h3><p>{t("studio.laserProcessing.actionsDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoLaserIconButton echoLaserFiltersPanel__close" aria-label={t("studio.laserProcessing.closeActions")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoLaserFiltersPanel__content echoLaserActionsPanel__content">
        <div className="echoLaserActionsPanel__actions">
          <button type="button" className="echoLaserActionButton echoLaserActionButton--reset" onClick={onReset}><RotateCcw size={18} aria-hidden="true" />{t("studio.laserProcessing.reset")}</button>
          <button type="button" className="echoLaserActionButton echoLaserActionButton--compare" disabled={!hasLaserImage} aria-pressed={isComparing} onPointerDown={onCompareStart} onPointerUp={onCompareStop} onPointerCancel={onCompareStop} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(true); }} onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(false); }} onBlur={() => onCompareKeyChange(false)}><ScanEye size={18} aria-hidden="true" />{t("studio.laserProcessing.compare")}</button>
        </div>
      </div>
    </aside>
  );
}

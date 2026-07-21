"use client";

import { RotateCcw, ScanEye, X } from "lucide-react";
import type { PointerEvent, RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type EmbroideryActionsPanelProps = {
  isOpen: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  hasEmbroideryImage: boolean;
  isComparing: boolean;
  onClose: () => void;
  onReset: () => void;
  onCompareStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareStop: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareKeyChange: (pressed: boolean) => void;
};

export default function EmbroideryActionsPanel({ isOpen, closeButtonRef, hasEmbroideryImage, isComparing, onClose, onReset, onCompareStart, onCompareStop, onCompareKeyChange }: EmbroideryActionsPanelProps) {
  const { direction, t } = useLanguage();
  return (
    <aside id="echo-embroidery-actions-panel" className={`echoEmbroideryFiltersPanel echoEmbroideryActionsPanel${isOpen ? " echoEmbroideryFiltersPanel--open" : " echoEmbroideryFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.embroideryProcessing.actionsTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoEmbroideryFiltersPanel__header">
        <div><h3>{t("studio.embroideryProcessing.actionsTitle")}</h3><p>{t("studio.embroideryProcessing.actionsDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoEmbroideryIconButton echoEmbroideryFiltersPanel__close" aria-label={t("studio.embroideryProcessing.closeActions")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoEmbroideryFiltersPanel__content echoEmbroideryActionsPanel__content">
        <div className="echoEmbroideryActionsPanel__actions">
          <button type="button" className="echoEmbroideryActionButton echoEmbroideryActionButton--reset" onClick={onReset}><RotateCcw size={18} aria-hidden="true" />{t("studio.embroideryProcessing.reset")}</button>
          <button type="button" className="echoEmbroideryActionButton echoEmbroideryActionButton--compare" disabled={!hasEmbroideryImage} aria-pressed={isComparing} onPointerDown={onCompareStart} onPointerUp={onCompareStop} onPointerCancel={onCompareStop} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(true); }} onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(false); }} onBlur={() => onCompareKeyChange(false)}><ScanEye size={18} aria-hidden="true" />{t("studio.embroideryProcessing.compare")}</button>
        </div>
      </div>
    </aside>
  );
}

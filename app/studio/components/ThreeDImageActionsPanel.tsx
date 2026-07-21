"use client";

import { RotateCcw, ScanEye, X } from "lucide-react";
import type { PointerEvent, RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type ThreeDImageActionsPanelProps = {
  isOpen: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  hasThreeDImage: boolean;
  isComparing: boolean;
  onClose: () => void;
  onReset: () => void;
  onCompareStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareStop: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareKeyChange: (pressed: boolean) => void;
};

export default function ThreeDImageActionsPanel({ isOpen, closeButtonRef, hasThreeDImage, isComparing, onClose, onReset, onCompareStart, onCompareStop, onCompareKeyChange }: ThreeDImageActionsPanelProps) {
  const { direction, t } = useLanguage();
  return (
    <aside id="echo-three-d-image-actions-panel" className={`echoThreeDImageFiltersPanel echoThreeDImageActionsPanel${isOpen ? " echoThreeDImageFiltersPanel--open" : " echoThreeDImageFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.threeDImage.actionsTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoThreeDImageFiltersPanel__header">
        <div><h3>{t("studio.threeDImage.actionsTitle")}</h3><p>{t("studio.threeDImage.actionsDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoThreeDImageIconButton echoThreeDImageFiltersPanel__close" aria-label={t("studio.threeDImage.closeActions")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoThreeDImageFiltersPanel__content echoThreeDImageActionsPanel__content">
        <div className="echoThreeDImageActionsPanel__actions">
          <button type="button" className="echoThreeDImageActionButton echoThreeDImageActionButton--reset" onClick={onReset}><RotateCcw size={18} aria-hidden="true" />{t("studio.threeDImage.reset")}</button>
          <button type="button" className="echoThreeDImageActionButton echoThreeDImageActionButton--compare" disabled={!hasThreeDImage} aria-pressed={isComparing} onPointerDown={onCompareStart} onPointerUp={onCompareStop} onPointerCancel={onCompareStop} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(true); }} onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(false); }} onBlur={() => onCompareKeyChange(false)}><ScanEye size={18} aria-hidden="true" />{t("studio.threeDImage.compare")}</button>
        </div>
      </div>
    </aside>
  );
}

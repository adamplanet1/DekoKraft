"use client";

import { RotateCcw, ScanEye, X } from "lucide-react";
import type { PointerEvent, RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type SmartEditActionsPanelProps = {
  isOpen: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  hasSmartEditImage: boolean;
  isComparing: boolean;
  onClose: () => void;
  onReset: () => void;
  onCompareStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareStop: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareKeyChange: (pressed: boolean) => void;
};

export default function SmartEditActionsPanel({ isOpen, closeButtonRef, hasSmartEditImage, isComparing, onClose, onReset, onCompareStart, onCompareStop, onCompareKeyChange }: SmartEditActionsPanelProps) {
  const { direction, t } = useLanguage();
  return (
    <aside id="echo-smart-edit-actions-panel" className={`echoSmartEditFiltersPanel echoSmartEditActionsPanel${isOpen ? " echoSmartEditFiltersPanel--open" : " echoSmartEditFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.smartEditProcessing.actionsTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoSmartEditFiltersPanel__header">
        <div><h3>{t("studio.smartEditProcessing.actionsTitle")}</h3><p>{t("studio.smartEditProcessing.actionsDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoSmartEditIconButton echoSmartEditFiltersPanel__close" aria-label={t("studio.smartEditProcessing.closeActions")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoSmartEditFiltersPanel__content echoSmartEditActionsPanel__content">
        <div className="echoSmartEditActionsPanel__actions">
          <button type="button" className="echoSmartEditActionButton echoSmartEditActionButton--reset" onClick={onReset}><RotateCcw size={18} aria-hidden="true" />{t("studio.smartEditProcessing.reset")}</button>
          <button type="button" className="echoSmartEditActionButton echoSmartEditActionButton--compare" disabled={!hasSmartEditImage} aria-pressed={isComparing} onPointerDown={onCompareStart} onPointerUp={onCompareStop} onPointerCancel={onCompareStop} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(true); }} onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(false); }} onBlur={() => onCompareKeyChange(false)}><ScanEye size={18} aria-hidden="true" />{t("studio.smartEditProcessing.compare")}</button>
        </div>
      </div>
    </aside>
  );
}

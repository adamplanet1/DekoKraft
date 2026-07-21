"use client";

import { RotateCcw, ScanEye, X } from "lucide-react";
import type { PointerEvent, RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type ImageActionsPanelProps = {
  isOpen: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  hasImage: boolean;
  isComparing: boolean;
  onClose: () => void;
  onReset: () => void;
  onCompareStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareStop: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareKeyChange: (isPressed: boolean) => void;
};

export default function ImageActionsPanel({
  isOpen,
  closeButtonRef,
  hasImage,
  isComparing,
  onClose,
  onReset,
  onCompareStart,
  onCompareStop,
  onCompareKeyChange,
}: ImageActionsPanelProps) {
  const { direction, t } = useLanguage();

  return (
    <aside
      id="echo-image-actions-panel"
      className={`echoImageFiltersPanel echoImageActionsPanel${isOpen ? " echoImageFiltersPanel--open" : " echoImageFiltersPanel--closed"}`}
      role="complementary"
      aria-label={t("studio.image.actionsTitle")}
      aria-hidden={!isOpen}
      dir={direction}
    >
      <header className="echoImageFiltersPanel__header">
        <div>
          <h3>{t("studio.image.actionsTitle")}</h3>
          <p>{t("studio.image.actionsDescription")}</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          className="echoImageIconButton echoImageFiltersPanel__close"
          aria-label={t("studio.image.closeActions")}
          tabIndex={isOpen ? 0 : -1}
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="echoImageFiltersPanel__content echoImageActionsPanel__content">
        <div className="echoImageActionsPanel__actions">
          <button type="button" className="echoImageActionButton echoImageActionButton--reset" onClick={onReset}>
            <RotateCcw size={18} aria-hidden="true" />
            {t("studio.image.reset")}
          </button>
          <button
            type="button"
            className="echoImageActionButton echoImageActionButton--compare"
            disabled={!hasImage}
            aria-pressed={isComparing}
            onPointerDown={onCompareStart}
            onPointerUp={onCompareStop}
            onPointerCancel={onCompareStop}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") onCompareKeyChange(true);
            }}
            onKeyUp={(event) => {
              if (event.key === " " || event.key === "Enter") onCompareKeyChange(false);
            }}
            onBlur={() => onCompareKeyChange(false)}
          >
            <ScanEye size={18} aria-hidden="true" />
            {t("studio.image.compare")}
          </button>
        </div>
      </div>
    </aside>
  );
}

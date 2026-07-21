"use client";

import { X } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import SmartEditFilterControl from "./SmartEditFilterControl";

type SmartEditFiltersPanelProps = {
  isOpen: boolean;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  onClose: () => void;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onSharpnessChange: (value: number) => void;
  onBlurChange: (value: number) => void;
  onGrayscaleChange: (value: number) => void;
  onSepiaChange: (value: number) => void;
  onHueRotateChange: (value: number) => void;
};

export default function SmartEditFiltersPanel(props: SmartEditFiltersPanelProps) {
  const { direction, t } = useLanguage();
  const { isOpen, closeButtonRef, onClose } = props;

  return (
    <aside id="echo-smart-edit-filters-panel" className={`echoSmartEditFiltersPanel${isOpen ? " echoSmartEditFiltersPanel--open" : " echoSmartEditFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.smartEditProcessing.filtersTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoSmartEditFiltersPanel__header">
        <div><h3>{t("studio.smartEditProcessing.filtersTitle")}</h3><p>{t("studio.smartEditProcessing.filtersDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoSmartEditIconButton echoSmartEditFiltersPanel__close" aria-label={t("studio.smartEditProcessing.closeFilters")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoSmartEditFiltersPanel__content">
        <section className="echoSmartEditFilterGroup" aria-labelledby="echo-smart-edit-filter-lighting-title">
          <h4 id="echo-smart-edit-filter-lighting-title">{t("studio.smartEditProcessing.groupLighting")}</h4>
          <SmartEditFilterControl id="echo-smart-edit-brightness" label={t("studio.smartEditProcessing.brightness")} value={props.brightness} min={0} max={200} onChange={props.onBrightnessChange} />
          <SmartEditFilterControl id="echo-smart-edit-contrast" label={t("studio.smartEditProcessing.contrast")} value={props.contrast} min={0} max={200} onChange={props.onContrastChange} />
        </section>
        <section className="echoSmartEditFilterGroup" aria-labelledby="echo-smart-edit-filter-colors-title">
          <h4 id="echo-smart-edit-filter-colors-title">{t("studio.smartEditProcessing.groupColors")}</h4>
          <SmartEditFilterControl id="echo-smart-edit-saturation" label={t("studio.smartEditProcessing.saturation")} value={props.saturation} min={0} max={200} onChange={props.onSaturationChange} />
          <SmartEditFilterControl id="echo-smart-edit-grayscale" label={t("studio.smartEditProcessing.grayscale")} value={props.grayscale} min={0} max={100} onChange={props.onGrayscaleChange} />
          <SmartEditFilterControl id="echo-smart-edit-sepia" label={t("studio.smartEditProcessing.sepia")} value={props.sepia} min={0} max={100} onChange={props.onSepiaChange} />
          <SmartEditFilterControl id="echo-smart-edit-hue" label={t("studio.smartEditProcessing.hueRotate")} value={props.hueRotate} min={0} max={360} unit="°" onChange={props.onHueRotateChange} />
        </section>
        <section className="echoSmartEditFilterGroup" aria-labelledby="echo-smart-edit-filter-details-title">
          <h4 id="echo-smart-edit-filter-details-title">{t("studio.smartEditProcessing.groupDetails")}</h4>
          <SmartEditFilterControl id="echo-smart-edit-sharpness" label={t("studio.smartEditProcessing.sharpness")} value={props.sharpness} min={0} max={100} note={t("studio.smartEditProcessing.sharpnessPlaceholder")} onChange={props.onSharpnessChange} />
          <SmartEditFilterControl id="echo-smart-edit-blur" label={t("studio.smartEditProcessing.blur")} value={props.blur} min={0} max={20} unit="px" onChange={props.onBlurChange} />
        </section>
      </div>
    </aside>
  );
}

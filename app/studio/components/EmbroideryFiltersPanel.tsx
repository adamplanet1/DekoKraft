"use client";

import { X } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import EmbroideryFilterControl from "./EmbroideryFilterControl";

type EmbroideryFiltersPanelProps = {
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

export default function EmbroideryFiltersPanel(props: EmbroideryFiltersPanelProps) {
  const { direction, t } = useLanguage();
  const { isOpen, closeButtonRef, onClose } = props;

  return (
    <aside id="echo-embroidery-filters-panel" className={`echoEmbroideryFiltersPanel${isOpen ? " echoEmbroideryFiltersPanel--open" : " echoEmbroideryFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.embroideryProcessing.filtersTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoEmbroideryFiltersPanel__header">
        <div><h3>{t("studio.embroideryProcessing.filtersTitle")}</h3><p>{t("studio.embroideryProcessing.filtersDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoEmbroideryIconButton echoEmbroideryFiltersPanel__close" aria-label={t("studio.embroideryProcessing.closeFilters")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoEmbroideryFiltersPanel__content">
        <section className="echoEmbroideryFilterGroup" aria-labelledby="echo-embroidery-filter-lighting-title">
          <h4 id="echo-embroidery-filter-lighting-title">{t("studio.embroideryProcessing.groupLighting")}</h4>
          <EmbroideryFilterControl id="echo-embroidery-brightness" label={t("studio.embroideryProcessing.brightness")} value={props.brightness} min={0} max={200} onChange={props.onBrightnessChange} />
          <EmbroideryFilterControl id="echo-embroidery-contrast" label={t("studio.embroideryProcessing.contrast")} value={props.contrast} min={0} max={200} onChange={props.onContrastChange} />
        </section>
        <section className="echoEmbroideryFilterGroup" aria-labelledby="echo-embroidery-filter-colors-title">
          <h4 id="echo-embroidery-filter-colors-title">{t("studio.embroideryProcessing.groupColors")}</h4>
          <EmbroideryFilterControl id="echo-embroidery-saturation" label={t("studio.embroideryProcessing.saturation")} value={props.saturation} min={0} max={200} onChange={props.onSaturationChange} />
          <EmbroideryFilterControl id="echo-embroidery-grayscale" label={t("studio.embroideryProcessing.grayscale")} value={props.grayscale} min={0} max={100} onChange={props.onGrayscaleChange} />
          <EmbroideryFilterControl id="echo-embroidery-sepia" label={t("studio.embroideryProcessing.sepia")} value={props.sepia} min={0} max={100} onChange={props.onSepiaChange} />
          <EmbroideryFilterControl id="echo-embroidery-hue" label={t("studio.embroideryProcessing.hueRotate")} value={props.hueRotate} min={0} max={360} unit="°" onChange={props.onHueRotateChange} />
        </section>
        <section className="echoEmbroideryFilterGroup" aria-labelledby="echo-embroidery-filter-details-title">
          <h4 id="echo-embroidery-filter-details-title">{t("studio.embroideryProcessing.groupDetails")}</h4>
          <EmbroideryFilterControl id="echo-embroidery-sharpness" label={t("studio.embroideryProcessing.sharpness")} value={props.sharpness} min={0} max={100} note={t("studio.embroideryProcessing.sharpnessPlaceholder")} onChange={props.onSharpnessChange} />
          <EmbroideryFilterControl id="echo-embroidery-blur" label={t("studio.embroideryProcessing.blur")} value={props.blur} min={0} max={20} unit="px" onChange={props.onBlurChange} />
        </section>
      </div>
    </aside>
  );
}

"use client";

import { X } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import ThreeDImageFilterControl from "./ThreeDImageFilterControl";

type ThreeDImageFiltersPanelProps = {
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

export default function ThreeDImageFiltersPanel(props: ThreeDImageFiltersPanelProps) {
  const { direction, t } = useLanguage();
  const { isOpen, closeButtonRef, onClose } = props;

  return (
    <aside id="echo-three-d-image-filters-panel" className={`echoThreeDImageFiltersPanel${isOpen ? " echoThreeDImageFiltersPanel--open" : " echoThreeDImageFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.threeDImage.filtersTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoThreeDImageFiltersPanel__header">
        <div><h3>{t("studio.threeDImage.filtersTitle")}</h3><p>{t("studio.threeDImage.filtersDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoThreeDImageIconButton echoThreeDImageFiltersPanel__close" aria-label={t("studio.threeDImage.closeFilters")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoThreeDImageFiltersPanel__content">
        <section className="echoThreeDImageFilterGroup" aria-labelledby="echo-three-d-image-filter-lighting-title">
          <h4 id="echo-three-d-image-filter-lighting-title">{t("studio.threeDImage.groupLighting")}</h4>
          <ThreeDImageFilterControl id="echo-three-d-image-brightness" label={t("studio.threeDImage.brightness")} value={props.brightness} min={0} max={200} onChange={props.onBrightnessChange} />
          <ThreeDImageFilterControl id="echo-three-d-image-contrast" label={t("studio.threeDImage.contrast")} value={props.contrast} min={0} max={200} onChange={props.onContrastChange} />
        </section>
        <section className="echoThreeDImageFilterGroup" aria-labelledby="echo-three-d-image-filter-colors-title">
          <h4 id="echo-three-d-image-filter-colors-title">{t("studio.threeDImage.groupColors")}</h4>
          <ThreeDImageFilterControl id="echo-three-d-image-saturation" label={t("studio.threeDImage.saturation")} value={props.saturation} min={0} max={200} onChange={props.onSaturationChange} />
          <ThreeDImageFilterControl id="echo-three-d-image-grayscale" label={t("studio.threeDImage.grayscale")} value={props.grayscale} min={0} max={100} onChange={props.onGrayscaleChange} />
          <ThreeDImageFilterControl id="echo-three-d-image-sepia" label={t("studio.threeDImage.sepia")} value={props.sepia} min={0} max={100} onChange={props.onSepiaChange} />
          <ThreeDImageFilterControl id="echo-three-d-image-hue" label={t("studio.threeDImage.hueRotate")} value={props.hueRotate} min={0} max={360} unit="°" onChange={props.onHueRotateChange} />
        </section>
        <section className="echoThreeDImageFilterGroup" aria-labelledby="echo-three-d-image-filter-details-title">
          <h4 id="echo-three-d-image-filter-details-title">{t("studio.threeDImage.groupDetails")}</h4>
          <ThreeDImageFilterControl id="echo-three-d-image-sharpness" label={t("studio.threeDImage.sharpness")} value={props.sharpness} min={0} max={100} note={t("studio.threeDImage.sharpnessPlaceholder")} onChange={props.onSharpnessChange} />
          <ThreeDImageFilterControl id="echo-three-d-image-blur" label={t("studio.threeDImage.blur")} value={props.blur} min={0} max={20} unit="px" onChange={props.onBlurChange} />
        </section>
      </div>
    </aside>
  );
}

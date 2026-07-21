"use client";

import { X } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import LaserFilterControl from "./LaserFilterControl";

type LaserFiltersPanelProps = {
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

export default function LaserFiltersPanel(props: LaserFiltersPanelProps) {
  const { direction, t } = useLanguage();
  const { isOpen, closeButtonRef, onClose } = props;

  return (
    <aside id="echo-laser-filters-panel" className={`echoLaserFiltersPanel${isOpen ? " echoLaserFiltersPanel--open" : " echoLaserFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.laserProcessing.filtersTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoLaserFiltersPanel__header">
        <div><h3>{t("studio.laserProcessing.filtersTitle")}</h3><p>{t("studio.laserProcessing.filtersDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoLaserIconButton echoLaserFiltersPanel__close" aria-label={t("studio.laserProcessing.closeFilters")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoLaserFiltersPanel__content">
        <section className="echoLaserFilterGroup" aria-labelledby="echo-laser-filter-lighting-title">
          <h4 id="echo-laser-filter-lighting-title">{t("studio.laserProcessing.groupLighting")}</h4>
          <LaserFilterControl id="echo-laser-brightness" label={t("studio.laserProcessing.brightness")} value={props.brightness} min={0} max={200} onChange={props.onBrightnessChange} />
          <LaserFilterControl id="echo-laser-contrast" label={t("studio.laserProcessing.contrast")} value={props.contrast} min={0} max={200} onChange={props.onContrastChange} />
        </section>
        <section className="echoLaserFilterGroup" aria-labelledby="echo-laser-filter-colors-title">
          <h4 id="echo-laser-filter-colors-title">{t("studio.laserProcessing.groupColors")}</h4>
          <LaserFilterControl id="echo-laser-saturation" label={t("studio.laserProcessing.saturation")} value={props.saturation} min={0} max={200} onChange={props.onSaturationChange} />
          <LaserFilterControl id="echo-laser-grayscale" label={t("studio.laserProcessing.grayscale")} value={props.grayscale} min={0} max={100} onChange={props.onGrayscaleChange} />
          <LaserFilterControl id="echo-laser-sepia" label={t("studio.laserProcessing.sepia")} value={props.sepia} min={0} max={100} onChange={props.onSepiaChange} />
          <LaserFilterControl id="echo-laser-hue" label={t("studio.laserProcessing.hueRotate")} value={props.hueRotate} min={0} max={360} unit="°" onChange={props.onHueRotateChange} />
        </section>
        <section className="echoLaserFilterGroup" aria-labelledby="echo-laser-filter-details-title">
          <h4 id="echo-laser-filter-details-title">{t("studio.laserProcessing.groupDetails")}</h4>
          <LaserFilterControl id="echo-laser-sharpness" label={t("studio.laserProcessing.sharpness")} value={props.sharpness} min={0} max={100} note={t("studio.laserProcessing.sharpnessPlaceholder")} onChange={props.onSharpnessChange} />
          <LaserFilterControl id="echo-laser-blur" label={t("studio.laserProcessing.blur")} value={props.blur} min={0} max={20} unit="px" onChange={props.onBlurChange} />
        </section>
      </div>
    </aside>
  );
}

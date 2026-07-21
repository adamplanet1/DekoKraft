"use client";

import { X } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import VideoFilterControl from "./VideoFilterControl";

type VideoFiltersPanelProps = {
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

export default function VideoFiltersPanel(props: VideoFiltersPanelProps) {
  const { direction, t } = useLanguage();
  const { isOpen, closeButtonRef, onClose } = props;

  return (
    <aside id="echo-video-filters-panel" className={`echoVideoFiltersPanel${isOpen ? " echoVideoFiltersPanel--open" : " echoVideoFiltersPanel--closed"}`} role="complementary" aria-label={t("studio.video.filtersTitle")} aria-hidden={!isOpen} dir={direction}>
      <header className="echoVideoFiltersPanel__header">
        <div><h3>{t("studio.video.filtersTitle")}</h3><p>{t("studio.video.filtersDescription")}</p></div>
        <button ref={closeButtonRef} type="button" className="echoVideoIconButton echoVideoFiltersPanel__close" aria-label={t("studio.video.closeFilters")} tabIndex={isOpen ? 0 : -1} onClick={onClose}><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="echoVideoFiltersPanel__content">
        <section className="echoVideoFilterGroup" aria-labelledby="echo-video-filter-lighting-title">
          <h4 id="echo-video-filter-lighting-title">{t("studio.video.groupLighting")}</h4>
          <VideoFilterControl id="echo-video-brightness" label={t("studio.video.brightness")} value={props.brightness} min={0} max={200} onChange={props.onBrightnessChange} />
          <VideoFilterControl id="echo-video-contrast" label={t("studio.video.contrast")} value={props.contrast} min={0} max={200} onChange={props.onContrastChange} />
        </section>
        <section className="echoVideoFilterGroup" aria-labelledby="echo-video-filter-colors-title">
          <h4 id="echo-video-filter-colors-title">{t("studio.video.groupColors")}</h4>
          <VideoFilterControl id="echo-video-saturation" label={t("studio.video.saturation")} value={props.saturation} min={0} max={200} onChange={props.onSaturationChange} />
          <VideoFilterControl id="echo-video-grayscale" label={t("studio.video.grayscale")} value={props.grayscale} min={0} max={100} onChange={props.onGrayscaleChange} />
          <VideoFilterControl id="echo-video-sepia" label={t("studio.video.sepia")} value={props.sepia} min={0} max={100} onChange={props.onSepiaChange} />
          <VideoFilterControl id="echo-video-hue" label={t("studio.video.hueRotate")} value={props.hueRotate} min={0} max={360} unit="°" onChange={props.onHueRotateChange} />
        </section>
        <section className="echoVideoFilterGroup" aria-labelledby="echo-video-filter-details-title">
          <h4 id="echo-video-filter-details-title">{t("studio.video.groupDetails")}</h4>
          <VideoFilterControl id="echo-video-sharpness" label={t("studio.video.sharpness")} value={props.sharpness} min={0} max={100} note={t("studio.video.sharpnessPlaceholder")} onChange={props.onSharpnessChange} />
          <VideoFilterControl id="echo-video-blur" label={t("studio.video.blur")} value={props.blur} min={0} max={20} unit="px" onChange={props.onBlurChange} />
        </section>
      </div>
    </aside>
  );
}

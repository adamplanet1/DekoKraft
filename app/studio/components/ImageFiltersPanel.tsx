"use client";

import { X } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import ImageFilterControl from "./ImageFilterControl";

type ImageFiltersPanelProps = {
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

export default function ImageFiltersPanel({
  isOpen,
  closeButtonRef,
  brightness,
  contrast,
  saturation,
  sharpness,
  blur,
  grayscale,
  sepia,
  hueRotate,
  onClose,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onSharpnessChange,
  onBlurChange,
  onGrayscaleChange,
  onSepiaChange,
  onHueRotateChange,
}: ImageFiltersPanelProps) {
  const { direction, t } = useLanguage();

  return (
    <aside
      id="echo-image-filters-panel"
      className={`echoImageFiltersPanel${isOpen ? " echoImageFiltersPanel--open" : " echoImageFiltersPanel--closed"}`}
      role="complementary"
      aria-label={t("studio.image.filtersTitle")}
      aria-hidden={!isOpen}
      dir={direction}
    >
      <header className="echoImageFiltersPanel__header">
        <div>
          <h3>{t("studio.image.filtersTitle")}</h3>
          <p>{t("studio.image.filtersDescription")}</p>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          className="echoImageIconButton echoImageFiltersPanel__close"
          aria-label={t("studio.image.closeFilters")}
          tabIndex={isOpen ? 0 : -1}
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="echoImageFiltersPanel__content">
        <section className="echoImageFilterGroup" aria-labelledby="echo-filter-lighting-title">
          <h4 id="echo-filter-lighting-title">{t("studio.image.groupLighting")}</h4>
          <ImageFilterControl id="echo-brightness" label={t("studio.image.brightness")} value={brightness} min={0} max={200} onChange={onBrightnessChange} />
          <ImageFilterControl id="echo-contrast" label={t("studio.image.contrast")} value={contrast} min={0} max={200} onChange={onContrastChange} />
        </section>

        <section className="echoImageFilterGroup" aria-labelledby="echo-filter-colors-title">
          <h4 id="echo-filter-colors-title">{t("studio.image.groupColors")}</h4>
          <ImageFilterControl id="echo-saturation" label={t("studio.image.saturation")} value={saturation} min={0} max={200} onChange={onSaturationChange} />
          <ImageFilterControl id="echo-grayscale" label={t("studio.image.grayscale")} value={grayscale} min={0} max={100} onChange={onGrayscaleChange} />
          <ImageFilterControl id="echo-sepia" label={t("studio.image.sepia")} value={sepia} min={0} max={100} onChange={onSepiaChange} />
          <ImageFilterControl id="echo-hue" label={t("studio.image.hueRotate")} value={hueRotate} min={0} max={360} unit="°" onChange={onHueRotateChange} />
        </section>

        <section className="echoImageFilterGroup" aria-labelledby="echo-filter-details-title">
          <h4 id="echo-filter-details-title">{t("studio.image.groupDetails")}</h4>
          <ImageFilterControl id="echo-sharpness" label={t("studio.image.sharpness")} value={sharpness} min={0} max={100} note={t("studio.image.sharpnessPlaceholder")} onChange={onSharpnessChange} />
          <ImageFilterControl id="echo-blur" label={t("studio.image.blur")} value={blur} min={0} max={20} unit="px" onChange={onBlurChange} />
        </section>
      </div>
    </aside>
  );
}

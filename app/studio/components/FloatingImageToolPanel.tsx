"use client";

import {
  Droplets,
  Eraser,
  ImageOff,
  Layers,
  RotateCcw,
  ScanEye,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sun,
  WandSparkles,
} from "lucide-react";
import { useState, type PointerEvent, type RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import ImageFilterControl from "./ImageFilterControl";
import FloatingStudioPanel from "./FloatingStudioPanel";

export type FloatingImagePanelMode = "filters" | "actions";

type FloatingImageToolPanelProps = {
  isOpen: boolean;
  mode: FloatingImagePanelMode;
  boundaryRef: RefObject<HTMLDivElement | null>;
  initialAnchorRef: RefObject<HTMLElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  hasImage: boolean;
  isComparing: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  onClose: () => void;
  onReset: () => void;
  onCompareStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareStop: (event: PointerEvent<HTMLButtonElement>) => void;
  onCompareKeyChange: (isPressed: boolean) => void;
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onSharpnessChange: (value: number) => void;
  onBlurChange: (value: number) => void;
  onGrayscaleChange: (value: number) => void;
  onSepiaChange: (value: number) => void;
  onHueRotateChange: (value: number) => void;
};

export default function FloatingImageToolPanel({
  isOpen,
  mode,
  boundaryRef,
  initialAnchorRef,
  closeButtonRef,
  hasImage,
  isComparing,
  brightness,
  contrast,
  saturation,
  sharpness,
  blur,
  grayscale,
  sepia,
  hueRotate,
  onClose,
  onReset,
  onCompareStart,
  onCompareStop,
  onCompareKeyChange,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onSharpnessChange,
  onBlurChange,
  onGrayscaleChange,
  onSepiaChange,
  onHueRotateChange,
}: FloatingImageToolPanelProps) {
  const { direction, t } = useLanguage();
  const [placeholderMessage, setPlaceholderMessage] = useState("");
  const [shadowRemovalStrength, setShadowRemovalStrength] = useState(45);
  const [shadowDetectionSensitivity, setShadowDetectionSensitivity] = useState(55);
  const [shadowEdgeSoftness, setShadowEdgeSoftness] = useState(45);
  const [shadowDetailProtection, setShadowDetailProtection] = useState(80);

  const applyShadowPreset = (preset: "light" | "medium" | "strong") => {
    const values = preset === "light"
      ? [25, 35, 30, 90]
      : preset === "medium"
        ? [55, 55, 50, 80]
        : [85, 75, 68, 70];
    setShadowRemovalStrength(values[0]);
    setShadowDetectionSensitivity(values[1]);
    setShadowEdgeSoftness(values[2]);
    setShadowDetailProtection(values[3]);
    setPlaceholderMessage(t("studio.imageTools.placeholderMessage"));
  };

  const resetAll = () => {
    onReset();
    setShadowRemovalStrength(45);
    setShadowDetectionSensitivity(55);
    setShadowEdgeSoftness(45);
    setShadowDetailProtection(80);
    setPlaceholderMessage("");
  };

  const placeholderActions = [
    { key: "removeShadow", icon: <Eraser size={18} aria-hidden="true" /> },
    { key: "reduceShadows", icon: <Layers size={18} aria-hidden="true" /> },
    { key: "removeBackground", icon: <ImageOff size={18} aria-hidden="true" /> },
    { key: "transparentBackground", icon: <Droplets size={18} aria-hidden="true" /> },
    { key: "whiteBackground", icon: <Sparkles size={18} aria-hidden="true" /> },
    { key: "blurBackground", icon: <WandSparkles size={18} aria-hidden="true" /> },
    { key: "smoothEdges", icon: <Sparkles size={18} aria-hidden="true" /> },
    { key: "protectProductDetails", icon: <Shield size={18} aria-hidden="true" /> },
    { key: "reduceReflection", icon: <Droplets size={18} aria-hidden="true" /> },
    { key: "removeNoise", icon: <Sparkles size={18} aria-hidden="true" /> },
    { key: "increaseSharpness", icon: <WandSparkles size={18} aria-hidden="true" /> },
    { key: "correctLighting", icon: <Sun size={18} aria-hidden="true" /> },
    { key: "correctWhiteBalance", icon: <Sun size={18} aria-hidden="true" /> },
  ] as const;

  const panelTitle = mode === "filters" ? t("studio.image.filtersTitle") : t("studio.image.actionsTitle");

  if (!isOpen) return null;

  return (
    <FloatingStudioPanel
      panelId="echo-image-settings-panel"
      title={panelTitle}
      icon={<SlidersHorizontal size={17} aria-hidden="true" />}
      boundaryRef={boundaryRef}
      initialAnchorRef={initialAnchorRef}
      storageKey="dekokraft.studio.imageSettingsPanel.v3"
      initialSize={{ width: 300, height: 560 }}
      initialSide="left"
      minWidth={250}
      minHeight={260}
      maxWidthRatio={0.55}
      maxHeightRatio={0.85}
      closeButtonRef={closeButtonRef}
      onClose={onClose}
      className="floatingImageToolPanel"
    >
      <div className="floatingImageToolPanel__body" dir={direction}>
        {mode === "filters" ? (
          <div className="floatingImageToolPanel__filterContent">
            <section className="echoImageFilterGroup" aria-labelledby="floating-filter-lighting-title">
              <h4 id="floating-filter-lighting-title">{t("studio.image.groupLighting")}</h4>
              <ImageFilterControl id="floating-echo-brightness" label={t("studio.image.brightness")} value={brightness} min={0} max={200} onChange={onBrightnessChange} />
              <ImageFilterControl id="floating-echo-contrast" label={t("studio.image.contrast")} value={contrast} min={0} max={200} onChange={onContrastChange} />
            </section>
            <section className="echoImageFilterGroup" aria-labelledby="floating-filter-colors-title">
              <h4 id="floating-filter-colors-title">{t("studio.image.groupColors")}</h4>
              <ImageFilterControl id="floating-echo-saturation" label={t("studio.image.saturation")} value={saturation} min={0} max={200} onChange={onSaturationChange} />
              <ImageFilterControl id="floating-echo-grayscale" label={t("studio.image.grayscale")} value={grayscale} min={0} max={100} onChange={onGrayscaleChange} />
              <ImageFilterControl id="floating-echo-sepia" label={t("studio.image.sepia")} value={sepia} min={0} max={100} onChange={onSepiaChange} />
              <ImageFilterControl id="floating-echo-hue" label={t("studio.image.hueRotate")} value={hueRotate} min={0} max={360} unit="°" onChange={onHueRotateChange} />
            </section>
            <section className="echoImageFilterGroup" aria-labelledby="floating-filter-details-title">
              <h4 id="floating-filter-details-title">{t("studio.image.groupDetails")}</h4>
              <ImageFilterControl id="floating-echo-sharpness" label={t("studio.image.sharpness")} value={sharpness} min={0} max={100} note={t("studio.image.sharpnessPlaceholder")} onChange={onSharpnessChange} />
            </section>
            <section className="echoImageFilterGroup" aria-labelledby="floating-filter-effects-title">
              <h4 id="floating-filter-effects-title">التأثيرات</h4>
              <ImageFilterControl id="floating-echo-blur" label={t("studio.image.blur")} value={blur} min={0} max={20} unit="px" onChange={onBlurChange} />
            </section>
          </div>
        ) : (
          <div className="floatingImageToolPanel__actionsContent">
            <section className="floatingImageToolPanel__shadowSection" aria-labelledby="floating-shadow-removal-title">
              <header>
                <h4 id="floating-shadow-removal-title">{t("studio.imageTools.shadowRemoval")}</h4>
                <span>{t("studio.imageTools.experimental")}</span>
              </header>
              <div className="floatingImageToolPanel__presets">
                <button type="button" onClick={() => applyShadowPreset("light")}>{t("studio.imageTools.presetLight")}</button>
                <button type="button" onClick={() => applyShadowPreset("medium")}>{t("studio.imageTools.presetMedium")}</button>
                <button type="button" onClick={() => applyShadowPreset("strong")}>{t("studio.imageTools.presetStrong")}</button>
              </div>
              <ImageFilterControl id="shadow-removal-strength" label={t("studio.imageTools.shadowRemovalStrength")} value={shadowRemovalStrength} min={0} max={100} onChange={setShadowRemovalStrength} />
              <ImageFilterControl id="shadow-detection-sensitivity" label={t("studio.imageTools.shadowDetectionSensitivity")} value={shadowDetectionSensitivity} min={0} max={100} onChange={setShadowDetectionSensitivity} />
              <ImageFilterControl id="shadow-edge-softness" label={t("studio.imageTools.shadowEdgeSoftness")} value={shadowEdgeSoftness} min={0} max={100} onChange={setShadowEdgeSoftness} />
              <ImageFilterControl id="shadow-detail-protection" label={t("studio.imageTools.shadowDetailProtection")} value={shadowDetailProtection} min={0} max={100} onChange={setShadowDetailProtection} />
            </section>

            <div className="floatingImageToolPanel__actionGrid">
              {placeholderActions.map((action) => (
                <button key={action.key} type="button" disabled={!hasImage} onClick={() => setPlaceholderMessage(t("studio.imageTools.placeholderMessage"))}>
                  {action.icon}<span>{t(`studio.imageTools.${action.key}`)}</span><small>{t("studio.imageTools.experimental")}</small>
                </button>
              ))}
              <button
                type="button"
                disabled={!hasImage}
                aria-pressed={isComparing}
                onPointerDown={onCompareStart}
                onPointerUp={onCompareStop}
                onPointerCancel={onCompareStop}
                onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(true); }}
                onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") onCompareKeyChange(false); }}
                onBlur={() => onCompareKeyChange(false)}
              >
                <ScanEye size={18} aria-hidden="true" /><span>{t("studio.image.compare")}</span>
              </button>
              <button type="button" onClick={resetAll}>
                <RotateCcw size={18} aria-hidden="true" /><span>{t("studio.image.reset")}</span>
              </button>
            </div>
            {placeholderMessage && <p className="floatingImageToolPanel__notice" role="status">{placeholderMessage}</p>}
          </div>
        )}
      </div>
    </FloatingStudioPanel>
  );
}

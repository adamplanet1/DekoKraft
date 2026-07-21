"use client";

import {
  Droplets,
  Eraser,
  GripVertical,
  ImageOff,
  Layers,
  Maximize2,
  Minus,
  Move,
  RotateCcw,
  ScanEye,
  Shield,
  Sparkles,
  Sun,
  WandSparkles,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
import { useLanguage } from "../../components/LanguageProvider";
import ImageFilterControl from "./ImageFilterControl";

export type FloatingImagePanelMode = "filters" | "actions";

type FloatingImageToolPanelProps = {
  isOpen: boolean;
  mode: FloatingImagePanelMode;
  studioWindowRef: RefObject<HTMLDivElement | null>;
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

const DEFAULT_POSITION = { x: 24, y: 80 };

export default function FloatingImageToolPanel({
  isOpen,
  mode,
  studioWindowRef,
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
  const panelRef = useRef<HTMLElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState(DEFAULT_POSITION);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [placeholderMessage, setPlaceholderMessage] = useState("");
  const [shadowRemovalStrength, setShadowRemovalStrength] = useState(45);
  const [shadowDetectionSensitivity, setShadowDetectionSensitivity] = useState(55);
  const [shadowEdgeSoftness, setShadowEdgeSoftness] = useState(45);
  const [shadowDetailProtection, setShadowDetailProtection] = useState(80);

  const clampPosition = useCallback((x: number, y: number) => {
    const boundary = studioWindowRef.current;
    const panel = panelRef.current;
    if (!boundary || !panel) return { x, y };
    const boundaryRect = boundary.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const maxX = Math.max(0, boundaryRect.width - panelRect.width);
    const maxY = Math.max(0, boundaryRect.height - panelRect.height);
    return {
      x: Math.min(Math.max(0, x), maxX),
      y: Math.min(Math.max(0, y), maxY),
    };
  }, [studioWindowRef]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => {
      setPanelPosition((current) => clampPosition(current.x, current.y));
    });
    const keepInsideBounds = () => setPanelPosition((current) => clampPosition(current.x, current.y));
    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(keepInsideBounds);
    if (studioWindowRef.current) resizeObserver?.observe(studioWindowRef.current);
    if (panelRef.current) resizeObserver?.observe(panelRef.current);
    window.addEventListener("resize", keepInsideBounds);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", keepInsideBounds);
    };
  }, [clampPosition, isMinimized, isOpen, mode, studioWindowRef]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(max-width: 720px)").matches || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    const panel = panelRef.current;
    if (!panel) return;
    const panelRect = panel.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - panelRect.left,
      y: event.clientY - panelRect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingPanel(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingPanel) return;
    const boundary = studioWindowRef.current;
    if (!boundary) return;
    const boundaryRect = boundary.getBoundingClientRect();
    const nextX = event.clientX - boundaryRect.left - dragOffsetRef.current.x;
    const nextY = event.clientY - boundaryRect.top - dragOffsetRef.current.y;
    setPanelPosition(clampPosition(nextX, nextY));
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDraggingPanel(false);
  };

  const resetPanelPosition = () => setPanelPosition(clampPosition(DEFAULT_POSITION.x, DEFAULT_POSITION.y));

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

  return (
    <aside
      ref={panelRef}
      className={`floatingImageToolPanel${isOpen ? " floatingImageToolPanel--open" : ""}${isMinimized ? " floatingImageToolPanel--minimized" : ""}${isDraggingPanel ? " floatingImageToolPanel--dragging" : ""}`}
      style={{ transform: `translate3d(${panelPosition.x}px, ${panelPosition.y}px, 0)` }}
      aria-label={panelTitle}
      aria-hidden={!isOpen}
      dir={direction}
    >
      <div
        className="floatingImageToolPanel__dragBar"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <GripVertical size={20} aria-label={t("studio.imageTools.dragPanel")} />
        <strong>{panelTitle}</strong>
        <div className="floatingImageToolPanel__headerActions">
          <button type="button" aria-label={t("studio.imageTools.resetPanelPosition")} title={t("studio.imageTools.resetPanelPosition")} onClick={resetPanelPosition}>
            <Move size={17} aria-hidden="true" />
          </button>
          <button type="button" aria-label={isMinimized ? t("studio.imageTools.expandPanel") : t("studio.imageTools.minimizePanel")} aria-pressed={isMinimized} onClick={() => setIsMinimized((current) => !current)}>
            {isMinimized ? <Maximize2 size={17} aria-hidden="true" /> : <Minus size={17} aria-hidden="true" />}
          </button>
          <button ref={closeButtonRef} type="button" aria-label={mode === "filters" ? t("studio.image.closeFilters") : t("studio.image.closeActions")} tabIndex={isOpen ? 0 : -1} onClick={onClose}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="floatingImageToolPanel__body">
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

        <button type="button" className="floatingImageToolPanel__resetPosition" onClick={resetPanelPosition}>
          <Move size={17} aria-hidden="true" />{t("studio.imageTools.resetPanelPosition")}
        </button>
      </div>
    </aside>
  );
}

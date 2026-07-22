"use client";

import { ArrowRight, Box, ChevronDown, Crosshair, ImagePlus, Maximize2, Minimize2, Palette, Scissors, Sparkles, Video, WandSparkles, X } from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ChangeEvent,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLanguage } from "../../components/LanguageProvider";
import ImageToolsMenu, { type ImageExportFormat } from "./ImageToolsMenu";
import FloatingImageToolPanel from "./FloatingImageToolPanel";
import VideoActionsPanel from "./VideoActionsPanel";
import VideoFiltersPanel from "./VideoFiltersPanel";
import VideoProcessingWorkspace from "./VideoProcessingWorkspace";
import VideoToolsMenu, { type VideoExportFormat } from "./VideoToolsMenu";
import ThreeDImageActionsPanel from "./ThreeDImageActionsPanel";
import ThreeDImageFiltersPanel from "./ThreeDImageFiltersPanel";
import ThreeDProcessingWorkspace from "./ThreeDProcessingWorkspace";
import ThreeDImageToolsMenu, { type ThreeDImageExportFormat } from "./ThreeDImageToolsMenu";
import LaserActionsPanel from "./LaserActionsPanel";
import LaserFiltersPanel from "./LaserFiltersPanel";
import LaserToolsMenu, { type LaserExportFormat } from "./LaserToolsMenu";
import EmbroideryActionsPanel from "./EmbroideryActionsPanel";
import EmbroideryFiltersPanel from "./EmbroideryFiltersPanel";
import EmbroideryToolsMenu, { type EmbroideryExportFormat } from "./EmbroideryToolsMenu";
import SmartEditActionsPanel from "./SmartEditActionsPanel";
import SmartEditFiltersPanel from "./SmartEditFiltersPanel";
import type { SmartEditExportFormat } from "./SmartEditToolsMenu";
import SmartEditEngine from "./SmartEditEngine";
import FloatingStudioPanel from "./FloatingStudioPanel";
import type { PlatformProductSelection, ProductSelectionMode } from "./ProductMemoryPicker";
import { analyzeProductImage } from "../../admin/lib/dekobrain/productAnalyzer";
import { completeUploadedImageAnalysis, createPlatformProductMemory, createUploadedProductMemory, failUploadedImageAnalysis, loadProductMemoryByProductId, type ProductMemory } from "./ProductMemoryStore";
import type { ProductDNA } from "../../../lib/echo/echoProductDNA";
import { useWorkspace } from "../engine/WorkspaceContext";
import type { SmartEditLaunchContext } from "../engine/workspaceTypes";
import { verifyStudioLayoutGeometry } from "../lib/verifyStudioLayout";

type EchoImageStudioProps = {
  launchContext?: SmartEditLaunchContext | null;
  isMaximized: boolean;
  onBack: () => void;
  onMaximize: () => void;
  onRestore: () => void;
  onCloseStudio: () => void;
};

type ActiveImageSource = {
  kind: "uploaded-file" | "platform-product" | "product-memory";
  productId?: string;
  file?: File;
  previewUrl: string;
  originalUrl?: string;
};

const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
};

export default function EchoImageStudio({
  launchContext,
  isMaximized,
  onBack,
  onMaximize,
  onRestore,
  onCloseStudio,
}: EchoImageStudioProps) {
  const { direction, t } = useLanguage();
  const { activeWorkspace, activeTool, selectWorkspace, selectTool, openSmartEdit } = useWorkspace();
  const [activeImageSource, setActiveImageSource] = useState<ActiveImageSource | null>(null);
  const previewUrl = activeImageSource?.previewUrl ?? null;
  const originalPreviewUrl = activeImageSource?.originalUrl ?? activeImageSource?.previewUrl ?? null;
  const originalUploadedImage = activeImageSource?.kind === "uploaded-file" ? activeImageSource.file ?? null : null;
  const currentPreviewImage = previewUrl;
  const [generatedResultImage, setGeneratedResultImage] = useState<string | null>(null);
  const [productMemoryImage, setProductMemoryImage] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [activeProductMemory, setActiveProductMemory] = useState<ProductMemory | null>(null);
  const [brightness, setBrightness] = useState(DEFAULT_FILTERS.brightness);
  const [contrast, setContrast] = useState(DEFAULT_FILTERS.contrast);
  const [saturation, setSaturation] = useState(DEFAULT_FILTERS.saturation);
  const [sharpness, setSharpness] = useState(DEFAULT_FILTERS.sharpness);
  const [blur, setBlur] = useState(DEFAULT_FILTERS.blur);
  const [grayscale, setGrayscale] = useState(DEFAULT_FILTERS.grayscale);
  const [sepia, setSepia] = useState(DEFAULT_FILTERS.sepia);
  const [hueRotate, setHueRotate] = useState(DEFAULT_FILTERS.hueRotate);
  const [isComparing, setIsComparing] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ImageExportFormat | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  const [isImageToolsOpen, setIsImageToolsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [videoBrightness, setVideoBrightness] = useState(DEFAULT_FILTERS.brightness);
  const [videoContrast, setVideoContrast] = useState(DEFAULT_FILTERS.contrast);
  const [videoSaturation, setVideoSaturation] = useState(DEFAULT_FILTERS.saturation);
  const [videoSharpness, setVideoSharpness] = useState(DEFAULT_FILTERS.sharpness);
  const [videoBlur, setVideoBlur] = useState(DEFAULT_FILTERS.blur);
  const [videoGrayscale, setVideoGrayscale] = useState(DEFAULT_FILTERS.grayscale);
  const [videoSepia, setVideoSepia] = useState(DEFAULT_FILTERS.sepia);
  const [videoHueRotate, setVideoHueRotate] = useState(DEFAULT_FILTERS.hueRotate);
  const [isVideoComparing, setIsVideoComparing] = useState(false);
  const [videoExportingFormat, setVideoExportingFormat] = useState<VideoExportFormat | null>(null);
  const [videoExportMessage, setVideoExportMessage] = useState("");
  const [isVideoToolsOpen, setIsVideoToolsOpen] = useState(false);
  const [isVideoFiltersOpen, setIsVideoFiltersOpen] = useState(false);
  const [isVideoActionsOpen, setIsVideoActionsOpen] = useState(false);
  const [threeDImagePreviewUrl, setThreeDImagePreviewUrl] = useState<string | null>(null);
  const [threeDImageBrightness, setThreeDImageBrightness] = useState(DEFAULT_FILTERS.brightness);
  const [threeDImageContrast, setThreeDImageContrast] = useState(DEFAULT_FILTERS.contrast);
  const [threeDImageSaturation, setThreeDImageSaturation] = useState(DEFAULT_FILTERS.saturation);
  const [threeDImageSharpness, setThreeDImageSharpness] = useState(DEFAULT_FILTERS.sharpness);
  const [threeDImageBlur, setThreeDImageBlur] = useState(DEFAULT_FILTERS.blur);
  const [threeDImageGrayscale, setThreeDImageGrayscale] = useState(DEFAULT_FILTERS.grayscale);
  const [threeDImageSepia, setThreeDImageSepia] = useState(DEFAULT_FILTERS.sepia);
  const [threeDImageHueRotate, setThreeDImageHueRotate] = useState(DEFAULT_FILTERS.hueRotate);
  const [isThreeDImageComparing, setIsThreeDImageComparing] = useState(false);
  const [threeDImageExportingFormat, setThreeDImageExportingFormat] = useState<ThreeDImageExportFormat | null>(null);
  const [threeDImageExportMessage, setThreeDImageExportMessage] = useState("");
  const [isThreeDImageToolsOpen, setIsThreeDImageToolsOpen] = useState(false);
  const [isThreeDImageFiltersOpen, setIsThreeDImageFiltersOpen] = useState(false);
  const [isThreeDImageActionsOpen, setIsThreeDImageActionsOpen] = useState(false);
  const [laserPreviewUrl, setLaserPreviewUrl] = useState<string | null>(null);
  const [laserBrightness, setLaserBrightness] = useState(DEFAULT_FILTERS.brightness);
  const [laserContrast, setLaserContrast] = useState(DEFAULT_FILTERS.contrast);
  const [laserSaturation, setLaserSaturation] = useState(DEFAULT_FILTERS.saturation);
  const [laserSharpness, setLaserSharpness] = useState(DEFAULT_FILTERS.sharpness);
  const [laserBlur, setLaserBlur] = useState(DEFAULT_FILTERS.blur);
  const [laserGrayscale, setLaserGrayscale] = useState(DEFAULT_FILTERS.grayscale);
  const [laserSepia, setLaserSepia] = useState(DEFAULT_FILTERS.sepia);
  const [laserHueRotate, setLaserHueRotate] = useState(DEFAULT_FILTERS.hueRotate);
  const [isLaserComparing, setIsLaserComparing] = useState(false);
  const [laserExportingFormat, setLaserExportingFormat] = useState<LaserExportFormat | null>(null);
  const [laserExportMessage, setLaserExportMessage] = useState("");
  const [isLaserToolsOpen, setIsLaserToolsOpen] = useState(false);
  const [isLaserFiltersOpen, setIsLaserFiltersOpen] = useState(false);
  const [isLaserActionsOpen, setIsLaserActionsOpen] = useState(false);
  const [embroideryPreviewUrl, setEmbroideryPreviewUrl] = useState<string | null>(null);
  const [embroideryBrightness, setEmbroideryBrightness] = useState(DEFAULT_FILTERS.brightness);
  const [embroideryContrast, setEmbroideryContrast] = useState(DEFAULT_FILTERS.contrast);
  const [embroiderySaturation, setEmbroiderySaturation] = useState(DEFAULT_FILTERS.saturation);
  const [embroiderySharpness, setEmbroiderySharpness] = useState(DEFAULT_FILTERS.sharpness);
  const [embroideryBlur, setEmbroideryBlur] = useState(DEFAULT_FILTERS.blur);
  const [embroideryGrayscale, setEmbroideryGrayscale] = useState(DEFAULT_FILTERS.grayscale);
  const [embroiderySepia, setEmbroiderySepia] = useState(DEFAULT_FILTERS.sepia);
  const [embroideryHueRotate, setEmbroideryHueRotate] = useState(DEFAULT_FILTERS.hueRotate);
  const [isEmbroideryComparing, setIsEmbroideryComparing] = useState(false);
  const [embroideryExportingFormat, setEmbroideryExportingFormat] = useState<EmbroideryExportFormat | null>(null);
  const [embroideryExportMessage, setEmbroideryExportMessage] = useState("");
  const [isEmbroideryToolsOpen, setIsEmbroideryToolsOpen] = useState(false);
  const [isEmbroideryFiltersOpen, setIsEmbroideryFiltersOpen] = useState(false);
  const [isEmbroideryActionsOpen, setIsEmbroideryActionsOpen] = useState(false);
  const [smartEditPreviewUrl, setSmartEditPreviewUrl] = useState<string | null>(null);
  const [smartEditBrightness, setSmartEditBrightness] = useState(DEFAULT_FILTERS.brightness);
  const [smartEditContrast, setSmartEditContrast] = useState(DEFAULT_FILTERS.contrast);
  const [smartEditSaturation, setSmartEditSaturation] = useState(DEFAULT_FILTERS.saturation);
  const [smartEditSharpness, setSmartEditSharpness] = useState(DEFAULT_FILTERS.sharpness);
  const [smartEditBlur, setSmartEditBlur] = useState(DEFAULT_FILTERS.blur);
  const [smartEditGrayscale, setSmartEditGrayscale] = useState(DEFAULT_FILTERS.grayscale);
  const [smartEditSepia, setSmartEditSepia] = useState(DEFAULT_FILTERS.sepia);
  const [smartEditHueRotate, setSmartEditHueRotate] = useState(DEFAULT_FILTERS.hueRotate);
  const [isSmartEditComparing, setIsSmartEditComparing] = useState(false);
  const [smartEditExportingFormat, setSmartEditExportingFormat] = useState<SmartEditExportFormat | null>(null);
  const [smartEditExportMessage, setSmartEditExportMessage] = useState("");
  const [isSmartEditFiltersOpen, setIsSmartEditFiltersOpen] = useState(false);
  const [isSmartEditActionsOpen, setIsSmartEditActionsOpen] = useState(false);
  const launchProductLoadedRef = useRef<string | null>(null);
  const activeProcessingMode: "image" | "video" | "threeDImage" | "laser" | "cnc" | "embroidery" | "smartEdit" = activeWorkspace === "video"
    ? "video"
    : activeWorkspace === "3d"
      ? "threeDImage"
      : activeWorkspace === "laser"
        ? "laser"
        : activeWorkspace === "cnc"
          ? "cnc"
        : activeWorkspace === "embroidery"
          ? "embroidery"
          : "image";
  const isSmartEditOpen = activeTool === "smart-edit";

  useEffect(() => {
    const librarySelection = sessionStorage.getItem("dekokraft.studio.librarySelection");
    if (!librarySelection) return;
    sessionStorage.removeItem("dekokraft.studio.librarySelection");
    setActiveImageSource({ kind: "platform-product", previewUrl: librarySelection, originalUrl: librarySelection });
    setVideoPreviewUrl(librarySelection);
    setThreeDImagePreviewUrl(librarySelection);
    setLaserPreviewUrl(librarySelection);
    setEmbroideryPreviewUrl(librarySelection);
    setSmartEditPreviewUrl(librarySelection);
    setFileName("صورة من مكتبة الموقع");
  }, []);

  useEffect(() => {
    if (!launchContext?.productId || activeImageSource || launchProductLoadedRef.current === launchContext.productId) return;
    launchProductLoadedRef.current = launchContext.productId;
    const memory = loadProductMemoryByProductId(launchContext.productId);
    if (!memory) return;
    setActiveProductMemory(memory);
    const memoryUrl = memory.originalImage?.persistentUrl ?? memory.originalImage?.previewUrl ?? null;
    setProductMemoryImage(memoryUrl);
    if (memoryUrl) {
      setActiveImageSource({
        kind: "product-memory",
        productId: launchContext.productId,
        previewUrl: memoryUrl,
        originalUrl: memoryUrl,
      });
      setFileName(memory.originalImage?.name ?? memory.sourceImageName ?? launchContext.productId);
    }
  }, [activeImageSource, launchContext?.productId]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageToolsRef = useRef<HTMLDivElement>(null);
  const imageToolsToggleRef = useRef<HTMLButtonElement>(null);
  const filtersCloseRef = useRef<HTMLButtonElement>(null);
  const actionsCloseRef = useRef<HTMLButtonElement>(null);
  const videoToolsRef = useRef<HTMLDivElement>(null);
  const videoToolsToggleRef = useRef<HTMLButtonElement>(null);
  const videoFiltersCloseRef = useRef<HTMLButtonElement>(null);
  const videoActionsCloseRef = useRef<HTMLButtonElement>(null);
  const threeDImageToolsRef = useRef<HTMLDivElement>(null);
  const threeDImageToolsToggleRef = useRef<HTMLButtonElement>(null);
  const threeDImageFiltersCloseRef = useRef<HTMLButtonElement>(null);
  const threeDImageActionsCloseRef = useRef<HTMLButtonElement>(null);
  const laserToolsRef = useRef<HTMLDivElement>(null);
  const laserToolsToggleRef = useRef<HTMLButtonElement>(null);
  const laserFiltersCloseRef = useRef<HTMLButtonElement>(null);
  const laserActionsCloseRef = useRef<HTMLButtonElement>(null);
  const embroideryToolsRef = useRef<HTMLDivElement>(null);
  const embroideryToolsToggleRef = useRef<HTMLButtonElement>(null);
  const embroideryFiltersCloseRef = useRef<HTMLButtonElement>(null);
  const embroideryActionsCloseRef = useRef<HTMLButtonElement>(null);
  const smartEditToolsToggleRef = useRef<HTMLButtonElement>(null);
  const smartEditFiltersCloseRef = useRef<HTMLButtonElement>(null);
  const smartEditActionsCloseRef = useRef<HTMLButtonElement>(null);
  const studioWindowRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    const studio = studioWindowRef.current;
    const toolbar = toolbarRef.current;
    const canvas = canvasRef.current;
    if (!studio || !toolbar || !canvas) return;
    let frame = 0;
    const verify = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const issues = verifyStudioLayoutGeometry({
          viewport: { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth, height: window.innerHeight },
          studio: studio.getBoundingClientRect(),
          toolbar: toolbar.getBoundingClientRect(),
          canvas: canvas.getBoundingClientRect(),
          panels: Array.from(studio.querySelectorAll<HTMLElement>(".floatingStudioPanel")).map((panel) => panel.getBoundingClientRect()),
        });
        studio.dataset.layoutVerification = issues.length === 0 ? "passed" : "failed";
        studio.dataset.layoutIssues = issues.join(",");
      });
    };
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(verify);
    observer?.observe(studio);
    observer?.observe(toolbar);
    observer?.observe(canvas);
    window.addEventListener("resize", verify);
    verify();
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", verify);
    };
  }, [isActionsOpen, isFiltersOpen, isMaximized, isSmartEditOpen]);

  useEffect(() => () => {
    if (previewUrl?.startsWith("blob:") && previewUrl !== originalPreviewUrl) URL.revokeObjectURL(previewUrl);
  }, [originalPreviewUrl, previewUrl]);

  useEffect(() => () => {
    if (originalPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(originalPreviewUrl);
  }, [originalPreviewUrl]);

  useEffect(() => () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
  }, [videoPreviewUrl]);

  useEffect(() => () => {
    if (threeDImagePreviewUrl) URL.revokeObjectURL(threeDImagePreviewUrl);
  }, [threeDImagePreviewUrl]);

  useEffect(() => () => {
    if (laserPreviewUrl) URL.revokeObjectURL(laserPreviewUrl);
  }, [laserPreviewUrl]);

  useEffect(() => () => {
    if (embroideryPreviewUrl) URL.revokeObjectURL(embroideryPreviewUrl);
  }, [embroideryPreviewUrl]);

  useEffect(() => () => {
    if (smartEditPreviewUrl) URL.revokeObjectURL(smartEditPreviewUrl);
  }, [smartEditPreviewUrl]);

  useEffect(() => {
    if (!exportMessage) return;
    const timeout = window.setTimeout(() => setExportMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [exportMessage]);

  useEffect(() => {
    if (!videoExportMessage) return;
    const timeout = window.setTimeout(() => setVideoExportMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [videoExportMessage]);

  useEffect(() => {
    if (!threeDImageExportMessage) return;
    const timeout = window.setTimeout(() => setThreeDImageExportMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [threeDImageExportMessage]);

  useEffect(() => {
    if (!laserExportMessage) return;
    const timeout = window.setTimeout(() => setLaserExportMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [laserExportMessage]);

  useEffect(() => {
    if (!embroideryExportMessage) return;
    const timeout = window.setTimeout(() => setEmbroideryExportMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [embroideryExportMessage]);

  useEffect(() => {
    if (!smartEditExportMessage) return;
    const timeout = window.setTimeout(() => setSmartEditExportMessage(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [smartEditExportMessage]);

  const closeFilters = useCallback(() => {
    setIsFiltersOpen(false);
    window.requestAnimationFrame(() => imageToolsToggleRef.current?.focus());
  }, []);

  const closeActions = useCallback(() => {
    setIsActionsOpen(false);
    window.requestAnimationFrame(() => imageToolsToggleRef.current?.focus());
  }, []);

  const openFilters = useCallback(() => {
    selectWorkspace("image");
    setIsFiltersOpen(true);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsImageToolsOpen(false);
  }, [selectWorkspace]);

  const openActions = useCallback(() => {
    selectWorkspace("image");
    setIsActionsOpen(true);
    setIsFiltersOpen(false);
    setIsImageToolsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
  }, [selectWorkspace]);

  const toggleImageTools = useCallback(() => {
    selectWorkspace("image");
    setIsImageToolsOpen((current) => !current);
    setIsVideoToolsOpen(false);
    setIsThreeDImageToolsOpen(false);
    setIsLaserToolsOpen(false);
    setIsEmbroideryToolsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsSmartEditFiltersOpen(false);
    setIsSmartEditActionsOpen(false);
  }, [selectWorkspace]);

  const closeVideoFilters = useCallback(() => {
    setIsVideoFiltersOpen(false);
    window.requestAnimationFrame(() => videoToolsToggleRef.current?.focus());
  }, []);

  const closeVideoActions = useCallback(() => {
    setIsVideoActionsOpen(false);
    window.requestAnimationFrame(() => videoToolsToggleRef.current?.focus());
  }, []);

  const openVideoFilters = useCallback(() => {
    selectWorkspace("video");
    setIsVideoFiltersOpen(true);
    setIsVideoActionsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsVideoToolsOpen(false);
  }, [selectWorkspace]);

  const openVideoActions = useCallback(() => {
    selectWorkspace("video");
    setIsVideoActionsOpen(true);
    setIsVideoFiltersOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsVideoToolsOpen(false);
  }, [selectWorkspace]);

  const toggleVideoTools = useCallback(() => {
    selectWorkspace("video");
    setIsVideoToolsOpen((current) => !current);
    setIsImageToolsOpen(false);
    setIsThreeDImageToolsOpen(false);
    setIsLaserToolsOpen(false);
    setIsEmbroideryToolsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsSmartEditFiltersOpen(false);
    setIsSmartEditActionsOpen(false);
  }, [selectWorkspace]);

  const closeThreeDImageFilters = useCallback(() => {
    setIsThreeDImageFiltersOpen(false);
    window.requestAnimationFrame(() => threeDImageToolsToggleRef.current?.focus());
  }, []);

  const closeThreeDImageActions = useCallback(() => {
    setIsThreeDImageActionsOpen(false);
    window.requestAnimationFrame(() => threeDImageToolsToggleRef.current?.focus());
  }, []);

  const openThreeDImageFilters = useCallback(() => {
    selectWorkspace("3d");
    setIsThreeDImageFiltersOpen(true);
    setIsThreeDImageActionsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsThreeDImageToolsOpen(false);
  }, [selectWorkspace]);

  const openThreeDImageActions = useCallback(() => {
    selectWorkspace("3d");
    setIsThreeDImageActionsOpen(true);
    setIsThreeDImageFiltersOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsThreeDImageToolsOpen(false);
    setIsEmbroideryToolsOpen(false);
  }, [selectWorkspace]);

  const toggleThreeDImageTools = useCallback(() => {
    selectWorkspace("3d");
    setIsThreeDImageToolsOpen(false);
    setIsImageToolsOpen(false);
    setIsVideoToolsOpen(false);
    setIsLaserToolsOpen(false);
    setIsEmbroideryToolsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsSmartEditFiltersOpen(false);
    setIsSmartEditActionsOpen(false);
  }, [selectWorkspace]);

  const closeEmbroideryFilters = useCallback(() => {
    setIsEmbroideryFiltersOpen(false);
    window.requestAnimationFrame(() => embroideryToolsToggleRef.current?.focus());
  }, []);

  const closeEmbroideryActions = useCallback(() => {
    setIsEmbroideryActionsOpen(false);
    window.requestAnimationFrame(() => embroideryToolsToggleRef.current?.focus());
  }, []);

  const openEmbroideryFilters = useCallback(() => {
    selectWorkspace("embroidery");
    setIsEmbroideryFiltersOpen(true);
    setIsEmbroideryActionsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryToolsOpen(false);
  }, [selectWorkspace]);

  const openEmbroideryActions = useCallback(() => {
    selectWorkspace("embroidery");
    setIsEmbroideryActionsOpen(true);
    setIsEmbroideryFiltersOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryToolsOpen(false);
  }, [selectWorkspace]);

  const toggleEmbroideryTools = useCallback(() => {
    selectWorkspace("embroidery");
    setIsEmbroideryToolsOpen((current) => !current);
    setIsImageToolsOpen(false);
    setIsVideoToolsOpen(false);
    setIsThreeDImageToolsOpen(false);
    setIsLaserToolsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsSmartEditFiltersOpen(false);
    setIsSmartEditActionsOpen(false);
  }, [selectWorkspace]);

  const closeSmartEditFilters = useCallback(() => {
    setIsSmartEditFiltersOpen(false);
    window.requestAnimationFrame(() => smartEditToolsToggleRef.current?.focus());
  }, []);

  const closeSmartEditActions = useCallback(() => {
    setIsSmartEditActionsOpen(false);
    window.requestAnimationFrame(() => smartEditToolsToggleRef.current?.focus());
  }, []);

  const openSmartEditFilters = useCallback(() => {
    selectTool("filters");
    setIsSmartEditFiltersOpen(true);
    setIsSmartEditActionsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
  }, [selectTool]);

  const openSmartEditActions = useCallback(() => {
    selectTool("actions");
    setIsSmartEditActionsOpen(true);
    setIsSmartEditFiltersOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
  }, [selectTool]);

  const toggleSmartEditTools = useCallback(() => {
    if (isSmartEditOpen) selectTool(null);
    else openSmartEdit();
    setIsImageToolsOpen(false);
    setIsVideoToolsOpen(false);
    setIsThreeDImageToolsOpen(false);
    setIsLaserToolsOpen(false);
    setIsEmbroideryToolsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsSmartEditFiltersOpen(false);
    setIsSmartEditActionsOpen(false);
  }, [isSmartEditOpen, openSmartEdit, selectTool]);

  const closeLaserFilters = useCallback(() => {
    setIsLaserFiltersOpen(false);
    window.requestAnimationFrame(() => laserToolsToggleRef.current?.focus());
  }, []);

  const closeLaserActions = useCallback(() => {
    setIsLaserActionsOpen(false);
    window.requestAnimationFrame(() => laserToolsToggleRef.current?.focus());
  }, []);

  const openLaserFilters = useCallback(() => {
    selectWorkspace("laser");
    setIsLaserFiltersOpen(true);
    setIsLaserActionsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsLaserToolsOpen(false);
  }, [selectWorkspace]);

  const openLaserActions = useCallback(() => {
    selectWorkspace("laser");
    setIsLaserActionsOpen(true);
    setIsLaserFiltersOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsLaserToolsOpen(false);
  }, [selectWorkspace]);

  const openCncFilters = useCallback(() => {
    selectWorkspace("cnc");
    setIsLaserFiltersOpen(true);
    setIsLaserActionsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsLaserToolsOpen(false);
  }, [selectWorkspace]);

  const toggleLaserTools = useCallback(() => {
    selectWorkspace("laser");
    setIsLaserToolsOpen((current) => !current);
    setIsImageToolsOpen(false);
    setIsVideoToolsOpen(false);
    setIsThreeDImageToolsOpen(false);
    setIsEmbroideryToolsOpen(false);
    setIsFiltersOpen(false);
    setIsActionsOpen(false);
    setIsVideoFiltersOpen(false);
    setIsVideoActionsOpen(false);
    setIsThreeDImageFiltersOpen(false);
    setIsThreeDImageActionsOpen(false);
    setIsLaserFiltersOpen(false);
    setIsLaserActionsOpen(false);
    setIsEmbroideryFiltersOpen(false);
    setIsEmbroideryActionsOpen(false);
    setIsSmartEditFiltersOpen(false);
    setIsSmartEditActionsOpen(false);
  }, [selectWorkspace]);

  useEffect(() => {
    if (!isImageToolsOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !imageToolsRef.current?.contains(event.target)) {
        setIsImageToolsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isImageToolsOpen]);

  useEffect(() => {
    if (!isVideoToolsOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !videoToolsRef.current?.contains(event.target)) {
        setIsVideoToolsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isVideoToolsOpen]);

  useEffect(() => {
    if (!isThreeDImageToolsOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !threeDImageToolsRef.current?.contains(event.target)) {
        setIsThreeDImageToolsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isThreeDImageToolsOpen]);

  useEffect(() => {
    if (!isLaserToolsOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !laserToolsRef.current?.contains(event.target)) {
        setIsLaserToolsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isLaserToolsOpen]);

  useEffect(() => {
    if (!isEmbroideryToolsOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !embroideryToolsRef.current?.contains(event.target)) {
        setIsEmbroideryToolsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [isEmbroideryToolsOpen]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    const target = isFiltersOpen
      ? filtersCloseRef.current
      : isActionsOpen
        ? actionsCloseRef.current
        : isVideoFiltersOpen
          ? videoFiltersCloseRef.current
          : isVideoActionsOpen
            ? videoActionsCloseRef.current
            : isThreeDImageFiltersOpen
              ? threeDImageFiltersCloseRef.current
              : isThreeDImageActionsOpen
                ? threeDImageActionsCloseRef.current
                : isLaserFiltersOpen
                  ? laserFiltersCloseRef.current
                  : isLaserActionsOpen
                    ? laserActionsCloseRef.current
                    : isEmbroideryFiltersOpen
                      ? embroideryFiltersCloseRef.current
                      : isEmbroideryActionsOpen
                        ? embroideryActionsCloseRef.current
                        : isSmartEditFiltersOpen
                          ? smartEditFiltersCloseRef.current
                          : isSmartEditActionsOpen
                            ? smartEditActionsCloseRef.current
                        : null;
    if (!target) return;
    const focusFrame = window.requestAnimationFrame(() => target.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [isActionsOpen, isEmbroideryActionsOpen, isEmbroideryFiltersOpen, isFiltersOpen, isLaserActionsOpen, isLaserFiltersOpen, isSmartEditActionsOpen, isSmartEditFiltersOpen, isThreeDImageActionsOpen, isThreeDImageFiltersOpen, isVideoActionsOpen, isVideoFiltersOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || (!isImageToolsOpen && !isVideoToolsOpen && !isThreeDImageToolsOpen && !isLaserToolsOpen && !isEmbroideryToolsOpen && !isSmartEditOpen && !isFiltersOpen && !isActionsOpen && !isVideoFiltersOpen && !isVideoActionsOpen && !isThreeDImageFiltersOpen && !isThreeDImageActionsOpen && !isLaserFiltersOpen && !isLaserActionsOpen && !isEmbroideryFiltersOpen && !isEmbroideryActionsOpen && !isSmartEditFiltersOpen && !isSmartEditActionsOpen)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isImageToolsOpen) {
        setIsImageToolsOpen(false);
        window.requestAnimationFrame(() => imageToolsToggleRef.current?.focus());
      } else if (isVideoToolsOpen) {
        setIsVideoToolsOpen(false);
        window.requestAnimationFrame(() => videoToolsToggleRef.current?.focus());
      } else if (isThreeDImageToolsOpen) {
        setIsThreeDImageToolsOpen(false);
        window.requestAnimationFrame(() => threeDImageToolsToggleRef.current?.focus());
      } else if (isLaserToolsOpen) {
        setIsLaserToolsOpen(false);
        window.requestAnimationFrame(() => laserToolsToggleRef.current?.focus());
      } else if (isEmbroideryToolsOpen) {
        setIsEmbroideryToolsOpen(false);
        window.requestAnimationFrame(() => embroideryToolsToggleRef.current?.focus());
      } else if (isSmartEditOpen) {
        selectTool(null);
        window.requestAnimationFrame(() => smartEditToolsToggleRef.current?.focus());
      } else if (isActionsOpen) closeActions();
      else if (isVideoActionsOpen) closeVideoActions();
      else if (isThreeDImageActionsOpen) closeThreeDImageActions();
      else if (isLaserActionsOpen) closeLaserActions();
      else if (isEmbroideryActionsOpen) closeEmbroideryActions();
      else if (isSmartEditActionsOpen) closeSmartEditActions();
      else if (isVideoFiltersOpen) closeVideoFilters();
      else if (isThreeDImageFiltersOpen) closeThreeDImageFilters();
      else if (isLaserFiltersOpen) closeLaserFilters();
      else if (isEmbroideryFiltersOpen) closeEmbroideryFilters();
      else if (isSmartEditFiltersOpen) closeSmartEditFilters();
      else closeFilters();
    };

    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [closeActions, closeEmbroideryActions, closeEmbroideryFilters, closeFilters, closeLaserActions, closeLaserFilters, closeSmartEditActions, closeSmartEditFilters, closeThreeDImageActions, closeThreeDImageFilters, closeVideoActions, closeVideoFilters, isActionsOpen, isEmbroideryActionsOpen, isEmbroideryFiltersOpen, isEmbroideryToolsOpen, isFiltersOpen, isImageToolsOpen, isLaserActionsOpen, isLaserFiltersOpen, isLaserToolsOpen, isSmartEditActionsOpen, isSmartEditFiltersOpen, isSmartEditOpen, isThreeDImageActionsOpen, isThreeDImageFiltersOpen, isThreeDImageToolsOpen, isVideoActionsOpen, isVideoFiltersOpen, isVideoToolsOpen, selectTool]);

  const closeActivePanel = () => {
    if (isActionsOpen) closeActions();
    else if (isFiltersOpen) closeFilters();
    else if (isVideoActionsOpen) closeVideoActions();
    else if (isVideoFiltersOpen) closeVideoFilters();
    else if (isThreeDImageActionsOpen) closeThreeDImageActions();
    else if (isThreeDImageFiltersOpen) closeThreeDImageFilters();
    else if (isLaserActionsOpen) closeLaserActions();
    else if (isLaserFiltersOpen) closeLaserFilters();
    else if (isEmbroideryActionsOpen) closeEmbroideryActions();
    else if (isEmbroideryFiltersOpen) closeEmbroideryFilters();
    else if (isSmartEditActionsOpen) closeSmartEditActions();
    else if (isSmartEditFiltersOpen) closeSmartEditFilters();
  };

  const isPanelOpen = isFiltersOpen || isActionsOpen || isVideoFiltersOpen || isVideoActionsOpen || isThreeDImageFiltersOpen || isThreeDImageActionsOpen || isLaserFiltersOpen || isLaserActionsOpen || isEmbroideryFiltersOpen || isEmbroideryActionsOpen || isSmartEditFiltersOpen || isSmartEditActionsOpen;

  const filterValue = useMemo(
    () => [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `blur(${blur}px)`,
      `grayscale(${grayscale}%)`,
      `sepia(${sepia}%)`,
      `hue-rotate(${hueRotate}deg)`,
    ].join(" "),
    [blur, brightness, contrast, grayscale, hueRotate, saturation, sepia],
  );

  const videoFilterValue = useMemo(
    () => [
      `brightness(${videoBrightness}%)`,
      `contrast(${videoContrast}%)`,
      `saturate(${videoSaturation}%)`,
      `blur(${videoBlur}px)`,
      `grayscale(${videoGrayscale}%)`,
      `sepia(${videoSepia}%)`,
      `hue-rotate(${videoHueRotate}deg)`,
    ].join(" "),
    [videoBlur, videoBrightness, videoContrast, videoGrayscale, videoHueRotate, videoSaturation, videoSepia],
  );

  const threeDImageFilterValue = useMemo(
    () => [
      `brightness(${threeDImageBrightness}%)`,
      `contrast(${threeDImageContrast}%)`,
      `saturate(${threeDImageSaturation}%)`,
      `blur(${threeDImageBlur}px)`,
      `grayscale(${threeDImageGrayscale}%)`,
      `sepia(${threeDImageSepia}%)`,
      `hue-rotate(${threeDImageHueRotate}deg)`,
    ].join(" "),
    [threeDImageBlur, threeDImageBrightness, threeDImageContrast, threeDImageGrayscale, threeDImageHueRotate, threeDImageSaturation, threeDImageSepia],
  );

  const laserFilterValue = useMemo(
    () => [
      `brightness(${laserBrightness}%)`,
      `contrast(${laserContrast}%)`,
      `saturate(${laserSaturation}%)`,
      `blur(${laserBlur}px)`,
      `grayscale(${laserGrayscale}%)`,
      `sepia(${laserSepia}%)`,
      `hue-rotate(${laserHueRotate}deg)`,
    ].join(" "),
    [laserBlur, laserBrightness, laserContrast, laserGrayscale, laserHueRotate, laserSaturation, laserSepia],
  );

  const embroideryFilterValue = useMemo(
    () => [
      `brightness(${embroideryBrightness}%)`,
      `contrast(${embroideryContrast}%)`,
      `saturate(${embroiderySaturation}%)`,
      `blur(${embroideryBlur}px)`,
      `grayscale(${embroideryGrayscale}%)`,
      `sepia(${embroiderySepia}%)`,
      `hue-rotate(${embroideryHueRotate}deg)`,
    ].join(" "),
    [embroideryBlur, embroideryBrightness, embroideryContrast, embroideryGrayscale, embroideryHueRotate, embroiderySaturation, embroiderySepia],
  );

  const smartEditFilterValue = useMemo(
    () => [
      `brightness(${smartEditBrightness}%)`,
      `contrast(${smartEditContrast}%)`,
      `saturate(${smartEditSaturation}%)`,
      `blur(${smartEditBlur}px)`,
      `grayscale(${smartEditGrayscale}%)`,
      `sepia(${smartEditSepia}%)`,
      `hue-rotate(${smartEditHueRotate}deg)`,
    ].join(" "),
    [smartEditBlur, smartEditBrightness, smartEditContrast, smartEditGrayscale, smartEditHueRotate, smartEditSaturation, smartEditSepia],
  );

  const resetFilters = () => {
    setBrightness(DEFAULT_FILTERS.brightness);
    setContrast(DEFAULT_FILTERS.contrast);
    setSaturation(DEFAULT_FILTERS.saturation);
    setSharpness(DEFAULT_FILTERS.sharpness);
    setBlur(DEFAULT_FILTERS.blur);
    setGrayscale(DEFAULT_FILTERS.grayscale);
    setSepia(DEFAULT_FILTERS.sepia);
    setHueRotate(DEFAULT_FILTERS.hueRotate);
    setIsComparing(false);
    setExportMessage("");
  };

  const resetVideoFilters = () => {
    setVideoBrightness(DEFAULT_FILTERS.brightness);
    setVideoContrast(DEFAULT_FILTERS.contrast);
    setVideoSaturation(DEFAULT_FILTERS.saturation);
    setVideoSharpness(DEFAULT_FILTERS.sharpness);
    setVideoBlur(DEFAULT_FILTERS.blur);
    setVideoGrayscale(DEFAULT_FILTERS.grayscale);
    setVideoSepia(DEFAULT_FILTERS.sepia);
    setVideoHueRotate(DEFAULT_FILTERS.hueRotate);
    setIsVideoComparing(false);
    setVideoExportMessage("");
  };

  const resetThreeDImageFilters = () => {
    setThreeDImageBrightness(DEFAULT_FILTERS.brightness);
    setThreeDImageContrast(DEFAULT_FILTERS.contrast);
    setThreeDImageSaturation(DEFAULT_FILTERS.saturation);
    setThreeDImageSharpness(DEFAULT_FILTERS.sharpness);
    setThreeDImageBlur(DEFAULT_FILTERS.blur);
    setThreeDImageGrayscale(DEFAULT_FILTERS.grayscale);
    setThreeDImageSepia(DEFAULT_FILTERS.sepia);
    setThreeDImageHueRotate(DEFAULT_FILTERS.hueRotate);
    setIsThreeDImageComparing(false);
    setThreeDImageExportMessage("");
  };

  const resetLaserFilters = () => {
    setLaserBrightness(DEFAULT_FILTERS.brightness);
    setLaserContrast(DEFAULT_FILTERS.contrast);
    setLaserSaturation(DEFAULT_FILTERS.saturation);
    setLaserSharpness(DEFAULT_FILTERS.sharpness);
    setLaserBlur(DEFAULT_FILTERS.blur);
    setLaserGrayscale(DEFAULT_FILTERS.grayscale);
    setLaserSepia(DEFAULT_FILTERS.sepia);
    setLaserHueRotate(DEFAULT_FILTERS.hueRotate);
    setIsLaserComparing(false);
    setLaserExportMessage("");
  };

  const resetEmbroideryFilters = () => {
    setEmbroideryBrightness(DEFAULT_FILTERS.brightness);
    setEmbroideryContrast(DEFAULT_FILTERS.contrast);
    setEmbroiderySaturation(DEFAULT_FILTERS.saturation);
    setEmbroiderySharpness(DEFAULT_FILTERS.sharpness);
    setEmbroideryBlur(DEFAULT_FILTERS.blur);
    setEmbroideryGrayscale(DEFAULT_FILTERS.grayscale);
    setEmbroiderySepia(DEFAULT_FILTERS.sepia);
    setEmbroideryHueRotate(DEFAULT_FILTERS.hueRotate);
    setIsEmbroideryComparing(false);
    setEmbroideryExportMessage("");
  };

  const resetSmartEditFilters = () => {
    setSmartEditBrightness(DEFAULT_FILTERS.brightness);
    setSmartEditContrast(DEFAULT_FILTERS.contrast);
    setSmartEditSaturation(DEFAULT_FILTERS.saturation);
    setSmartEditSharpness(DEFAULT_FILTERS.sharpness);
    setSmartEditBlur(DEFAULT_FILTERS.blur);
    setSmartEditGrayscale(DEFAULT_FILTERS.grayscale);
    setSmartEditSepia(DEFAULT_FILTERS.sepia);
    setSmartEditHueRotate(DEFAULT_FILTERS.hueRotate);
    setIsSmartEditComparing(false);
    setSmartEditExportMessage("");
  };

  const loadImageFile = (file: File) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setImageUploadError("يرجى اختيار صورة PNG أو JPEG أو WebP.");
      return;
    }
    setImageUploadError("");
    setIsImageLoading(true);

    const nextUrl = URL.createObjectURL(file);
    const nextOriginalUrl = URL.createObjectURL(file);
    const nextVideoUrl = URL.createObjectURL(file);
    const nextThreeDImageUrl = URL.createObjectURL(file);
    const nextLaserUrl = URL.createObjectURL(file);
    const nextEmbroideryUrl = URL.createObjectURL(file);
    const nextSmartEditUrl = URL.createObjectURL(file);
    setActiveImageSource({ kind: "uploaded-file", file, previewUrl: nextUrl, originalUrl: nextOriginalUrl });
    setGeneratedResultImage(null);
    setProductMemoryImage(null);
    setVideoPreviewUrl(nextVideoUrl);
    setThreeDImagePreviewUrl(nextThreeDImageUrl);
    setLaserPreviewUrl(nextLaserUrl);
    setEmbroideryPreviewUrl(nextEmbroideryUrl);
    setSmartEditPreviewUrl(nextSmartEditUrl);
    const uploadedMemory = createUploadedProductMemory(file, nextOriginalUrl);
    setActiveProductMemory(uploadedMemory);
    void analyzeProductImage({ image: nextOriginalUrl, fileName: file.name, mimeType: file.type })
      .then((profile) => {
        const detected = new Set(profile.features.filter((feature) => feature.detected).map((feature) => feature.key));
        const shape = detected.has("roundShape") ? "round" : detected.has("tallShape") ? "tall" : "";
        const material = detected.has("wood") ? "wood" : detected.has("metal") ? "metal" : detected.has("fabric") ? "fabric" : detected.has("glass") ? "glass" : "";
        const categoryId = profile.category === "candle" ? "candles" : profile.category === "box" ? "packaging" : profile.category === "toy" ? "kids" : "";
        const productType = profile.category === "unknown" ? "" : profile.category;
        const suggestedFields: Partial<ProductDNA> = {
          categoryId,
          productType,
          shape,
          material,
          hasWick: profile.category === "candle" ? true : null,
          notes: file.name,
        };
        const missingFields = [
          !productType && "productType",
          !shape && "shape",
          !material && "material",
          "color",
          "dimensions",
        ].filter((field): field is string => Boolean(field));
        setActiveProductMemory((current) => current?.memoryId === uploadedMemory.memoryId
          ? completeUploadedImageAnalysis(current, { confidence: profile.categoryConfidence, suggestedFields, missingFields })
          : current);
      })
      .catch((error) => {
        console.error("[Product Memory] Local image analysis failed:", error);
        setActiveProductMemory((current) => current?.memoryId === uploadedMemory.memoryId ? failUploadedImageAnalysis(current) : current);
      });
    setFileName(file.name);
    setExportMessage("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadImageFile(file);
    event.target.value = "";
  };

  const handleImageDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsImageDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) loadImageFile(file);
  };

  const selectPlatformProduct = ({ productDNA, title, imageUrl }: PlatformProductSelection): ProductSelectionMode => {
    const selectedMemory = loadProductMemoryByProductId(productDNA.id);
    const productSelectionMode: ProductSelectionMode = activeImageSource?.kind === "uploaded-file"
      ? "apply-dna-to-current-image"
      : "load-complete-product";
    if (productSelectionMode === "apply-dna-to-current-image") {
      const referencedDNA = selectedMemory?.productDNA ?? productDNA;
      const dimensions = selectedMemory?.dimensions ?? referencedDNA.dimensions;
      setProductMemoryImage(selectedMemory?.originalImage?.persistentUrl ?? selectedMemory?.originalImage?.previewUrl ?? imageUrl ?? null);
      setActiveProductMemory((current) => current ? {
        ...current,
        productId: null,
        categoryId: referencedDNA.categoryId || null,
        source: "uploaded-image",
        dnaReference: {
          productId: productDNA.id,
          memoryId: selectedMemory?.memoryId,
          title,
        },
        productDNA: {
          ...referencedDNA,
          id: current.memoryId,
          dimensions,
          confirmed: false,
          confirmedAt: undefined,
        },
        dimensions: { ...dimensions, confirmed: false },
        originalImage: current.originalImage,
        analysis: {
          ...current.analysis,
          status: "suggested",
          suggestedFields: { ...referencedDNA, dimensions },
        },
        updatedAt: new Date().toISOString(),
      } : current);
      setSmartEditPreviewUrl(null);
      return productSelectionMode;
    }

    const memory = createPlatformProductMemory(productDNA, imageUrl ? { name: title, url: imageUrl } : null);
    const storedImageUrl = memory.originalImage?.persistentUrl ?? memory.originalImage?.previewUrl ?? imageUrl;
    setActiveProductMemory(memory);
    setProductMemoryImage(storedImageUrl ?? null);
    setGeneratedResultImage(null);
    setFileName(title || productDNA.id);
    setActiveImageSource(storedImageUrl ? {
      kind: memory.originalImage ? "product-memory" : "platform-product",
      productId: productDNA.id,
      previewUrl: storedImageUrl,
      originalUrl: storedImageUrl,
    } : null);
    setSmartEditPreviewUrl(null);
    return productSelectionMode;
  };

  const stopComparing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsComparing(false);
  };

  const stopVideoComparing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsVideoComparing(false);
  };

  const stopThreeDImageComparing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsThreeDImageComparing(false);
  };

  const stopLaserComparing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsLaserComparing(false);
  };

  const stopEmbroideryComparing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsEmbroideryComparing(false);
  };

  const stopSmartEditComparing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsSmartEditComparing(false);
  };

  const createExportBlob = useCallback(async (
    format: "image/png" | "image/webp",
    quality?: number,
  ) => {
    if (!previewUrl) throw new Error("image-unavailable");

    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image-load-failed"));
    });
    image.src = previewUrl;
    await loaded;

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas-unavailable");

    context.filter = filterValue;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error("export-failed"));
      }, format, quality);
    });
  }, [filterValue, previewUrl]);

  const exportImage = useCallback(async (
    format: "image/png" | "image/webp",
    extension: "png" | "webp",
    quality?: number,
  ) => {
    if (!previewUrl || exportingFormat) return;
    setExportingFormat(extension);
    setExportMessage("");

    try {
      const blob = await createExportBlob(format, quality);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `dekokraft-image.${extension}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setExportMessage(t(`studio.image.downloaded${extension === "webp" ? "Webp" : "Png"}`));
    } catch {
      setExportMessage(t("studio.image.exportFailed"));
    } finally {
      setExportingFormat(null);
    }
  }, [createExportBlob, exportingFormat, previewUrl, t]);

  const copyImage = useCallback(async () => {
    if (!previewUrl || exportingFormat) return;
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
      setExportMessage(t("studio.image.copyUnsupported"));
      return;
    }

    setExportingFormat("copy");
    setExportMessage("");
    try {
      const pngBlob = createExportBlob("image/png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setExportMessage(t("studio.image.copied"));
    } catch {
      setExportMessage(t("studio.image.exportFailed"));
    } finally {
      setExportingFormat(null);
    }
  }, [createExportBlob, exportingFormat, previewUrl, t]);

  const createVideoExportBlob = useCallback(async (
    format: "image/png" | "image/webp",
    quality?: number,
  ) => {
    if (!videoPreviewUrl) throw new Error("video-frame-unavailable");
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("video-frame-load-failed"));
    });
    image.src = videoPreviewUrl;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("video-canvas-unavailable");
    context.filter = videoFilterValue;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("video-export-failed")), format, quality);
    });
  }, [videoFilterValue, videoPreviewUrl]);

  const exportVideoFrame = useCallback(async (
    format: "image/png" | "image/webp",
    extension: "png" | "webp",
    quality?: number,
  ) => {
    if (!videoPreviewUrl || videoExportingFormat) return;
    setVideoExportingFormat(extension);
    setVideoExportMessage("");
    try {
      const blob = await createVideoExportBlob(format, quality);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `dekokraft-image.${extension}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setVideoExportMessage(t(`studio.video.downloaded${extension === "webp" ? "Webp" : "Png"}`));
    } catch {
      setVideoExportMessage(t("studio.video.exportFailed"));
    } finally {
      setVideoExportingFormat(null);
    }
  }, [createVideoExportBlob, t, videoExportingFormat, videoPreviewUrl]);

  const copyVideoFrame = useCallback(async () => {
    if (!videoPreviewUrl || videoExportingFormat) return;
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
      setVideoExportMessage(t("studio.video.copyUnsupported"));
      return;
    }
    setVideoExportingFormat("copy");
    setVideoExportMessage("");
    try {
      const pngBlob = createVideoExportBlob("image/png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setVideoExportMessage(t("studio.video.copied"));
    } catch {
      setVideoExportMessage(t("studio.video.exportFailed"));
    } finally {
      setVideoExportingFormat(null);
    }
  }, [createVideoExportBlob, t, videoExportingFormat, videoPreviewUrl]);

  const createThreeDImageExportBlob = useCallback(async (
    format: "image/png" | "image/webp",
    quality?: number,
  ) => {
    if (!threeDImagePreviewUrl) throw new Error("three-d-image-unavailable");
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("three-d-image-load-failed"));
    });
    image.src = threeDImagePreviewUrl;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("three-d-image-canvas-unavailable");
    context.filter = threeDImageFilterValue;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("three-d-image-export-failed")), format, quality);
    });
  }, [threeDImageFilterValue, threeDImagePreviewUrl]);

  const exportThreeDImage = useCallback(async (
    format: "image/png" | "image/webp",
    extension: "png" | "webp",
    quality?: number,
  ) => {
    if (!threeDImagePreviewUrl || threeDImageExportingFormat) return;
    setThreeDImageExportingFormat(extension);
    setThreeDImageExportMessage("");
    try {
      const blob = await createThreeDImageExportBlob(format, quality);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `dekokraft-image.${extension}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setThreeDImageExportMessage(t(`studio.threeDImage.downloaded${extension === "webp" ? "Webp" : "Png"}`));
    } catch {
      setThreeDImageExportMessage(t("studio.threeDImage.exportFailed"));
    } finally {
      setThreeDImageExportingFormat(null);
    }
  }, [createThreeDImageExportBlob, t, threeDImageExportingFormat, threeDImagePreviewUrl]);

  const copyThreeDImage = useCallback(async () => {
    if (!threeDImagePreviewUrl || threeDImageExportingFormat) return;
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
      setThreeDImageExportMessage(t("studio.threeDImage.copyUnsupported"));
      return;
    }
    setThreeDImageExportingFormat("copy");
    setThreeDImageExportMessage("");
    try {
      const pngBlob = createThreeDImageExportBlob("image/png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setThreeDImageExportMessage(t("studio.threeDImage.copied"));
    } catch {
      setThreeDImageExportMessage(t("studio.threeDImage.exportFailed"));
    } finally {
      setThreeDImageExportingFormat(null);
    }
  }, [createThreeDImageExportBlob, t, threeDImageExportingFormat, threeDImagePreviewUrl]);

  const createLaserExportBlob = useCallback(async (
    format: "image/png" | "image/webp",
    quality?: number,
  ) => {
    if (!laserPreviewUrl) throw new Error("laser-image-unavailable");
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("laser-image-load-failed"));
    });
    image.src = laserPreviewUrl;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("laser-image-canvas-unavailable");
    context.filter = laserFilterValue;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("laser-image-export-failed")), format, quality);
    });
  }, [laserFilterValue, laserPreviewUrl]);

  const exportLaserImage = useCallback(async (
    format: "image/png" | "image/webp",
    extension: "png" | "webp",
    quality?: number,
  ) => {
    if (!laserPreviewUrl || laserExportingFormat) return;
    setLaserExportingFormat(extension);
    setLaserExportMessage("");
    try {
      const blob = await createLaserExportBlob(format, quality);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `dekokraft-image.${extension}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setLaserExportMessage(t(`studio.laserProcessing.downloaded${extension === "webp" ? "Webp" : "Png"}`));
    } catch {
      setLaserExportMessage(t("studio.laserProcessing.exportFailed"));
    } finally {
      setLaserExportingFormat(null);
    }
  }, [createLaserExportBlob, laserExportingFormat, laserPreviewUrl, t]);

  const copyLaserImage = useCallback(async () => {
    if (!laserPreviewUrl || laserExportingFormat) return;
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
      setLaserExportMessage(t("studio.laserProcessing.copyUnsupported"));
      return;
    }
    setLaserExportingFormat("copy");
    setLaserExportMessage("");
    try {
      const pngBlob = createLaserExportBlob("image/png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setLaserExportMessage(t("studio.laserProcessing.copied"));
    } catch {
      setLaserExportMessage(t("studio.laserProcessing.exportFailed"));
    } finally {
      setLaserExportingFormat(null);
    }
  }, [createLaserExportBlob, laserExportingFormat, laserPreviewUrl, t]);

  const createEmbroideryExportBlob = useCallback(async (
    format: "image/png" | "image/webp",
    quality?: number,
  ) => {
    if (!embroideryPreviewUrl) throw new Error("embroidery-image-unavailable");
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("embroidery-image-load-failed"));
    });
    image.src = embroideryPreviewUrl;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("embroidery-image-canvas-unavailable");
    context.filter = embroideryFilterValue;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("embroidery-image-export-failed")), format, quality);
    });
  }, [embroideryFilterValue, embroideryPreviewUrl]);

  const exportEmbroideryImage = useCallback(async (
    format: "image/png" | "image/webp",
    extension: "png" | "webp",
    quality?: number,
  ) => {
    if (!embroideryPreviewUrl || embroideryExportingFormat) return;
    setEmbroideryExportingFormat(extension);
    setEmbroideryExportMessage("");
    try {
      const blob = await createEmbroideryExportBlob(format, quality);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `dekokraft-image.${extension}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setEmbroideryExportMessage(t(`studio.embroideryProcessing.downloaded${extension === "webp" ? "Webp" : "Png"}`));
    } catch {
      setEmbroideryExportMessage(t("studio.embroideryProcessing.exportFailed"));
    } finally {
      setEmbroideryExportingFormat(null);
    }
  }, [createEmbroideryExportBlob, embroideryExportingFormat, embroideryPreviewUrl, t]);

  const copyEmbroideryImage = useCallback(async () => {
    if (!embroideryPreviewUrl || embroideryExportingFormat) return;
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
      setEmbroideryExportMessage(t("studio.embroideryProcessing.copyUnsupported"));
      return;
    }
    setEmbroideryExportingFormat("copy");
    setEmbroideryExportMessage("");
    try {
      const pngBlob = createEmbroideryExportBlob("image/png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setEmbroideryExportMessage(t("studio.embroideryProcessing.copied"));
    } catch {
      setEmbroideryExportMessage(t("studio.embroideryProcessing.exportFailed"));
    } finally {
      setEmbroideryExportingFormat(null);
    }
  }, [createEmbroideryExportBlob, embroideryExportingFormat, embroideryPreviewUrl, t]);

  const createSmartEditExportBlob = useCallback(async (
    format: "image/png" | "image/webp",
    quality?: number,
  ) => {
    if (!smartEditPreviewUrl) throw new Error("smart-edit-image-unavailable");
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("smart-edit-image-load-failed"));
    });
    image.src = smartEditPreviewUrl;
    await loaded;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("smart-edit-image-canvas-unavailable");
    context.filter = smartEditFilterValue;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("smart-edit-image-export-failed")), format, quality);
    });
  }, [smartEditFilterValue, smartEditPreviewUrl]);

  const exportSmartEditImage = useCallback(async (
    format: "image/png" | "image/webp",
    extension: "png" | "webp",
    quality?: number,
  ) => {
    if (!smartEditPreviewUrl || smartEditExportingFormat) return;
    setSmartEditExportingFormat(extension);
    setSmartEditExportMessage("");
    try {
      const blob = await createSmartEditExportBlob(format, quality);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `dekokraft-image.${extension}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setSmartEditExportMessage(t(`studio.smartEditProcessing.downloaded${extension === "webp" ? "Webp" : "Png"}`));
    } catch {
      setSmartEditExportMessage(t("studio.smartEditProcessing.exportFailed"));
    } finally {
      setSmartEditExportingFormat(null);
    }
  }, [createSmartEditExportBlob, smartEditExportingFormat, smartEditPreviewUrl, t]);

  const copySmartEditImage = useCallback(async () => {
    if (!smartEditPreviewUrl || smartEditExportingFormat) return;
    if (!("ClipboardItem" in window) || !navigator.clipboard?.write) {
      setSmartEditExportMessage(t("studio.smartEditProcessing.copyUnsupported"));
      return;
    }
    setSmartEditExportingFormat("copy");
    setSmartEditExportMessage("");
    try {
      const pngBlob = createSmartEditExportBlob("image/png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      setSmartEditExportMessage(t("studio.smartEditProcessing.copied"));
    } catch {
      setSmartEditExportMessage(t("studio.smartEditProcessing.exportFailed"));
    } finally {
      setSmartEditExportingFormat(null);
    }
  }, [createSmartEditExportBlob, smartEditExportingFormat, smartEditPreviewUrl, t]);

  return (
    <div ref={studioWindowRef} className="echoImageStudio" dir={direction}>
      <div className={`echoImageStudio__layout${isSmartEditOpen ? " echoImageStudio__layout--smart-open" : ""}`}>
      <aside className="echoImageStudio__toolsColumn" dir={direction}>
      <header className="echoImageStudio__header">
        <div className="echoImageStudio__headerControls">
          <div className="echoImageStudio__windowControls">
            {isMaximized ? (
              <button type="button" className="echoImageIconButton" aria-label={t("studio.image.restore")} title={t("studio.image.restore")} aria-pressed="true" onClick={onRestore}>
                <Minimize2 size={18} aria-hidden="true" />
              </button>
            ) : (
              <button type="button" className="echoImageIconButton" aria-label={t("studio.image.maximize")} title={t("studio.image.maximize")} aria-pressed="false" onClick={onMaximize}>
                <Maximize2 size={18} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="echoImageIconButton echoImageStudio__back"
              aria-label={t("studio.image.back")}
              title={t("studio.image.back")}
              autoFocus
              onClick={onBack}
            >
              <ArrowRight size={19} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="echoImageIconButton"
              aria-label={t("studio.image.closeStudio")}
              title={t("studio.image.closeStudio")}
              onClick={onCloseStudio}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div ref={toolbarRef} className="echoImageStudio__processingTools">
            <div ref={imageToolsRef} className="echoImageStudio__headerTools">
            <button
              ref={imageToolsToggleRef}
              type="button"
              className="echoImageMainToolButton"
              data-active={activeWorkspace === "image" ? "true" : undefined}
              aria-expanded={isImageToolsOpen}
              aria-controls="echo-image-tools-menu"
              onClick={openFilters}
            >
              <span className="echoImageMainToolIcon"><WandSparkles size={20} aria-hidden="true" /></span>
              <span className="echoImageMainToolLabel">{t("studio.image.imageProcessing")}</span>
              <ChevronDown className={`echoImageMainToolChevron${isImageToolsOpen ? " isOpen" : ""}`} size={18} aria-hidden="true" />
            </button>
            <ImageToolsMenu
              isOpen={isImageToolsOpen}
              hasImage={Boolean(previewUrl)}
              isFiltersOpen={isFiltersOpen}
              isActionsOpen={isActionsOpen}
              exportingFormat={exportingFormat}
              onOpenFilters={openFilters}
              onOpenActions={openActions}
              onExportPng={() => {
                setIsImageToolsOpen(false);
                void exportImage("image/png", "png");
              }}
              onExportWebp={() => {
                setIsImageToolsOpen(false);
                void exportImage("image/webp", "webp", 0.92);
              }}
              onCopyImage={() => {
                setIsImageToolsOpen(false);
                void copyImage();
              }}
            />
            </div>
            <div ref={videoToolsRef} className="echoVideoStudio__headerTools">
            <button
              ref={videoToolsToggleRef}
              type="button"
              className="echoVideoMainToolButton"
              data-active={activeWorkspace === "video" ? "true" : undefined}
              aria-expanded={isVideoToolsOpen}
              aria-controls="echo-video-tools-menu"
              onClick={openVideoFilters}
            >
              <span className="echoVideoMainToolIcon"><Video size={20} aria-hidden="true" /></span>
              <span className="echoVideoMainToolLabel">{t("studio.video.imageProcessing")}</span>
              <ChevronDown className={`echoVideoMainToolChevron${isVideoToolsOpen ? " isOpen" : ""}`} size={18} aria-hidden="true" />
            </button>
            <VideoToolsMenu
              isOpen={isVideoToolsOpen}
              hasVideo={Boolean(videoPreviewUrl)}
              isFiltersOpen={isVideoFiltersOpen}
              isActionsOpen={isVideoActionsOpen}
              exportingFormat={videoExportingFormat}
              onOpenFilters={openVideoFilters}
              onOpenActions={openVideoActions}
              onExportPng={() => {
                setIsVideoToolsOpen(false);
                void exportVideoFrame("image/png", "png");
              }}
              onExportWebp={() => {
                setIsVideoToolsOpen(false);
                void exportVideoFrame("image/webp", "webp", 0.92);
              }}
              onCopyVideo={() => {
                setIsVideoToolsOpen(false);
                void copyVideoFrame();
              }}
            />
            </div>
            <div ref={threeDImageToolsRef} className="echoThreeDImageStudio__headerTools">
            <button
              ref={threeDImageToolsToggleRef}
              type="button"
              className="echoThreeDImageMainToolButton"
              data-active={activeWorkspace === "3d" ? "true" : undefined}
              aria-expanded={isThreeDImageToolsOpen}
              aria-controls="echo-three-d-image-tools-menu"
              onClick={openThreeDImageFilters}
            >
              <span className="echoThreeDImageMainToolIcon"><Box size={20} aria-hidden="true" /></span>
              <span className="echoThreeDImageMainToolLabel">{t("studio.threeDImage.processing")}</span>
              <ChevronDown className={`echoThreeDImageMainToolChevron${isThreeDImageToolsOpen ? " isOpen" : ""}`} size={18} aria-hidden="true" />
            </button>
            <ThreeDImageToolsMenu
              isOpen={isThreeDImageToolsOpen}
              hasThreeDImage={Boolean(threeDImagePreviewUrl)}
              isFiltersOpen={isThreeDImageFiltersOpen}
              isActionsOpen={isThreeDImageActionsOpen}
              exportingFormat={threeDImageExportingFormat}
              onOpenFilters={openThreeDImageFilters}
              onOpenActions={openThreeDImageActions}
              onExportPng={() => {
                setIsThreeDImageToolsOpen(false);
                void exportThreeDImage("image/png", "png");
              }}
              onExportWebp={() => {
                setIsThreeDImageToolsOpen(false);
                void exportThreeDImage("image/webp", "webp", 0.92);
              }}
              onCopyThreeDImage={() => {
                setIsThreeDImageToolsOpen(false);
                void copyThreeDImage();
              }}
            />
            </div>
            <div className="echoCncStudio__headerTools">
              <button
                type="button"
                className="echoCncMainToolButton"
                data-active={activeWorkspace === "cnc" ? "true" : undefined}
                onClick={openCncFilters}
              >
                <span className="echoLaserMainToolIcon"><Crosshair size={20} aria-hidden="true" /></span>
                <span className="echoLaserMainToolLabel">الليزر CNC</span>
              </button>
            </div>
            <div ref={laserToolsRef} className="echoLaserStudio__headerTools">
              <button
                ref={laserToolsToggleRef}
                type="button"
                className="echoLaserMainToolButton"
                data-active={activeWorkspace === "laser" ? "true" : undefined}
                aria-expanded={isLaserToolsOpen}
                aria-controls="echo-laser-tools-menu"
                onClick={openLaserFilters}
              >
                <span className="echoLaserMainToolIcon"><Scissors size={20} aria-hidden="true" /></span>
                <span className="echoLaserMainToolLabel">المقص الكهربائي</span>
                <ChevronDown className={`echoLaserMainToolChevron${isLaserToolsOpen ? " isOpen" : ""}`} size={18} aria-hidden="true" />
              </button>
              <LaserToolsMenu
                isOpen={isLaserToolsOpen}
                hasLaserImage={Boolean(laserPreviewUrl)}
                isFiltersOpen={isLaserFiltersOpen}
                isActionsOpen={isLaserActionsOpen}
                exportingFormat={laserExportingFormat}
                onOpenFilters={openLaserFilters}
                onOpenActions={openLaserActions}
                onExportPng={() => {
                  setIsLaserToolsOpen(false);
                  void exportLaserImage("image/png", "png");
                }}
                onExportWebp={() => {
                  setIsLaserToolsOpen(false);
                  void exportLaserImage("image/webp", "webp", 0.92);
                }}
                onCopyLaserImage={() => {
                  setIsLaserToolsOpen(false);
                  void copyLaserImage();
                }}
              />
            </div>
            <div ref={embroideryToolsRef} className="echoEmbroideryStudio__headerTools">
              <button
                ref={embroideryToolsToggleRef}
                type="button"
                className="echoEmbroideryMainToolButton"
                data-active={activeWorkspace === "embroidery" ? "true" : undefined}
                aria-expanded={isEmbroideryToolsOpen}
                aria-controls="echo-embroidery-tools-menu"
                onClick={openEmbroideryFilters}
              >
                <span className="echoEmbroideryMainToolIcon"><Palette size={20} aria-hidden="true" /></span>
                <span className="echoEmbroideryMainToolLabel">{t("studio.embroideryProcessing.processing")}</span>
                <ChevronDown className={`echoEmbroideryMainToolChevron${isEmbroideryToolsOpen ? " isOpen" : ""}`} size={18} aria-hidden="true" />
              </button>
              <EmbroideryToolsMenu
                isOpen={isEmbroideryToolsOpen}
                hasEmbroideryImage={Boolean(embroideryPreviewUrl)}
                isFiltersOpen={isEmbroideryFiltersOpen}
                isActionsOpen={isEmbroideryActionsOpen}
                exportingFormat={embroideryExportingFormat}
                onOpenFilters={openEmbroideryFilters}
                onOpenActions={openEmbroideryActions}
                onExportPng={() => {
                  setIsEmbroideryToolsOpen(false);
                  void exportEmbroideryImage("image/png", "png");
                }}
                onExportWebp={() => {
                  setIsEmbroideryToolsOpen(false);
                  void exportEmbroideryImage("image/webp", "webp", 0.92);
                }}
                onCopyEmbroideryImage={() => {
                  setIsEmbroideryToolsOpen(false);
                  void copyEmbroideryImage();
                }}
              />
            </div>
          </div>
        </div>
        {exportMessage && <span className="echoImageToolsStatus" role="status" aria-live="polite">{exportMessage}</span>}
        {videoExportMessage && <span className="echoVideoToolsStatus" role="status" aria-live="polite">{videoExportMessage}</span>}
        {threeDImageExportMessage && <span className="echoThreeDImageToolsStatus" role="status" aria-live="polite">{threeDImageExportMessage}</span>}
        {laserExportMessage && <span className="echoLaserToolsStatus" role="status" aria-live="polite">{laserExportMessage}</span>}
        {embroideryExportMessage && <span className="echoEmbroideryToolsStatus" role="status" aria-live="polite">{embroideryExportMessage}</span>}
        {smartEditExportMessage && <span className="echoSmartEditToolsStatus" role="status" aria-live="polite">{smartEditExportMessage}</span>}
      </header>
      </aside>

      <div
        className={`echoImageStudio__workspace${isPanelOpen ? " echoImageStudio__workspace--panel-open" : " echoImageStudio__workspace--panel-closed"}`}
      >
        <div className="echoImagePreviewColumn">
          {activeProcessingMode === "video" ? (
            <VideoProcessingWorkspace filterValue={videoFilterValue} isComparing={isVideoComparing} />
          ) : activeProcessingMode === "threeDImage" ? (
            <ThreeDProcessingWorkspace />
          ) : (
            <section
              ref={canvasRef}
              className={`echoImagePreview${isImageDragging ? " echoImagePreview--dragging" : ""}`}
              aria-label={t("studio.image.title")}
              onDragEnter={(event) => { event.preventDefault(); setIsImageDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsImageDragging(false); }}
              onDrop={handleImageDrop}
            >
            {previewUrl ? (
              <NextImage
                src={previewUrl}
                alt={fileName}
                className="echoImagePreview__image"
                fill
                unoptimized
                sizes="(max-width: 760px) 100vw, 640px"
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setIsImageLoading(false);
                  setImageUploadError("تعذر تحميل الصورة المختارة.");
                  setActiveImageSource((current) => current?.previewUrl === previewUrl ? null : current);
                }}
                style={{
                  filter: activeProcessingMode === "embroidery"
                    ? isEmbroideryComparing ? "none" : embroideryFilterValue
                    : activeProcessingMode === "laser"
                      ? isLaserComparing ? "none" : laserFilterValue
                      : activeProcessingMode === "cnc"
                        ? isLaserComparing ? "none" : laserFilterValue
                    : isComparing ? "none" : filterValue,
                }}
              />
            ) : (
              <div className="echoImagePreview__empty">
                <ImagePlus size={42} aria-hidden="true" />
                <p>{activeProductMemory?.productId ? "لا توجد صورة محفوظة لهذا المنتج." : t("studio.image.uploadHint")}</p>
                <div className="echoImageSourceActions">
                  <button type="button" className="echoImageActionButton" onClick={() => fileInputRef.current?.click()}>
                    اختيار صورة
                  </button>
                  <Link className="echoImageActionButton" href="/studio/library">مكتبة الموقع</Link>
                </div>
              </div>
            )}
            {isImageLoading && <span className="echoImagePreview__state" role="status">جارٍ تحميل الصورة…</span>}
            {imageUploadError && <span className="echoImagePreview__state echoImagePreview__state--error" role="alert">{imageUploadError}</span>}
            <input
              ref={fileInputRef}
              className="echoImageStudio__fileInput"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              aria-label={t("studio.image.upload")}
              onChange={handleFileChange}
            />
            </section>
          )}
        </div>

        {activeProcessingMode !== "image" && <button
          type="button"
          className={`echoImageFiltersBackdrop${isPanelOpen ? " echoImageFiltersBackdrop--visible" : ""}`}
          aria-label={isSmartEditActionsOpen
            ? t("studio.smartEditProcessing.closeActions")
            : isSmartEditFiltersOpen
              ? t("studio.smartEditProcessing.closeFilters")
              : isEmbroideryActionsOpen
            ? t("studio.embroideryProcessing.closeActions")
            : isEmbroideryFiltersOpen
              ? t("studio.embroideryProcessing.closeFilters")
              : isLaserActionsOpen
                ? t("studio.laserProcessing.closeActions")
                : isLaserFiltersOpen
                  ? t("studio.laserProcessing.closeFilters")
                  : isThreeDImageActionsOpen
                ? t("studio.threeDImage.closeActions")
                : isThreeDImageFiltersOpen
                  ? t("studio.threeDImage.closeFilters")
                  : isVideoActionsOpen
                    ? t("studio.video.closeActions")
                    : isVideoFiltersOpen
                      ? t("studio.video.closeFilters")
                      : isActionsOpen
                        ? t("studio.image.closeActions")
                        : t("studio.image.closeFilters")}
          tabIndex={-1}
          disabled={!isPanelOpen}
          onClick={closeActivePanel}
        />}

        <VideoFiltersPanel
          isOpen={isVideoFiltersOpen}
          closeButtonRef={videoFiltersCloseRef}
          brightness={videoBrightness}
          contrast={videoContrast}
          saturation={videoSaturation}
          sharpness={videoSharpness}
          blur={videoBlur}
          grayscale={videoGrayscale}
          sepia={videoSepia}
          hueRotate={videoHueRotate}
          onClose={closeVideoFilters}
          onBrightnessChange={setVideoBrightness}
          onContrastChange={setVideoContrast}
          onSaturationChange={setVideoSaturation}
          onSharpnessChange={setVideoSharpness}
          onBlurChange={setVideoBlur}
          onGrayscaleChange={setVideoGrayscale}
          onSepiaChange={setVideoSepia}
          onHueRotateChange={setVideoHueRotate}
        />

        <VideoActionsPanel
          isOpen={isVideoActionsOpen}
          closeButtonRef={videoActionsCloseRef}
          hasVideo={Boolean(videoPreviewUrl)}
          isComparing={isVideoComparing}
          onClose={closeVideoActions}
          onReset={resetVideoFilters}
          onCompareStart={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsVideoComparing(true);
          }}
          onCompareStop={stopVideoComparing}
          onCompareKeyChange={setIsVideoComparing}
        />

        <ThreeDImageFiltersPanel
          isOpen={isThreeDImageFiltersOpen}
          closeButtonRef={threeDImageFiltersCloseRef}
          brightness={threeDImageBrightness}
          contrast={threeDImageContrast}
          saturation={threeDImageSaturation}
          sharpness={threeDImageSharpness}
          blur={threeDImageBlur}
          grayscale={threeDImageGrayscale}
          sepia={threeDImageSepia}
          hueRotate={threeDImageHueRotate}
          onClose={closeThreeDImageFilters}
          onBrightnessChange={setThreeDImageBrightness}
          onContrastChange={setThreeDImageContrast}
          onSaturationChange={setThreeDImageSaturation}
          onSharpnessChange={setThreeDImageSharpness}
          onBlurChange={setThreeDImageBlur}
          onGrayscaleChange={setThreeDImageGrayscale}
          onSepiaChange={setThreeDImageSepia}
          onHueRotateChange={setThreeDImageHueRotate}
        />

        <ThreeDImageActionsPanel
          isOpen={isThreeDImageActionsOpen}
          closeButtonRef={threeDImageActionsCloseRef}
          hasThreeDImage={Boolean(threeDImagePreviewUrl)}
          isComparing={isThreeDImageComparing}
          onClose={closeThreeDImageActions}
          onReset={resetThreeDImageFilters}
          onCompareStart={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsThreeDImageComparing(true);
          }}
          onCompareStop={stopThreeDImageComparing}
          onCompareKeyChange={setIsThreeDImageComparing}
        />

        <LaserFiltersPanel
          isOpen={isLaserFiltersOpen}
          closeButtonRef={laserFiltersCloseRef}
          brightness={laserBrightness}
          contrast={laserContrast}
          saturation={laserSaturation}
          sharpness={laserSharpness}
          blur={laserBlur}
          grayscale={laserGrayscale}
          sepia={laserSepia}
          hueRotate={laserHueRotate}
          onClose={closeLaserFilters}
          onBrightnessChange={setLaserBrightness}
          onContrastChange={setLaserContrast}
          onSaturationChange={setLaserSaturation}
          onSharpnessChange={setLaserSharpness}
          onBlurChange={setLaserBlur}
          onGrayscaleChange={setLaserGrayscale}
          onSepiaChange={setLaserSepia}
          onHueRotateChange={setLaserHueRotate}
        />

        <LaserActionsPanel
          isOpen={isLaserActionsOpen}
          closeButtonRef={laserActionsCloseRef}
          hasLaserImage={Boolean(laserPreviewUrl)}
          isComparing={isLaserComparing}
          onClose={closeLaserActions}
          onReset={resetLaserFilters}
          onCompareStart={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsLaserComparing(true);
          }}
          onCompareStop={stopLaserComparing}
          onCompareKeyChange={setIsLaserComparing}
        />

        <EmbroideryFiltersPanel
          isOpen={isEmbroideryFiltersOpen}
          closeButtonRef={embroideryFiltersCloseRef}
          brightness={embroideryBrightness}
          contrast={embroideryContrast}
          saturation={embroiderySaturation}
          sharpness={embroiderySharpness}
          blur={embroideryBlur}
          grayscale={embroideryGrayscale}
          sepia={embroiderySepia}
          hueRotate={embroideryHueRotate}
          onClose={closeEmbroideryFilters}
          onBrightnessChange={setEmbroideryBrightness}
          onContrastChange={setEmbroideryContrast}
          onSaturationChange={setEmbroiderySaturation}
          onSharpnessChange={setEmbroiderySharpness}
          onBlurChange={setEmbroideryBlur}
          onGrayscaleChange={setEmbroideryGrayscale}
          onSepiaChange={setEmbroiderySepia}
          onHueRotateChange={setEmbroideryHueRotate}
        />

        <EmbroideryActionsPanel
          isOpen={isEmbroideryActionsOpen}
          closeButtonRef={embroideryActionsCloseRef}
          hasEmbroideryImage={Boolean(embroideryPreviewUrl)}
          isComparing={isEmbroideryComparing}
          onClose={closeEmbroideryActions}
          onReset={resetEmbroideryFilters}
          onCompareStart={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsEmbroideryComparing(true);
          }}
          onCompareStop={stopEmbroideryComparing}
          onCompareKeyChange={setIsEmbroideryComparing}
        />

        <SmartEditFiltersPanel
          isOpen={isSmartEditFiltersOpen}
          closeButtonRef={smartEditFiltersCloseRef}
          brightness={smartEditBrightness}
          contrast={smartEditContrast}
          saturation={smartEditSaturation}
          sharpness={smartEditSharpness}
          blur={smartEditBlur}
          grayscale={smartEditGrayscale}
          sepia={smartEditSepia}
          hueRotate={smartEditHueRotate}
          onClose={closeSmartEditFilters}
          onBrightnessChange={setSmartEditBrightness}
          onContrastChange={setSmartEditContrast}
          onSaturationChange={setSmartEditSaturation}
          onSharpnessChange={setSmartEditSharpness}
          onBlurChange={setSmartEditBlur}
          onGrayscaleChange={setSmartEditGrayscale}
          onSepiaChange={setSmartEditSepia}
          onHueRotateChange={setSmartEditHueRotate}
        />

        <SmartEditActionsPanel
          isOpen={isSmartEditActionsOpen}
          closeButtonRef={smartEditActionsCloseRef}
          hasSmartEditImage={Boolean(smartEditPreviewUrl)}
          isComparing={isSmartEditComparing}
          onClose={closeSmartEditActions}
          onReset={resetSmartEditFilters}
          onCompareStart={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setIsSmartEditComparing(true);
          }}
          onCompareStop={stopSmartEditComparing}
          onCompareKeyChange={setIsSmartEditComparing}
        />
      </div>

      {!isSmartEditOpen && <button
        ref={smartEditToolsToggleRef}
        type="button"
        className="echoSmartEditMainToolButton echoStudioSmartEditLauncher"
        aria-expanded="false"
        aria-controls="echo-smart-edit-chat"
        onClick={toggleSmartEditTools}
      >
        <Sparkles size={20} aria-hidden="true" />
        <span>التعديل الذكي</span>
      </button>}
      </div>

      <div className="echoImageStudio__floatingLayer" aria-label="لوحات الاستوديو العائمة">
      {isSmartEditOpen && <FloatingStudioPanel
        panelId="echo-smart-edit-panel"
        title="التعديل الذكي"
        icon={<Sparkles size={17} aria-hidden="true" />}
        boundaryRef={studioWindowRef}
        storageKey="dekokraft.studio.smartEditPanel.v2"
        initialSize={{ width: 390, height: 600 }}
        initialSide="right"
        minWidth={280}
        minHeight={220}
        maxWidthRatio={0.7}
        maxHeightRatio={0.85}
        onClose={() => {
          selectTool(null);
          window.requestAnimationFrame(() => smartEditToolsToggleRef.current?.focus());
        }}
        className="echoStudioSmartPanel"
      >
        <div className="echoStudioSmartPanel__content">
          {(
            <SmartEditEngine
              key={activeProductMemory?.memoryId ?? "empty-product-memory"}
              product={{
                id: activeProductMemory?.productId ?? activeProductMemory?.memoryId ?? "",
                name: activeProductMemory?.sourceImageName ?? fileName,
                productDNA: activeProductMemory?.productDNA ?? null,
                originalUploadedImage,
                currentPreviewImage,
                generatedResultImage,
                productMemoryImage,
                originalImageUrl: originalPreviewUrl,
              }}
              activeProductMemory={activeProductMemory}
              participantId={launchContext?.participantId}
              sellerId={launchContext?.sellerId}
              onProductMemoryChange={setActiveProductMemory}
              onRequestUpload={() => fileInputRef.current?.click()}
              onSelectProduct={selectPlatformProduct}
              boundaryRef={studioWindowRef}
              onPreviewChange={(imageUrl, source) => {
                setGeneratedResultImage(source === "generated" ? imageUrl : null);
                setActiveImageSource((current) => current ? { ...current, previewUrl: imageUrl } : current);
              }}
              onClose={() => {
                selectTool(null);
                window.requestAnimationFrame(() => smartEditToolsToggleRef.current?.focus());
              }}
            />
          )}
        </div>
      </FloatingStudioPanel>}

      <FloatingImageToolPanel
        isOpen={isFiltersOpen || isActionsOpen}
        mode={isActionsOpen ? "actions" : "filters"}
        boundaryRef={studioWindowRef}
        closeButtonRef={isActionsOpen ? actionsCloseRef : filtersCloseRef}
        hasImage={Boolean(previewUrl)}
        isComparing={isComparing}
        brightness={brightness}
        contrast={contrast}
        saturation={saturation}
        sharpness={sharpness}
        blur={blur}
        grayscale={grayscale}
        sepia={sepia}
        hueRotate={hueRotate}
        onClose={isActionsOpen ? closeActions : closeFilters}
        onReset={resetFilters}
        onCompareStart={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsComparing(true);
        }}
        onCompareStop={stopComparing}
        onCompareKeyChange={setIsComparing}
        onBrightnessChange={setBrightness}
        onContrastChange={setContrast}
        onSaturationChange={setSaturation}
        onSharpnessChange={setSharpness}
        onBlurChange={setBlur}
        onGrayscaleChange={setGrayscale}
        onSepiaChange={setSepia}
        onHueRotateChange={setHueRotate}
      />
      </div>

    </div>
  );
}

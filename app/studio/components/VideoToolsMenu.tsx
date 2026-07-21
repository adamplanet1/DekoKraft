"use client";

import { Copy, Download, FileImage, Film, LoaderCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

export type VideoExportFormat = "png" | "webp" | "gif" | "copy";

type VideoToolsMenuProps = {
  isOpen: boolean;
  hasVideo: boolean;
  isFiltersOpen: boolean;
  isActionsOpen: boolean;
  exportingFormat: VideoExportFormat | null;
  onOpenFilters: () => void;
  onOpenActions: () => void;
  onExportPng: () => void;
  onExportWebp: () => void;
  onCopyVideo: () => void;
};

const gifExportSupported = false;

export default function VideoToolsMenu({ isOpen, hasVideo, isFiltersOpen, isActionsOpen, exportingFormat, onOpenFilters, onOpenActions, onExportPng, onExportWebp, onCopyVideo }: VideoToolsMenuProps) {
  const { direction, t } = useLanguage();
  if (!isOpen) return null;
  const isBusy = exportingFormat !== null;
  return (
    <div id="echo-video-tools-menu" className="echoVideoToolsMenu" dir={direction}>
      <section className="echoVideoToolsMenu__section" aria-labelledby="echo-video-edit-tools-title">
        <h3 id="echo-video-edit-tools-title">{t("studio.video.editTools")}</h3>
        <button type="button" className="echoVideoToolsMenu__item" aria-pressed={isFiltersOpen} onClick={onOpenFilters}><SlidersHorizontal size={19} aria-hidden="true" /><span>{t("studio.video.filters")}</span></button>
        <button type="button" className="echoVideoToolsMenu__item" aria-pressed={isActionsOpen} onClick={onOpenActions}><Sparkles size={19} aria-hidden="true" /><span>{t("studio.video.actions")}</span></button>
      </section>
      <section className="echoVideoToolsMenu__section echoVideoToolsMenu__section--export" aria-labelledby="echo-video-export-tools-title">
        <h3 id="echo-video-export-tools-title">{t("studio.video.exportTools")}</h3>
        <button type="button" className="echoVideoToolsMenu__item echoVideoToolsMenu__item--png" disabled={!hasVideo || isBusy} onClick={onExportPng}>{exportingFormat === "png" ? <LoaderCircle className="echoVideoToolsMenu__spinner" size={19} aria-hidden="true" /> : <Download size={19} aria-hidden="true" />}<span>{t("studio.video.exportPng")}</span></button>
        <button type="button" className="echoVideoToolsMenu__item echoVideoToolsMenu__item--webp" disabled={!hasVideo || isBusy} onClick={onExportWebp}>{exportingFormat === "webp" ? <LoaderCircle className="echoVideoToolsMenu__spinner" size={19} aria-hidden="true" /> : <FileImage size={19} aria-hidden="true" />}<span>{t("studio.video.exportWebp")}</span></button>
        <button type="button" className="echoVideoToolsMenu__item echoVideoToolsMenu__item--gif" disabled={!gifExportSupported} title={t("studio.video.gifPending")}><Film size={19} aria-hidden="true" /><span>{t("studio.video.exportGif")}</span><small>{t("studio.echo.status.soon")}</small></button>
        <button type="button" className="echoVideoToolsMenu__item echoVideoToolsMenu__item--copy" disabled={!hasVideo || isBusy} onClick={onCopyVideo}>{exportingFormat === "copy" ? <LoaderCircle className="echoVideoToolsMenu__spinner" size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}<span>{t("studio.video.copyImage")}</span></button>
        {!gifExportSupported && <p className="echoVideoToolsMenu__pending">{t("studio.video.gifPending")}</p>}
      </section>
    </div>
  );
}

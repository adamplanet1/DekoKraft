"use client";

import { Copy, Download, FileImage, Film, LoaderCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

export type EmbroideryExportFormat = "png" | "webp" | "gif" | "copy";

type EmbroideryToolsMenuProps = {
  isOpen: boolean;
  hasEmbroideryImage: boolean;
  isFiltersOpen: boolean;
  isActionsOpen: boolean;
  exportingFormat: EmbroideryExportFormat | null;
  onOpenFilters: () => void;
  onOpenActions: () => void;
  onExportPng: () => void;
  onExportWebp: () => void;
  onCopyEmbroideryImage: () => void;
};

const embroideryGifExportSupported = false;

export default function EmbroideryToolsMenu({ isOpen, hasEmbroideryImage, isFiltersOpen, isActionsOpen, exportingFormat, onOpenFilters, onOpenActions, onExportPng, onExportWebp, onCopyEmbroideryImage }: EmbroideryToolsMenuProps) {
  const { direction, t } = useLanguage();
  if (!isOpen) return null;
  const isBusy = exportingFormat !== null;
  return (
    <div id="echo-embroidery-tools-menu" className="echoEmbroideryToolsMenu" dir={direction}>
      <section className="echoEmbroideryToolsMenu__section" aria-labelledby="echo-embroidery-edit-tools-title">
        <h3 id="echo-embroidery-edit-tools-title">{t("studio.embroideryProcessing.editTools")}</h3>
        <button type="button" className="echoEmbroideryToolsMenu__item" aria-pressed={isFiltersOpen} onClick={onOpenFilters}><SlidersHorizontal size={19} aria-hidden="true" /><span>{t("studio.embroideryProcessing.filters")}</span></button>
        <button type="button" className="echoEmbroideryToolsMenu__item" aria-pressed={isActionsOpen} onClick={onOpenActions}><Sparkles size={19} aria-hidden="true" /><span>{t("studio.embroideryProcessing.actions")}</span></button>
      </section>
      <section className="echoEmbroideryToolsMenu__section echoEmbroideryToolsMenu__section--export" aria-labelledby="echo-embroidery-export-tools-title">
        <h3 id="echo-embroidery-export-tools-title">{t("studio.embroideryProcessing.exportTools")}</h3>
        <button type="button" className="echoEmbroideryToolsMenu__item echoEmbroideryToolsMenu__item--png" disabled={!hasEmbroideryImage || isBusy} onClick={onExportPng}>{exportingFormat === "png" ? <LoaderCircle className="echoEmbroideryToolsMenu__spinner" size={19} aria-hidden="true" /> : <Download size={19} aria-hidden="true" />}<span>{t("studio.embroideryProcessing.exportPng")}</span></button>
        <button type="button" className="echoEmbroideryToolsMenu__item echoEmbroideryToolsMenu__item--webp" disabled={!hasEmbroideryImage || isBusy} onClick={onExportWebp}>{exportingFormat === "webp" ? <LoaderCircle className="echoEmbroideryToolsMenu__spinner" size={19} aria-hidden="true" /> : <FileImage size={19} aria-hidden="true" />}<span>{t("studio.embroideryProcessing.exportWebp")}</span></button>
        <button type="button" className="echoEmbroideryToolsMenu__item echoEmbroideryToolsMenu__item--gif" disabled={!embroideryGifExportSupported} title={t("studio.embroideryProcessing.gifPending")}><Film size={19} aria-hidden="true" /><span>{t("studio.embroideryProcessing.exportGif")}</span><small>{t("studio.echo.status.soon")}</small></button>
        <button type="button" className="echoEmbroideryToolsMenu__item echoEmbroideryToolsMenu__item--copy" disabled={!hasEmbroideryImage || isBusy} onClick={onCopyEmbroideryImage}>{exportingFormat === "copy" ? <LoaderCircle className="echoEmbroideryToolsMenu__spinner" size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}<span>{t("studio.embroideryProcessing.copyImage")}</span></button>
        {!embroideryGifExportSupported && <p className="echoEmbroideryToolsMenu__pending">{t("studio.embroideryProcessing.gifPending")}</p>}
      </section>
    </div>
  );
}

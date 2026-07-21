"use client";

import { Copy, Download, FileImage, Film, LoaderCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

export type ThreeDImageExportFormat = "png" | "webp" | "gif" | "copy";

type ThreeDImageToolsMenuProps = {
  isOpen: boolean;
  hasThreeDImage: boolean;
  isFiltersOpen: boolean;
  isActionsOpen: boolean;
  exportingFormat: ThreeDImageExportFormat | null;
  onOpenFilters: () => void;
  onOpenActions: () => void;
  onExportPng: () => void;
  onExportWebp: () => void;
  onCopyThreeDImage: () => void;
};

const threeDImageGifExportSupported = false;

export default function ThreeDImageToolsMenu({ isOpen, hasThreeDImage, isFiltersOpen, isActionsOpen, exportingFormat, onOpenFilters, onOpenActions, onExportPng, onExportWebp, onCopyThreeDImage }: ThreeDImageToolsMenuProps) {
  const { direction, t } = useLanguage();
  if (!isOpen) return null;
  const isBusy = exportingFormat !== null;
  return (
    <div id="echo-three-d-image-tools-menu" className="echoThreeDImageToolsMenu" dir={direction}>
      <section className="echoThreeDImageToolsMenu__section" aria-labelledby="echo-three-d-image-edit-tools-title">
        <h3 id="echo-three-d-image-edit-tools-title">{t("studio.threeDImage.editTools")}</h3>
        <button type="button" className="echoThreeDImageToolsMenu__item" aria-pressed={isFiltersOpen} onClick={onOpenFilters}><SlidersHorizontal size={19} aria-hidden="true" /><span>{t("studio.threeDImage.filters")}</span></button>
        <button type="button" className="echoThreeDImageToolsMenu__item" aria-pressed={isActionsOpen} onClick={onOpenActions}><Sparkles size={19} aria-hidden="true" /><span>{t("studio.threeDImage.actions")}</span></button>
      </section>
      <section className="echoThreeDImageToolsMenu__section echoThreeDImageToolsMenu__section--export" aria-labelledby="echo-three-d-image-export-tools-title">
        <h3 id="echo-three-d-image-export-tools-title">{t("studio.threeDImage.exportTools")}</h3>
        <button type="button" className="echoThreeDImageToolsMenu__item echoThreeDImageToolsMenu__item--png" disabled={!hasThreeDImage || isBusy} onClick={onExportPng}>{exportingFormat === "png" ? <LoaderCircle className="echoThreeDImageToolsMenu__spinner" size={19} aria-hidden="true" /> : <Download size={19} aria-hidden="true" />}<span>{t("studio.threeDImage.exportPng")}</span></button>
        <button type="button" className="echoThreeDImageToolsMenu__item echoThreeDImageToolsMenu__item--webp" disabled={!hasThreeDImage || isBusy} onClick={onExportWebp}>{exportingFormat === "webp" ? <LoaderCircle className="echoThreeDImageToolsMenu__spinner" size={19} aria-hidden="true" /> : <FileImage size={19} aria-hidden="true" />}<span>{t("studio.threeDImage.exportWebp")}</span></button>
        <button type="button" className="echoThreeDImageToolsMenu__item echoThreeDImageToolsMenu__item--gif" disabled={!threeDImageGifExportSupported} title={t("studio.threeDImage.gifPending")}><Film size={19} aria-hidden="true" /><span>{t("studio.threeDImage.exportGif")}</span><small>{t("studio.echo.status.soon")}</small></button>
        <button type="button" className="echoThreeDImageToolsMenu__item echoThreeDImageToolsMenu__item--copy" disabled={!hasThreeDImage || isBusy} onClick={onCopyThreeDImage}>{exportingFormat === "copy" ? <LoaderCircle className="echoThreeDImageToolsMenu__spinner" size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}<span>{t("studio.threeDImage.copyImage")}</span></button>
        {!threeDImageGifExportSupported && <p className="echoThreeDImageToolsMenu__pending">{t("studio.threeDImage.gifPending")}</p>}
      </section>
    </div>
  );
}

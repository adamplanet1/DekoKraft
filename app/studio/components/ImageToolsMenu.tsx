"use client";

import { Copy, Download, FileImage, Film, LoaderCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

export type ImageExportFormat = "png" | "webp" | "gif" | "copy";

type ImageToolsMenuProps = {
  isOpen: boolean;
  hasImage: boolean;
  isFiltersOpen: boolean;
  isActionsOpen: boolean;
  exportingFormat: ImageExportFormat | null;
  onOpenFilters: () => void;
  onOpenActions: () => void;
  onExportPng: () => void;
  onExportWebp: () => void;
  onCopyImage: () => void;
};

const gifExportSupported = false;

export default function ImageToolsMenu({
  isOpen,
  hasImage,
  isFiltersOpen,
  isActionsOpen,
  exportingFormat,
  onOpenFilters,
  onOpenActions,
  onExportPng,
  onExportWebp,
  onCopyImage,
}: ImageToolsMenuProps) {
  const { direction, t } = useLanguage();
  if (!isOpen) return null;

  const isBusy = exportingFormat !== null;

  return (
    <div id="echo-image-tools-menu" className="echoImageToolsMenu" dir={direction}>
      <section className="echoImageToolsMenu__section" aria-labelledby="echo-image-edit-tools-title">
        <h3 id="echo-image-edit-tools-title">{t("studio.image.editTools")}</h3>
        <button
          type="button"
          className="echoImageToolsMenu__item"
          aria-pressed={isFiltersOpen}
          onClick={onOpenFilters}
        >
          <SlidersHorizontal size={19} aria-hidden="true" />
          <span>{t("studio.image.filters")}</span>
        </button>
        <button
          type="button"
          className="echoImageToolsMenu__item"
          aria-pressed={isActionsOpen}
          onClick={onOpenActions}
        >
          <Sparkles size={19} aria-hidden="true" />
          <span>{t("studio.image.actions")}</span>
        </button>
      </section>

      <section className="echoImageToolsMenu__section echoImageToolsMenu__section--export" aria-labelledby="echo-image-export-tools-title">
        <h3 id="echo-image-export-tools-title">{t("studio.image.exportTools")}</h3>
        <button
          type="button"
          className="echoImageToolsMenu__item echoImageToolsMenu__item--png"
          disabled={!hasImage || isBusy}
          onClick={onExportPng}
        >
          {exportingFormat === "png" ? <LoaderCircle className="echoImageToolsMenu__spinner" size={19} aria-hidden="true" /> : <Download size={19} aria-hidden="true" />}
          <span>{t("studio.image.exportPng")}</span>
        </button>
        <button
          type="button"
          className="echoImageToolsMenu__item echoImageToolsMenu__item--webp"
          disabled={!hasImage || isBusy}
          onClick={onExportWebp}
        >
          {exportingFormat === "webp" ? <LoaderCircle className="echoImageToolsMenu__spinner" size={19} aria-hidden="true" /> : <FileImage size={19} aria-hidden="true" />}
          <span>{t("studio.image.exportWebp")}</span>
        </button>
        <button
          type="button"
          className="echoImageToolsMenu__item echoImageToolsMenu__item--gif"
          disabled={!gifExportSupported}
          title={t("studio.image.gifPending")}
        >
          <Film size={19} aria-hidden="true" />
          <span>{t("studio.image.exportGif")}</span>
          <small>{t("studio.echo.status.soon")}</small>
        </button>
        <button
          type="button"
          className="echoImageToolsMenu__item echoImageToolsMenu__item--copy"
          disabled={!hasImage || isBusy}
          onClick={onCopyImage}
        >
          {exportingFormat === "copy" ? <LoaderCircle className="echoImageToolsMenu__spinner" size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}
          <span>{t("studio.image.copyImage")}</span>
        </button>
        {!gifExportSupported && <p className="echoImageToolsMenu__pending">{t("studio.image.gifPending")}</p>}
      </section>
    </div>
  );
}

"use client";

import { Copy, Download, FileImage, Film, LoaderCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

export type SmartEditExportFormat = "png" | "webp" | "gif" | "copy";

type SmartEditToolsMenuProps = {
  isOpen: boolean;
  hasSmartEditImage: boolean;
  isFiltersOpen: boolean;
  isActionsOpen: boolean;
  exportingFormat: SmartEditExportFormat | null;
  onOpenFilters: () => void;
  onOpenActions: () => void;
  onExportPng: () => void;
  onExportWebp: () => void;
  onCopySmartEditImage: () => void;
};

const smartEditGifExportSupported = false;

export default function SmartEditToolsMenu({ isOpen, hasSmartEditImage, isFiltersOpen, isActionsOpen, exportingFormat, onOpenFilters, onOpenActions, onExportPng, onExportWebp, onCopySmartEditImage }: SmartEditToolsMenuProps) {
  const { direction, t } = useLanguage();
  if (!isOpen) return null;
  const isBusy = exportingFormat !== null;
  return (
    <div id="echo-smart-edit-tools-menu" className="echoSmartEditToolsMenu" dir={direction}>
      <section className="echoSmartEditToolsMenu__section" aria-labelledby="echo-smart-edit-edit-tools-title">
        <h3 id="echo-smart-edit-edit-tools-title">{t("studio.smartEditProcessing.editTools")}</h3>
        <button type="button" className="echoSmartEditToolsMenu__item" aria-pressed={isFiltersOpen} onClick={onOpenFilters}><SlidersHorizontal size={19} aria-hidden="true" /><span>{t("studio.smartEditProcessing.filters")}</span></button>
        <button type="button" className="echoSmartEditToolsMenu__item" aria-pressed={isActionsOpen} onClick={onOpenActions}><Sparkles size={19} aria-hidden="true" /><span>{t("studio.smartEditProcessing.actions")}</span></button>
      </section>
      <section className="echoSmartEditToolsMenu__section echoSmartEditToolsMenu__section--export" aria-labelledby="echo-smart-edit-export-tools-title">
        <h3 id="echo-smart-edit-export-tools-title">{t("studio.smartEditProcessing.exportTools")}</h3>
        <button type="button" className="echoSmartEditToolsMenu__item echoSmartEditToolsMenu__item--png" disabled={!hasSmartEditImage || isBusy} onClick={onExportPng}>{exportingFormat === "png" ? <LoaderCircle className="echoSmartEditToolsMenu__spinner" size={19} aria-hidden="true" /> : <Download size={19} aria-hidden="true" />}<span>{t("studio.smartEditProcessing.exportPng")}</span></button>
        <button type="button" className="echoSmartEditToolsMenu__item echoSmartEditToolsMenu__item--webp" disabled={!hasSmartEditImage || isBusy} onClick={onExportWebp}>{exportingFormat === "webp" ? <LoaderCircle className="echoSmartEditToolsMenu__spinner" size={19} aria-hidden="true" /> : <FileImage size={19} aria-hidden="true" />}<span>{t("studio.smartEditProcessing.exportWebp")}</span></button>
        <button type="button" className="echoSmartEditToolsMenu__item echoSmartEditToolsMenu__item--gif" disabled={!smartEditGifExportSupported} title={t("studio.smartEditProcessing.gifPending")}><Film size={19} aria-hidden="true" /><span>{t("studio.smartEditProcessing.exportGif")}</span><small>{t("studio.echo.status.soon")}</small></button>
        <button type="button" className="echoSmartEditToolsMenu__item echoSmartEditToolsMenu__item--copy" disabled={!hasSmartEditImage || isBusy} onClick={onCopySmartEditImage}>{exportingFormat === "copy" ? <LoaderCircle className="echoSmartEditToolsMenu__spinner" size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}<span>{t("studio.smartEditProcessing.copyImage")}</span></button>
        {!smartEditGifExportSupported && <p className="echoSmartEditToolsMenu__pending">{t("studio.smartEditProcessing.gifPending")}</p>}
      </section>
    </div>
  );
}

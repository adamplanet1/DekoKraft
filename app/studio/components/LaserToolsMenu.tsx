"use client";

import { Copy, Download, FileImage, Film, LoaderCircle, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

export type LaserExportFormat = "png" | "webp" | "gif" | "copy";

type LaserToolsMenuProps = {
  isOpen: boolean;
  hasLaserImage: boolean;
  isFiltersOpen: boolean;
  isActionsOpen: boolean;
  exportingFormat: LaserExportFormat | null;
  onOpenFilters: () => void;
  onOpenActions: () => void;
  onExportPng: () => void;
  onExportWebp: () => void;
  onCopyLaserImage: () => void;
};

const laserGifExportSupported = false;

export default function LaserToolsMenu({ isOpen, hasLaserImage, isFiltersOpen, isActionsOpen, exportingFormat, onOpenFilters, onOpenActions, onExportPng, onExportWebp, onCopyLaserImage }: LaserToolsMenuProps) {
  const { direction, t } = useLanguage();
  if (!isOpen) return null;
  const isBusy = exportingFormat !== null;
  return (
    <div id="echo-laser-tools-menu" className="echoLaserToolsMenu" dir={direction}>
      <section className="echoLaserToolsMenu__section" aria-labelledby="echo-laser-edit-tools-title">
        <h3 id="echo-laser-edit-tools-title">{t("studio.laserProcessing.editTools")}</h3>
        <button type="button" className="echoLaserToolsMenu__item" aria-pressed={isFiltersOpen} onClick={onOpenFilters}><SlidersHorizontal size={19} aria-hidden="true" /><span>{t("studio.laserProcessing.filters")}</span></button>
        <button type="button" className="echoLaserToolsMenu__item" aria-pressed={isActionsOpen} onClick={onOpenActions}><Sparkles size={19} aria-hidden="true" /><span>{t("studio.laserProcessing.actions")}</span></button>
      </section>
      <section className="echoLaserToolsMenu__section echoLaserToolsMenu__section--export" aria-labelledby="echo-laser-export-tools-title">
        <h3 id="echo-laser-export-tools-title">{t("studio.laserProcessing.exportTools")}</h3>
        <button type="button" className="echoLaserToolsMenu__item echoLaserToolsMenu__item--png" disabled={!hasLaserImage || isBusy} onClick={onExportPng}>{exportingFormat === "png" ? <LoaderCircle className="echoLaserToolsMenu__spinner" size={19} aria-hidden="true" /> : <Download size={19} aria-hidden="true" />}<span>{t("studio.laserProcessing.exportPng")}</span></button>
        <button type="button" className="echoLaserToolsMenu__item echoLaserToolsMenu__item--webp" disabled={!hasLaserImage || isBusy} onClick={onExportWebp}>{exportingFormat === "webp" ? <LoaderCircle className="echoLaserToolsMenu__spinner" size={19} aria-hidden="true" /> : <FileImage size={19} aria-hidden="true" />}<span>{t("studio.laserProcessing.exportWebp")}</span></button>
        <button type="button" className="echoLaserToolsMenu__item echoLaserToolsMenu__item--gif" disabled={!laserGifExportSupported} title={t("studio.laserProcessing.gifPending")}><Film size={19} aria-hidden="true" /><span>{t("studio.laserProcessing.exportGif")}</span><small>{t("studio.echo.status.soon")}</small></button>
        <button type="button" className="echoLaserToolsMenu__item echoLaserToolsMenu__item--copy" disabled={!hasLaserImage || isBusy} onClick={onCopyLaserImage}>{exportingFormat === "copy" ? <LoaderCircle className="echoLaserToolsMenu__spinner" size={19} aria-hidden="true" /> : <Copy size={19} aria-hidden="true" />}<span>{t("studio.laserProcessing.copyImage")}</span></button>
        {!laserGifExportSupported && <p className="echoLaserToolsMenu__pending">{t("studio.laserProcessing.gifPending")}</p>}
      </section>
    </div>
  );
}

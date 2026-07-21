"use client";

import { Calculator, Eraser, ListMinus, Ruler, Sparkles, Square, Upload, Wrench } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type ThreeDToolsPanelProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onPlaceholderAction: () => void;
};

export default function ThreeDToolsPanel({ inputRef, disabled, onPlaceholderAction }: ThreeDToolsPanelProps) {
  const { t } = useLanguage();
  return (
    <aside className="threeDToolsPanel" aria-labelledby="three-d-tools-title">
      <h3 id="three-d-tools-title">{t("studio.threeDWorkspace.modelTools")}</h3>
      <button type="button" className="threeDToolsPanel__import" onClick={() => inputRef.current?.click()}><Upload size={18} aria-hidden="true" />{t("studio.threeDWorkspace.importModel")}</button>
      <button type="button" disabled={disabled} onClick={onPlaceholderAction}><Wrench size={18} aria-hidden="true" />{t("studio.threeDWorkspace.repairModel")}</button>
      <button type="button" disabled={disabled} onClick={onPlaceholderAction}><Eraser size={18} aria-hidden="true" />{t("studio.threeDWorkspace.removeHoles")}</button>
      <button type="button" disabled={disabled} onClick={onPlaceholderAction}><Sparkles size={18} aria-hidden="true" />{t("studio.threeDWorkspace.smoothSurface")}</button>
      <button type="button" disabled={disabled} onClick={onPlaceholderAction}><ListMinus size={18} aria-hidden="true" />{t("studio.threeDWorkspace.reducePolygons")}</button>
      <button type="button" disabled={disabled} onClick={onPlaceholderAction}><Square size={18} aria-hidden="true" />{t("studio.threeDWorkspace.createFlatBase")}</button>
      <button type="button" disabled={disabled} onClick={onPlaceholderAction}><Ruler size={18} aria-hidden="true" />{t("studio.threeDWorkspace.measureDimensions")}</button>
      <button type="button" disabled={disabled} onClick={onPlaceholderAction}><Calculator size={18} aria-hidden="true" />{t("studio.threeDWorkspace.calculateVolume")}</button>
    </aside>
  );
}

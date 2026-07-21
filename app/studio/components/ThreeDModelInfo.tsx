"use client";

import { Info } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";
import type { ModelMetrics } from "./threeDModelAnalysis";

type ThreeDModelInfoProps = {
  file: File | null;
  metrics: ModelMetrics;
};

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return megabytes >= 1 ? `${megabytes.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
}

function formatNumber(value: number | null, fallback: string) {
  return value === null ? fallback : new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(value);
}

export default function ThreeDModelInfo({ file, metrics }: ThreeDModelInfoProps) {
  const { t } = useLanguage();
  const unknown = t("studio.threeDWorkspace.unknown");
  const extension = file?.name.split(".").pop()?.toUpperCase();
  const dimensions = metrics.dimensions
    ? `${metrics.dimensions.x.toFixed(2)} × ${metrics.dimensions.y.toFixed(2)} × ${metrics.dimensions.z.toFixed(2)}`
    : unknown;

  return (
    <aside className="threeDModelInfo" aria-labelledby="three-d-model-info-title">
      <h3 id="three-d-model-info-title"><Info size={19} aria-hidden="true" />{t("studio.threeDWorkspace.modelInformation")}</h3>
      <dl>
        <div><dt>{t("studio.threeDWorkspace.fileName")}</dt><dd title={file?.name}>{file?.name || unknown}</dd></div>
        <div><dt>{t("studio.threeDWorkspace.fileType")}</dt><dd>{extension || unknown}</dd></div>
        <div><dt>{t("studio.threeDWorkspace.fileSize")}</dt><dd>{file ? formatFileSize(file.size) : unknown}</dd></div>
        <div><dt>{t("studio.threeDWorkspace.vertices")}</dt><dd>{formatNumber(metrics.vertices, unknown)}</dd></div>
        <div><dt>{t("studio.threeDWorkspace.polygons")}</dt><dd>{formatNumber(metrics.polygons, unknown)}</dd></div>
        <div><dt>{t("studio.threeDWorkspace.volume")}</dt><dd>{metrics.volume === null ? unknown : `${formatNumber(metrics.volume, unknown)}³`}</dd></div>
        <div><dt>{t("studio.threeDWorkspace.dimensions")}</dt><dd>{dimensions}</dd></div>
      </dl>
    </aside>
  );
}

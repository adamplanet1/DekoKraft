"use client";

import { useEffect, useState } from "react";
import type { DekoBrainAdvisorCopy } from "../../config/dekoBrainAdvisorTranslations";
import { convertImageToWebP } from "../../lib/dekobrain/webpConverter";
import type { AnalyzedMediaItem, WebPConversionResult } from "../../types/dekobrain";

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function WebPConversionPanel({ copy, item, sourceFile, isSourceApproved, disabledReason, onConverted, onUseConverted }: {
  copy: DekoBrainAdvisorCopy;
  item: AnalyzedMediaItem;
  sourceFile?: File;
  isSourceApproved: boolean;
  disabledReason: string;
  onConverted: (result: WebPConversionResult) => void;
  onUseConverted: (file: File) => Promise<void>;
}) {
  const quality = item.preferredWebPQuality;
  const [result, setResult] = useState<WebPConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (result) URL.revokeObjectURL(result.previewUrl);
  }, [result]);

  useEffect(() => {
    setResult((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    setError("");
  }, [item.id]);

  async function convert() {
    setIsConverting(true);
    setError("");
    try {
      const nextResult = await convertImageToWebP(sourceFile ?? item.originalFile, quality);
      setResult((current) => {
        if (current) URL.revokeObjectURL(current.previewUrl);
        return nextResult;
      });
      onConverted(nextResult);
    } catch (conversionError) {
      setError(conversionError instanceof Error && conversionError.message === "animated-gif-unsupported" ? copy.gifWarning : copy.conversionError);
    } finally {
      setIsConverting(false);
    }
  }

  async function useConverted() {
    if (!result) return;
    await onUseConverted(result.file);
    URL.revokeObjectURL(result.previewUrl);
    setResult(null);
  }

  return (
    <section className="dkBrainPanel dkBrainConversionPanel" id="dkbrain-webp-conversion">
      <div className="dkBrainSectionHeading"><div><span>09</span><h2>{copy.conversionTitle}</h2></div></div>
      <label className="dkBrainQualityControl">
        <span>{copy.quality}: <strong>{quality}</strong></span>
        <input type="range" min="60" max="95" value={quality} onChange={(event) => onConverted({ file: sourceFile??item.originalFile, previewUrl: "", originalSizeBytes: item.fileSizeBytes, convertedSizeBytes: item.convertedSizeBytes ?? 0, percentageSaved: 0, width: item.width, height: item.height, quality: Number(event.target.value) })} />
      </label>
      {item.mimeType === "image/gif" && <div className="dkBrainConversionWarning">⚠️ {copy.gifWarning}</div>}
      <button type="button" className="dkBrainPrimaryAction" disabled={!isSourceApproved||isConverting || item.mimeType === "image/gif"} title={!isSourceApproved?disabledReason:undefined} onClick={convert}>{isConverting ? copy.converting : copy.convert}</button>
      {error && <div className="dkBrainConversionWarning" role="alert">{error}</div>}
      {result ? (
        <>
          <dl className="dkBrainConversionStats">
            <div><dt>{copy.originalFormat}</dt><dd>{item.mimeType}</dd></div>
            <div><dt>{copy.outputFormat}</dt><dd>image/webp</dd></div>
            <div><dt>{copy.originalSize}</dt><dd>{formatBytes(result.originalSizeBytes)}</dd></div>
            <div><dt>{copy.convertedSize}</dt><dd>{formatBytes(result.convertedSizeBytes)}</dd></div>
            <div><dt>{copy.saved}</dt><dd>{result.percentageSaved}%</dd></div>
            <div><dt>{copy.outputDimensions}</dt><dd>{result.width} × {result.height}px</dd></div>
          </dl>
          <div className="dkBrainConversionActions">
            <a href={result.previewUrl} download={result.file.name}>{copy.download}</a>
            <button type="button" onClick={useConverted}>{copy.useConverted}</button>
          </div>
        </>
      ) : <p>{copy.noConversion}</p>}
    </section>
  );
}

import type { DekoBrainCopy } from "../../config/dekoBrainTranslations";
import type { AnalyzedMediaItem } from "../../types/dekobrain";

export default function MediaAnalysisPanel({ copy, item }: { copy: DekoBrainCopy; item: AnalyzedMediaItem }) {
  const transparency = item.hasTransparency === null
    ? copy.unknown
    : item.hasTransparency ? copy.yes : copy.no;
  const rows = [
    [copy.fields.filename, item.filename],
    [copy.fields.format, item.mimeType],
    [copy.fields.dimensions, `${item.width} × ${item.height}px`],
    [copy.fields.aspectRatio, `${item.aspectRatioLabel} (${item.aspectRatio.toFixed(2)})`],
    [copy.fields.orientation, copy.orientations[item.orientation]],
    [copy.fields.fileSize, item.fileSizeFormatted],
    [copy.fields.megapixels, `${item.megapixels} MP`],
    [copy.fields.transparency, transparency],
    [copy.fields.recommendedFit, copy.fits[item.recommendedFit]],
    [copy.fields.recommendedRatio, copy.ratios[item.recommendedCardRatio]],
    [copy.fields.responsiveWidths, item.recommendedResponsiveWidths.map((width) => `${width}px`).join(" · ")],
  ];

  return (
    <section className="dkBrainPanel dkBrainAnalysisPanel">
      <div className="dkBrainSectionHeading">
        <div><span>02</span><h2>{copy.analysis}</h2></div>
      </div>
      <dl className="dkBrainMetadataGrid">
        {rows.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <div className="dkBrainScoreCard dkUnifiedKpiCard" data-kpi-tone="blue">
        <div className="dkBrainScoreValue" aria-label={`${copy.fields.score}: ${item.technicalQualityScore}`}>{item.technicalQualityScore}</div>
        <div><strong>{copy.fields.score}</strong><p>{copy.scoreExplanation}</p></div>
      </div>
      <div className="dkBrainWarnings">
        <h3>{copy.fields.warnings}</h3>
        {item.qualityWarnings.length === 0 ? <p>✓ {copy.noWarnings}</p> : (
          <ul>{item.qualityWarnings.map((warning) => <li key={warning}>⚠️ {copy.warnings[warning]}</li>)}</ul>
        )}
      </div>
      <div className="dkBrainFutureNotice"><strong>{copy.fields.aiStatus}</strong><p>{copy.aiFuture}</p></div>
    </section>
  );
}

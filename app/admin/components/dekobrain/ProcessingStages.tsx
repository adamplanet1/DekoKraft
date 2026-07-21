import type { DekoBrainCopy } from "../../config/dekoBrainTranslations";
import type { DekoBrainAdvisorCopy } from "../../config/dekoBrainAdvisorTranslations";
import type { AnalyzedMediaItem, DekoBrainProcessingStage } from "../../types/dekobrain";

const statusIcons: Record<DekoBrainProcessingStage["status"], string> = {
  notStarted: "○", analyzing: "◌", ready: "✓", warning: "!", future: "◇", needsReview: "?", partial: "◐",
};

function createStages(item: AnalyzedMediaItem, copy: DekoBrainCopy, advisorCopy: DekoBrainAdvisorCopy): DekoBrainProcessingStage[] {
  const hasFileWarning = item.fileSizeBytes > 5 * 1024 * 1024;
  return [
    { id: 1, status: "ready", detail: copy.stageDetails.imported },
    { id: 2, status: hasFileWarning ? "warning" : "ready", detail: hasFileWarning ? copy.stageDetails.fileWarning : copy.stageDetails.safe },
    { id: 3, status: "partial", detail: advisorCopy.stageDetails.contentPartial },
    { id: 4, status: "ready", detail: advisorCopy.stageDetails.compatibilityReady },
    { id: 5, status: "ready", detail: copy.stageDetails.dimensionsReady },
    { id: 6, status: "ready", detail: copy.stageDetails.cropReady },
    { id: 7, status: item.transparentBackgroundApproved ? "ready" : "partial", detail: item.transparentBackgroundApproved ? advisorCopy.transparentApproved : item.backgroundProcessingStatus === "complex" ? advisorCopy.backgroundComplex : advisorCopy.stageDetails.backgroundPartial },
    { id: 8, status: item.imageState.composedImage?.approved ? "ready" : "partial", detail: item.imageState.composedImage?.approved ? copy.approvedMessage : copy.stageDetails.studioFuture },
    { id: 9, status: item.mimeType === "image/gif" ? "warning" : "ready", detail: item.mimeType === "image/gif" ? copy.stageDetails.conversionFuture : advisorCopy.stageDetails.conversionReady },
    { id: 10, status: "ready", detail: copy.stageDetails.responsiveReady },
    { id: 11, status: "ready", detail: item.imageState.composedImage?.approved ? advisorCopy.reasons.finalCompositionReady : advisorCopy.stageDetails.advisorReady },
  ];
}

export default function ProcessingStages({ copy, advisorCopy, item }: { copy: DekoBrainCopy; advisorCopy: DekoBrainAdvisorCopy; item: AnalyzedMediaItem }) {
  const statusLabel = (status: DekoBrainProcessingStage["status"]) => status === "partial" ? advisorCopy.stagePartial : copy.stageStatuses[status];
  return (
    <section className="dkBrainPanel dkBrainStagesPanel">
      <div className="dkBrainSectionHeading"><div><span>03</span><h2>{copy.stagesTitle}</h2></div></div>
      <div className="dkBrainStagesGrid">
        {createStages(item, copy, advisorCopy).map((stage) => (
          <article key={stage.id} className={`dkBrainStage ${stage.status}`}>
            <div className="dkBrainStageNumber">{String(stage.id).padStart(2, "0")}</div>
            <div>
              <h3>{copy.stageNames[stage.id - 1]}</h3>
              <span className="dkBrainStatusBadge"><b aria-hidden="true">{statusIcons[stage.status]}</b>{statusLabel(stage.status)}</span>
              <p>{stage.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

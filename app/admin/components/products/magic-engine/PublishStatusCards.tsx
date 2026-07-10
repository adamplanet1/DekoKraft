import { CardGrid, CardItem, SectionHeader } from "./ui";

type PreviewIcons = {
  blocked: string;
  passed: string;
  waiting: string;
  warning: string;
};

type PublishStatusCardsProps = {
  finalGateClosed: string;
  finalGateOpen: string;
  finalGateTitle: string;
  finalStampComplete: string;
  finalStampWaiting: string;
  isPublishReady: boolean;
  previewIcons: PreviewIcons;
  publishCelebration: string;
  publishDecisionTitle: string;
  publishNotReadyBadge: string;
  publishProduct: string;
  publishProductHelp: string;
  publishReadinessLabel: string;
  publishReadinessReason: string;
  publishReadyBadge: string;
  publishSafetyBlocked: string;
  publishSafetyCanPublish: string;
  publishSafetyTitle: string;
  publishWarningMessage: string;
  publishWarningTitle: string;
};

export function PublishStatusCards({
  finalGateClosed,
  finalGateOpen,
  finalGateTitle,
  finalStampComplete,
  finalStampWaiting,
  isPublishReady,
  previewIcons,
  publishCelebration,
  publishDecisionTitle,
  publishNotReadyBadge,
  publishProduct,
  publishProductHelp,
  publishReadinessLabel,
  publishReadinessReason,
  publishReadyBadge,
  publishSafetyBlocked,
  publishSafetyCanPublish,
  publishSafetyTitle,
  publishWarningMessage,
  publishWarningTitle,
}: PublishStatusCardsProps) {
  return (
    <>
      <SectionHeader title={publishDecisionTitle} />

      <CardGrid>
        <CardItem>
          <strong
            style={{
              display: "inline-flex",
              fontSize: "1.15rem",
              lineHeight: 1.2,
            }}
          >
            {isPublishReady ? publishReadyBadge : publishNotReadyBadge}
          </strong>
          <span>{isPublishReady ? previewIcons.passed : previewIcons.waiting}</span>
          <strong>{publishReadinessLabel}</strong>
          <p>{publishReadinessReason}</p>
        </CardItem>
      </CardGrid>

      {!isPublishReady && (
        <CardGrid>
          <CardItem>
            <strong>{publishWarningTitle}</strong>
            <span>{previewIcons.warning}</span>
            <p>{publishWarningMessage}</p>
          </CardItem>
        </CardGrid>
      )}

      <SectionHeader title={publishSafetyTitle} />

      <CardGrid>
        <CardItem>
          <span>{isPublishReady ? previewIcons.passed : previewIcons.blocked}</span>
          <p>{isPublishReady ? publishSafetyCanPublish : publishSafetyBlocked}</p>
          <button
            type="button"
            className="dkProductAnalyzeButton"
            disabled={!isPublishReady}
            onClick={() => undefined}
          >
            {publishProduct}
          </button>
          <p>{publishProductHelp}</p>
          <strong>{finalGateTitle}</strong>
          <p>{isPublishReady ? finalGateOpen : finalGateClosed}</p>
          <strong>
            {isPublishReady ? finalStampComplete : finalStampWaiting}
          </strong>
          {isPublishReady && <p>{publishCelebration}</p>}
        </CardItem>
      </CardGrid>
    </>
  );
}

import {
  woodenLaserBoxCustomerOffer,
  woodenLaserBoxDefaultConfiguration,
  woodenLaserBoxManufacturingPackage,
  woodenLaserBoxOrder,
  woodenLaserBoxPrice,
  woodenLaserBoxSample,
} from "./magicCreatorSamples";
import { isConfigurationComplete } from "./configurationEngine";
import { getDecisionStatus } from "./decisionEngine";
import {
  getMinimumPrice,
  getVisiblePrice,
} from "./pricingEngine";
import {
  getCurrentWizardStep,
  getNextWizardStep,
  getPreviousWizardStep,
  isWizardStepAvailable,
  isWizardStepCompleted,
  isWizardStepLocked,
  magicCreatorWizardSteps,
} from "./wizardEngine";
import { magicEngineTranslations, type Lang } from "../../../config/translations";

// First data binding layer between the UI and the Magic Creator reference model.
// This component reads reference data only and never mutates the source objects.
function fillTemplate(
  template: string,
  values: Record<string, string | number | undefined>
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

// This component defines the visual journey for Magic Creator v1 only.
export function MagicCreatorSkeleton({ lang }: { lang: Lang }) {
  const text = magicEngineTranslations[lang].creator;
  const dimensions = `${woodenLaserBoxDefaultConfiguration.selectedOptions.width} x ${woodenLaserBoxDefaultConfiguration.selectedOptions.height} x ${woodenLaserBoxDefaultConfiguration.selectedOptions.depth} ${woodenLaserBoxDefaultConfiguration.selectedOptions.unit}`;
  const magicCreatorStepDescriptions: Record<string, string> = {
    "choose-sample": fillTemplate(text.stepDescriptions["choose-sample"], { sample: woodenLaserBoxSample.name }),
    configuration: fillTemplate(text.stepDescriptions.configuration, { dimensions, material: woodenLaserBoxDefaultConfiguration.materialKind, quantity: woodenLaserBoxDefaultConfiguration.quantity }),
    decoration: text.stepDescriptions.decoration,
    preview: text.stepDescriptions.preview,
    price: fillTemplate(text.stepDescriptions.price, { price: woodenLaserBoxPrice.visibleTotal, currency: woodenLaserBoxPrice.currency }),
    "customer-offer": fillTemplate(text.stepDescriptions["customer-offer"], { status: woodenLaserBoxCustomerOffer.status }),
    production: fillTemplate(text.stepDescriptions.production, { status: woodenLaserBoxManufacturingPackage.status }),
    "confirm-order": fillTemplate(text.stepDescriptions["confirm-order"], { status: woodenLaserBoxOrder.status }),
  };
  const currentStep = getCurrentWizardStep(magicCreatorWizardSteps);
  const nextStep = getNextWizardStep(magicCreatorWizardSteps, currentStep.id);
  const previousStep = getPreviousWizardStep(
    magicCreatorWizardSteps,
    currentStep.id
  );
  const configurationComplete = isConfigurationComplete(
    woodenLaserBoxDefaultConfiguration
  );
  const decisionStatus = getDecisionStatus(configurationComplete);
  const visiblePrice = getVisiblePrice(woodenLaserBoxPrice);
  const minimumPrice = getMinimumPrice(woodenLaserBoxPrice);
  const currentStepTitle =
    text.stepTitles[currentStep.id] ?? currentStep.title;
  const nextStepTitle = nextStep
    ? text.stepTitles[nextStep.id] ?? nextStep.title
    : text.none;
  const previousStepTitle = previousStep
    ? text.stepTitles[previousStep.id] ?? previousStep.title
    : text.none;
  const configurationSummaryText = fillTemplate(text.configurationSummaryTemplate, { count: Object.keys(woodenLaserBoxDefaultConfiguration.selectedOptions).length, material: woodenLaserBoxDefaultConfiguration.materialKind, decoration: woodenLaserBoxDefaultConfiguration.decorationKind, quantity: woodenLaserBoxDefaultConfiguration.quantity });
  const decisionStatusLabel =
    decisionStatus === "Ready"
      ? text.ready
      : decisionStatus === "Blocked"
        ? text.blocked
        : text.waiting;
  const decisionSummaryText = configurationComplete
    ? text.configurationReady
    : text.configurationBlocked;
  const pricingSummaryText = fillTemplate(text.pricingSummaryTemplate, { visible: visiblePrice, minimum: minimumPrice, currency: woodenLaserBoxPrice.currency });

  return (
    <section
      style={{
        display: "grid",
        gap: "16px",
      }}
    >
      <div
        style={{
          border: "1px solid #d7dde8",
          borderRadius: "8px",
          padding: "12px 16px",
          background: "#f8fafc",
          color: "#334155",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>{text.current}:</strong> {currentStepTitle}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{text.previous}:</strong> {previousStepTitle}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{text.next}:</strong> {nextStepTitle}
        </p>
      </div>

      <div
        style={{
          border: "1px solid #d7dde8",
          borderRadius: "8px",
          padding: "12px 16px",
          background: "#f8fafc",
          color: "#334155",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>{text.configurationSummary}:</strong> {configurationSummaryText}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{text.complete}:</strong> {configurationComplete ? text.yes : text.no}
        </p>
      </div>

      <div
        style={{
          border: "1px solid #d7dde8",
          borderRadius: "8px",
          padding: "12px 16px",
          background: "#f8fafc",
          color: "#334155",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "15px",
            lineHeight: 1.3,
          }}
        >
          {text.decision}
        </h3>
        <p style={{ margin: 0 }}>
          <strong>{text.status}:</strong> {decisionStatusLabel}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{text.summary}:</strong> {decisionSummaryText}
        </p>
      </div>

      <div
        style={{
          border: "1px solid #d7dde8",
          borderRadius: "8px",
          padding: "12px 16px",
          background: "#f8fafc",
          color: "#334155",
          fontSize: "14px",
          lineHeight: 1.6,
        }}
      >
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: "15px",
            lineHeight: 1.3,
          }}
        >
          {text.pricing}
        </h3>
        <p style={{ margin: 0 }}>
          <strong>{text.visiblePrice}:</strong> {visiblePrice}{" "}
          {woodenLaserBoxPrice.currency}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{text.minimumPrice}:</strong> {minimumPrice}{" "}
          {woodenLaserBoxPrice.currency}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{text.summary}:</strong> {pricingSummaryText}
        </p>
      </div>

      {/* Wizard steps are now rendered from the Wizard Engine reference data. */}
      {magicCreatorWizardSteps.map((step) => {
        const statusLabel = isWizardStepAvailable(step)
          ? text.available
          : isWizardStepCompleted(step)
            ? text.completed
            : isWizardStepLocked(step)
              ? text.locked
              : step.status;
        const stepTitle = text.stepTitles[step.id] ?? step.title;

        return (
          <article
            key={step.id}
            style={{
              border: "1px solid #d7dde8",
              borderRadius: "8px",
              padding: "16px",
              background: "#ffffff",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "999px",
                background: "#eef4ff",
                color: "#1d4ed8",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {step.order}
            </span>
            <h3
              style={{
                margin: "12px 0 6px",
                fontSize: "16px",
                lineHeight: 1.3,
              }}
            >
              {stepTitle}
            </h3>
            <p
              style={{
                margin: 0,
                color: "#5f6b7a",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {magicCreatorStepDescriptions[step.id] ?? step.description}
            </p>
            <p
              style={{
                margin: "10px 0 0",
                color: "#334155",
                fontSize: "13px",
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {statusLabel}
            </p>
          </article>
        );
      })}
    </section>
  );
}

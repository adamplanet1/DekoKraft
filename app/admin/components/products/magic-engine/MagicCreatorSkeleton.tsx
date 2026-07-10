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

// First data binding layer between the UI and the Magic Creator reference model.
// This component reads reference data only and never mutates the source objects.
const magicCreatorStepDescriptions: Record<string, string> = {
  "choose-sample": `${woodenLaserBoxSample.name} هو نموذج البداية الحالي.`,
  configuration: `${woodenLaserBoxDefaultConfiguration.selectedOptions.width} x ${woodenLaserBoxDefaultConfiguration.selectedOptions.height} x ${woodenLaserBoxDefaultConfiguration.selectedOptions.depth} ${woodenLaserBoxDefaultConfiguration.selectedOptions.unit}، مادة ${woodenLaserBoxDefaultConfiguration.materialKind}، والكمية ${woodenLaserBoxDefaultConfiguration.quantity}.`,
  decoration: "الزخرفة مضبوطة كقيمة افتراضية بدون نص مخصص.",
  preview: "معاينة إنتاج العلبة الخشبية جاهزة كمسودة.",
  price: `السعر الظاهر هو ${woodenLaserBoxPrice.visibleTotal} ${woodenLaserBoxPrice.currency}.`,
  "customer-offer": `عرض العميل في حالة ${woodenLaserBoxCustomerOffer.status} ولم يتم إرسال عرض بعد.`,
  production: `حزمة التصنيع في حالة ${woodenLaserBoxManufacturingPackage.status} للورشة.`,
  "confirm-order": `الطلب في حالة ${woodenLaserBoxOrder.status} والدفع والإنتاج لم يبدآ بعد.`,
};

const magicCreatorStepTitles: Record<string, string> = {
  "choose-sample": "اختيار النموذج",
  configuration: "الإعدادات",
  decoration: "الزخرفة",
  preview: "المعاينة",
  price: "السعر",
  "customer-offer": "عرض العميل",
  production: "الإنتاج",
  "confirm-order": "تأكيد الطلب",
};

// This component defines the visual journey for Magic Creator v1 only.
export function MagicCreatorSkeleton() {
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
    magicCreatorStepTitles[currentStep.id] ?? currentStep.title;
  const nextStepTitle = nextStep
    ? magicCreatorStepTitles[nextStep.id] ?? nextStep.title
    : "لا يوجد";
  const previousStepTitle = previousStep
    ? magicCreatorStepTitles[previousStep.id] ?? previousStep.title
    : "لا يوجد";
  const configurationSummaryText = `${Object.keys(woodenLaserBoxDefaultConfiguration.selectedOptions).length} خيارات، مادة ${woodenLaserBoxDefaultConfiguration.materialKind}، زخرفة ${woodenLaserBoxDefaultConfiguration.decorationKind}، الكمية ${woodenLaserBoxDefaultConfiguration.quantity}.`;
  const decisionStatusLabel =
    decisionStatus === "Ready"
      ? "جاهز"
      : decisionStatus === "Blocked"
        ? "محجوب"
        : "بانتظار";
  const decisionSummaryText = configurationComplete
    ? "الإعدادات مكتملة وجاهزة للخطوة التالية."
    : "الإعدادات غير مكتملة، لذلك القرار محجوب.";
  const pricingSummaryText = `السعر الظاهر: ${visiblePrice} ${woodenLaserBoxPrice.currency}. الحد الأدنى: ${minimumPrice} ${woodenLaserBoxPrice.currency}.`;

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
          <strong>الحالي:</strong> {currentStepTitle}
        </p>
        <p style={{ margin: 0 }}>
          <strong>السابق:</strong> {previousStepTitle}
        </p>
        <p style={{ margin: 0 }}>
          <strong>التالي:</strong> {nextStepTitle}
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
          <strong>ملخص الإعدادات:</strong> {configurationSummaryText}
        </p>
        <p style={{ margin: 0 }}>
          <strong>مكتمل:</strong> {configurationComplete ? "نعم" : "لا"}
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
          القرار
        </h3>
        <p style={{ margin: 0 }}>
          <strong>الحالة:</strong> {decisionStatusLabel}
        </p>
        <p style={{ margin: 0 }}>
          <strong>الملخص:</strong> {decisionSummaryText}
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
          التسعير
        </h3>
        <p style={{ margin: 0 }}>
          <strong>السعر الظاهر:</strong> {visiblePrice}{" "}
          {woodenLaserBoxPrice.currency}
        </p>
        <p style={{ margin: 0 }}>
          <strong>الحد الأدنى:</strong> {minimumPrice}{" "}
          {woodenLaserBoxPrice.currency}
        </p>
        <p style={{ margin: 0 }}>
          <strong>الملخص:</strong> {pricingSummaryText}
        </p>
      </div>

      {/* Wizard steps are now rendered from the Wizard Engine reference data. */}
      {magicCreatorWizardSteps.map((step) => {
        const statusLabel = isWizardStepAvailable(step)
          ? "متاح"
          : isWizardStepCompleted(step)
            ? "مكتمل"
            : isWizardStepLocked(step)
              ? "مغلق"
              : step.status;
        const stepTitle = magicCreatorStepTitles[step.id] ?? step.title;

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

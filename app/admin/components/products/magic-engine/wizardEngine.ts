export type MagicCreatorStepStatus = "locked" | "available" | "completed";

export interface MagicCreatorWizardStep {
  id: string;
  order: number;
  title: string;
  description: string;
  status: MagicCreatorStepStatus;
}

export const magicCreatorWizardSteps: MagicCreatorWizardStep[] = [
  {
    id: "choose-sample",
    order: 1,
    title: "Choose Sample",
    description: "Select the starting product or design template.",
    status: "available",
  },
  {
    id: "configuration",
    order: 2,
    title: "Configuration",
    description: "Choose dimensions, material, color, quantity, and options.",
    status: "locked",
  },
  {
    id: "decoration",
    order: 3,
    title: "Decoration",
    description: "Prepare text, uploaded images, and decoration choices.",
    status: "locked",
  },
  {
    id: "preview",
    order: 4,
    title: "Preview",
    description: "Review the generated product and production preview.",
    status: "locked",
  },
  {
    id: "price",
    order: 5,
    title: "Price",
    description: "Review the customer-facing price for the configuration.",
    status: "locked",
  },
  {
    id: "customer-offer",
    order: 6,
    title: "Customer Offer",
    description: "Prepare optional customer negotiation details.",
    status: "locked",
  },
  {
    id: "production",
    order: 7,
    title: "Production",
    description: "Prepare the manufacturing package for the workshop.",
    status: "locked",
  },
  {
    id: "confirm-order",
    order: 8,
    title: "Confirm Order",
    description: "Confirm the draft order and close the creator journey.",
    status: "locked",
  },
];

export function getCurrentWizardStep(
  steps: MagicCreatorWizardStep[]
): MagicCreatorWizardStep {
  return steps.find((step) => step.status === "available") ?? steps[0];
}

export function getNextWizardStep(
  steps: MagicCreatorWizardStep[],
  currentStepId: string
): MagicCreatorWizardStep | null {
  const currentStep = steps.find((step) => step.id === currentStepId);

  if (!currentStep) {
    return null;
  }

  return (
    steps
      .filter((step) => step.order > currentStep.order)
      .sort((firstStep, secondStep) => firstStep.order - secondStep.order)[0] ??
    null
  );
}

export function getPreviousWizardStep(
  steps: MagicCreatorWizardStep[],
  currentStepId: string
): MagicCreatorWizardStep | null {
  const currentStep = steps.find((step) => step.id === currentStepId);

  if (!currentStep) {
    return null;
  }

  return (
    steps
      .filter((step) => step.order < currentStep.order)
      .sort((firstStep, secondStep) => secondStep.order - firstStep.order)[0] ??
    null
  );
}

export function isWizardStepAvailable(step: MagicCreatorWizardStep): boolean {
  return step.status === "available";
}

export function isWizardStepCompleted(step: MagicCreatorWizardStep): boolean {
  return step.status === "completed";
}

export function isWizardStepLocked(step: MagicCreatorWizardStep): boolean {
  return step.status === "locked";
}

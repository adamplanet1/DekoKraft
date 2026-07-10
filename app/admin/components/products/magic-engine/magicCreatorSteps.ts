export type MagicCreatorStepStatus = "locked" | "available" | "completed";

export type MagicCreatorStep = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: MagicCreatorStepStatus;
};

// Defines the Magic Creator v1 UI journey structure only.
// This static step model will later be connected to the navigation layer.
export const magicCreatorSteps: MagicCreatorStep[] = [
  {
    id: "choose-sample",
    title: "Choose Sample",
    description: "Select the starting product or design template.",
    order: 1,
    status: "available",
  },
  {
    id: "configuration",
    title: "Configuration",
    description: "Choose dimensions, material, color, quantity, and options.",
    order: 2,
    status: "locked",
  },
  {
    id: "decoration",
    title: "Decoration",
    description: "Prepare text, uploaded images, and decoration choices.",
    order: 3,
    status: "locked",
  },
  {
    id: "preview",
    title: "Preview",
    description: "Review the generated product and production preview.",
    order: 4,
    status: "locked",
  },
  {
    id: "price",
    title: "Price",
    description: "Review the customer-facing price for the configuration.",
    order: 5,
    status: "locked",
  },
  {
    id: "customer-offer",
    title: "Customer Offer",
    description: "Prepare optional customer negotiation details.",
    order: 6,
    status: "locked",
  },
  {
    id: "production",
    title: "Production",
    description: "Prepare the manufacturing package for the workshop.",
    order: 7,
    status: "locked",
  },
  {
    id: "confirm-order",
    title: "Confirm Order",
    description: "Confirm the draft order and close the creator journey.",
    order: 8,
    status: "locked",
  },
];

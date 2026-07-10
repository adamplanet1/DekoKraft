import {
  type Configuration,
  type CreatorDecorationKind,
  type CreatorEntityStatus,
  type CreatorMaterialKind,
  type Sample,
} from "./magicCreatorTypes";

export type ConfigurationValidationResult = {
  isValid: boolean;
  errors: string[];
};

const creatorEntityStatuses: CreatorEntityStatus[] = [
  "draft",
  "active",
  "archived",
];

const creatorMaterialKinds: CreatorMaterialKind[] = [
  "mdf",
  "plywood",
  "birch",
  "oak",
  "acrylic",
  "customer-owned",
  "other",
];

const creatorDecorationKinds: CreatorDecorationKind[] = [
  "none",
  "text",
  "uploaded-image",
  "magic-library",
  "ai-generated",
  "mixed",
];

function normalizeOptionKey(option: string) {
  return option.trim().toLowerCase().replaceAll(" ", "-");
}

export function createDefaultConfiguration(sample: Sample): Configuration {
  const selectedOptions = sample.customizableOptions.reduce<
    Configuration["selectedOptions"]
  >((options, option) => {
    const optionKey = normalizeOptionKey(option);

    return {
      ...options,
      [optionKey]: optionKey === "quantity" ? 1 : "",
    };
  }, {});

  return {
    id: `${sample.id}-default-configuration`,
    sampleId: sample.id,
    selectedOptions,
    materialKind: "other",
    decorationKind: "none",
    quantity: 1,
    status: "draft",
    updatedAt: "",
  };
}

export function cloneConfiguration(
  configuration: Configuration
): Configuration {
  return {
    ...configuration,
    selectedOptions: {
      ...configuration.selectedOptions,
    },
  };
}

export function validateConfiguration(
  configuration: Configuration
): ConfigurationValidationResult {
  const errors: string[] = [];

  if (!configuration.id.trim()) {
    errors.push("Configuration id is required.");
  }

  if (!configuration.sampleId.trim()) {
    errors.push("Sample id is required.");
  }

  if (configuration.quantity < 1) {
    errors.push("Quantity must be at least 1.");
  }

  if (!creatorEntityStatuses.includes(configuration.status)) {
    errors.push("Configuration status is invalid.");
  }

  if (
    configuration.materialKind &&
    !creatorMaterialKinds.includes(configuration.materialKind)
  ) {
    errors.push("Material kind is invalid.");
  }

  if (
    configuration.decorationKind &&
    !creatorDecorationKinds.includes(configuration.decorationKind)
  ) {
    errors.push("Decoration kind is invalid.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function isConfigurationComplete(
  configuration: Configuration
): boolean {
  return (
    validateConfiguration(configuration).isValid &&
    Boolean(configuration.materialKind) &&
    Boolean(configuration.decorationKind) &&
    Object.keys(configuration.selectedOptions).length > 0
  );
}

export function getConfigurationSummary(
  configuration: Configuration
): string {
  const optionCount = Object.keys(configuration.selectedOptions).length;
  const material = configuration.materialKind ?? "no material";
  const decoration = configuration.decorationKind ?? "no decoration";

  return `${optionCount} options, ${material}, ${decoration}, quantity ${configuration.quantity}, ${configuration.status}.`;
}

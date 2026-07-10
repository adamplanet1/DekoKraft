import { createMagicEngineSteps } from "./engineSteps";
import {
  type EngineStepId,
  type EngineStepStatus,
  type MagicEngineResult,
  type MagicEngineLang,
  type MagicProductDraft,
  type MagicProductInput,
} from "./types";

export type MagicRecommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
};

export type MagicAutoFixAction = {
  id: string;
  recommendationId: string;
  label: string;
  description: string;
  status: "suggested" | "notAvailable";
};

export type MagicProductHealth = {
  score: number;
  level: "weak" | "medium" | "good";
  summary: string;
};

export type MagicPublishChecklistItem = {
  id: string;
  label: string;
  passed: boolean;
};

export type MagicPublishReadiness = {
  ready: boolean;
  label: string;
  reason: string;
};

export type MagicPublishProgress = {
  passed: number;
  total: number;
  percentage: number;
};

export type MagicCompletionProgress = {
  completed: number;
  total: number;
  percentage: number;
};

export type MagicEngineSummary = {
  title: string;
  message: string;
};

export type MagicPublishWarning = {
  show: boolean;
  message: string;
};

export type MagicPublishSafety = {
  canPublish: boolean;
  message: string;
};

export type MagicEngineResultWithRecommendations = MagicEngineResult & {
  recommendations: MagicRecommendation[];
  autoFixActions: MagicAutoFixAction[];
  productHealth: MagicProductHealth;
  publishChecklist: MagicPublishChecklistItem[];
  publishReadiness: MagicPublishReadiness;
  publishProgress: MagicPublishProgress;
  completionProgress: MagicCompletionProgress;
  engineSummary: MagicEngineSummary;
  publishWarning: MagicPublishWarning;
  publishSafety: MagicPublishSafety;
};

type MagicProductInputWithPrice = MagicProductInput & {
  price?: number | string;
};

type MagicProductInputWithLang = MagicProductInput & {
  lang?: MagicEngineLang;
};

const publishReadinessMissingReason: Record<MagicEngineLang, string> = {
  ar: "أول عنصر ناقص: {item label}",
  en: "First missing item: {item label}",
  de: "Erstes fehlendes Element: {item label}",
  fr: "Premier élément manquant : {item label}",
};

const publishReadinessReadyReason: Record<MagicEngineLang, string> = {
  ar: "تم اجتياز كل عناصر فحص النشر.",
  en: "All checklist items passed.",
  de: "Alle Veröffentlichungsprüfungen wurden bestanden.",
  fr: "Toutes les vérifications de publication sont réussies.",
};

const publishReadinessLabels: Record<
  MagicEngineLang,
  { ready: string; notReady: string }
> = {
  ar: {
    ready: "جاهز للنشر",
    notReady: "ليس جاهزًا بعد",
  },
  en: {
    ready: "Ready to publish",
    notReady: "Not ready yet",
  },
  de: {
    ready: "Bereit zur Veröffentlichung",
    notReady: "Noch nicht bereit",
  },
  fr: {
    ready: "Prêt à publier",
    notReady: "Pas encore prêt",
  },
};

const engineSummaryText: Record<
  MagicEngineLang,
  {
    ready: MagicEngineSummary;
    inProgress: MagicEngineSummary;
  }
> = {
  ar: {
    ready: {
      title: "Magic Web جاهز",
      message: "المنتج جاهز للنشر.",
    },
    inProgress: {
      title: "Magic Web قيد الإنجاز",
      message: "أكمل الخطوات الناقصة قبل النشر.",
    },
  },
  en: {
    ready: {
      title: "Magic Web Ready",
      message: "Product is ready for publishing.",
    },
    inProgress: {
      title: "Magic Web In Progress",
      message: "Complete the missing steps before publishing.",
    },
  },
  de: {
    ready: {
      title: "Magic Web bereit",
      message: "Das Produkt ist bereit zur Veröffentlichung.",
    },
    inProgress: {
      title: "Magic Web in Arbeit",
      message: "Schließe die fehlenden Schritte vor der Veröffentlichung ab.",
    },
  },
  fr: {
    ready: {
      title: "Magic Web prêt",
      message: "Le produit est prêt à être publié.",
    },
    inProgress: {
      title: "Magic Web en cours",
      message: "Complétez les étapes manquantes avant la publication.",
    },
  },
};

const publishWarningMessages: Record<MagicEngineLang, string> = {
  ar: "لا تنشر المنتج قبل إكمال العناصر الناقصة.",
  en: "Do not publish before completing the missing items.",
  de: "Nicht veröffentlichen, bevor die fehlenden Elemente abgeschlossen sind.",
  fr: "Ne publiez pas avant de compléter les éléments manquants.",
};

const publishSafetyMessages: Record<
  MagicEngineLang,
  { canPublish: string; blocked: string }
> = {
  ar: {
    canPublish: "يمكن المتابعة إلى النشر.",
    blocked: "النشر متوقف حتى تكتمل المتطلبات.",
  },
  en: {
    canPublish: "You can proceed to publish.",
    blocked: "Publishing is blocked until requirements are complete.",
  },
  de: {
    canPublish: "Du kannst mit der Veröffentlichung fortfahren.",
    blocked:
      "Die Veröffentlichung ist blockiert, bis die Anforderungen erfüllt sind.",
  },
  fr: {
    canPublish: "Vous pouvez procéder à la publication.",
    blocked:
      "La publication est bloquée jusqu’à ce que les exigences soient complètes.",
  },
};

function getStepStatuses(
  input: MagicProductInput
): Partial<Record<EngineStepId, EngineStepStatus>> {
  const hasImages = Boolean(input.images?.length);
  const hasSpecifications = Boolean(input.description?.trim());
  const hasProductCardData = Boolean(
    input.name?.trim() && input.category?.trim() && input.description?.trim()
  );
  const productUnderstandingStatus: EngineStepStatus = hasSpecifications
    ? "ready"
    : "notStarted";
  const productCardStatus: EngineStepStatus = hasProductCardData
    ? "ready"
    : "notStarted";
  const productContentStatus: EngineStepStatus =
    productUnderstandingStatus === "ready" ? "waiting" : "notStarted";

  return {
    images: hasImages ? "ready" : "waiting",
    specifications: hasSpecifications ? "ready" : "waiting",
    productUnderstanding: productUnderstandingStatus,
    productCard: productCardStatus,
    productBlueprint: productCardStatus === "ready" ? "waiting" : "notStarted",
    productContent: productContentStatus,
    seo:
      productContentStatus === "waiting" || productContentStatus === "ready"
        ? "waiting"
        : "notStarted",
    aiImages: hasImages && hasSpecifications ? "waiting" : "notStarted",
    readyToPublish: "notStarted",
  };
}

function buildLocalRecommendations(
  draft: MagicProductDraft
): MagicRecommendation[] {
  const recommendations: MagicRecommendation[] = [];
  const hasMainImage = draft.images.some((image) => image.role === "main");
  const galleryImagesCount = draft.images.filter(
    (image) => image.role === "gallery"
  ).length;
  const hasProductCard =
    Boolean(draft.name.trim()) &&
    Boolean(draft.category.trim()) &&
    Boolean(draft.description.trim());

  if (draft.images.length === 0) {
    recommendations.push({
      id: "no-images-uploaded",
      priority: "high",
      title: "No images uploaded.",
      description: "Upload at least one product image before publishing.",
    });
  }

  if (!hasMainImage) {
    recommendations.push({
      id: "add-main-product-image",
      priority: "high",
      title: "Add at least one Main product image.",
      description: "Mark one uploaded image as the main product image.",
    });
  }

  if (draft.description.trim().length < 40) {
    recommendations.push({
      id: "description-too-short",
      priority: "medium",
      title: "Description is too short.",
      description: "Add more product specifications to improve the draft.",
    });
  }

  if (!draft.category.trim()) {
    recommendations.push({
      id: "missing-category",
      priority: "high",
      title: "Product has no category.",
      description: "Choose a category so the product can be organized.",
    });
  }

  recommendations.push({
    id: "missing-price",
    priority: "medium",
    title: "Product has no price.",
    description: "Add a price before this product is ready to sell.",
  });

  if (galleryImagesCount < 2) {
    recommendations.push({
      id: "more-gallery-images",
      priority: "low",
      title: "More gallery images are recommended.",
      description: "Add or mark more images as gallery images.",
    });
  }

  recommendations.push({
    id: "add-seo-keywords",
    priority: "medium",
    title: "Add SEO keywords.",
    description: "SEO keywords will help prepare this product for search.",
  });

  recommendations.push({
    id: "add-image-alt-text",
    priority: "medium",
    title: "Add image ALT text.",
    description: "Image ALT text improves accessibility and SEO readiness.",
  });

  if (hasProductCard) {
    recommendations.push({
      id: "product-card-ready",
      priority: "low",
      title: "Product card is ready.",
      description: "The local draft has enough data for a product card preview.",
    });
  }

  if (
    hasProductCard &&
    draft.images.length > 0 &&
    hasMainImage &&
    draft.status === "active"
  ) {
    recommendations.push({
      id: "product-can-be-published",
      priority: "low",
      title: "Product can be published.",
      description: "The local draft has the minimum publish-ready signals.",
    });
  }

  return recommendations;
}

function buildLocalAutoFixActions(
  recommendations: MagicRecommendation[]
): MagicAutoFixAction[] {
  return recommendations.map((recommendation) => {
    switch (recommendation.id) {
      case "no-images-uploaded":
      case "add-main-product-image":
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "Upload main image",
          description: "Add or mark a product image as the main image.",
          status: "suggested",
        };
      case "missing-category":
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "Choose category",
          description: "Select the product category manually.",
          status: "suggested",
        };
      case "missing-price":
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "Add price",
          description: "Enter the product price manually.",
          status: "suggested",
        };
      case "description-too-short":
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "Improve description",
          description: "Add more natural-language product specifications.",
          status: "suggested",
        };
      case "add-seo-keywords":
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "Generate SEO keywords later",
          description: "Prepare this for a future SEO generation step.",
          status: "notAvailable",
        };
      case "add-image-alt-text":
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "Generate ALT text later",
          description: "Prepare this for a future image ALT text generation step.",
          status: "notAvailable",
        };
      case "more-gallery-images":
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "Add gallery images",
          description: "Upload or mark more product images as gallery images.",
          status: "suggested",
        };
      default:
        return {
          id: `fix-${recommendation.id}`,
          recommendationId: recommendation.id,
          label: "No automatic fix available",
          description: "This recommendation is informational for now.",
          status: "notAvailable",
        };
    }
  });
}

function hasPrice(input: MagicProductInputWithPrice) {
  if (typeof input.price === "number") {
    return input.price > 0;
  }

  return Boolean(input.price?.trim());
}

function buildLocalProductHealth(
  draft: MagicProductDraft,
  input: MagicProductInput,
  steps: ReturnType<typeof createMagicEngineSteps>,
  recommendations: MagicRecommendation[]
): MagicProductHealth {
  const inputWithPrice = input as MagicProductInputWithPrice;
  const hasImages = draft.images.length > 0;
  const hasMainImage = draft.images.some((image) => image.role === "main");
  const hasName = Boolean(draft.name.trim());
  const hasCategory = Boolean(draft.category.trim());
  const hasDescription = Boolean(draft.description.trim());
  const hasProductCard = steps.some(
    (step) => step.id === "productCard" && step.status === "ready"
  );
  const hasSeoQueued = steps.some(
    (step) =>
      step.id === "seo" && (step.status === "waiting" || step.status === "ready")
  );
  const recommendationScore =
    recommendations.length <= 3 ? 10 : recommendations.length <= 6 ? 5 : 0;

  const score =
    (hasImages ? 10 : 0) +
    (hasMainImage ? 10 : 0) +
    (hasName ? 10 : 0) +
    (hasCategory ? 10 : 0) +
    (hasPrice(inputWithPrice) ? 10 : 0) +
    (hasDescription ? 15 : 0) +
    (hasProductCard ? 15 : 0) +
    (hasSeoQueued ? 10 : 0) +
    recommendationScore;
  const level = score >= 75 ? "good" : score >= 45 ? "medium" : "weak";

  return {
    score,
    level,
    summary: `Local product health is ${level} with a score of ${score}/100.`,
  };
}

function buildLocalPublishChecklist(
  draft: MagicProductDraft,
  input: MagicProductInput,
  productHealth: MagicProductHealth,
  recommendations: MagicRecommendation[]
): MagicPublishChecklistItem[] {
  const inputWithPrice = input as MagicProductInputWithPrice;
  const hasMainImage = draft.images.some((image) => image.role === "main");
  const hasHighPriorityRecommendations = recommendations.some(
    (recommendation) => recommendation.priority === "high"
  );

  return [
    {
      id: "has-product-name",
      label: "Has product name",
      passed: Boolean(draft.name.trim()),
    },
    {
      id: "has-category",
      label: "Has category",
      passed: Boolean(draft.category.trim()),
    },
    {
      id: "has-price",
      label: "Has price",
      passed: hasPrice(inputWithPrice),
    },
    {
      id: "has-description",
      label: "Has description",
      passed: Boolean(draft.description.trim()),
    },
    {
      id: "has-at-least-one-image",
      label: "Has at least one image",
      passed: draft.images.length > 0,
    },
    {
      id: "has-main-image",
      label: "Has main image",
      passed: hasMainImage,
    },
    {
      id: "product-health-is-good",
      label: "Product health is good",
      passed: productHealth.level === "good",
    },
    {
      id: "no-high-priority-recommendations",
      label: "No high priority recommendations",
      passed: !hasHighPriorityRecommendations,
    },
  ];
}

function buildLocalPublishReadiness(
  publishChecklist: MagicPublishChecklistItem[],
  lang: MagicEngineLang = "en"
): MagicPublishReadiness {
  const ready = publishChecklist.every((item) => item.passed);
  const firstFailedItem = publishChecklist.find((item) => !item.passed);
  const firstFailedLabel = firstFailedItem?.label || "Unknown";

  return {
    ready,
    label: ready
      ? publishReadinessLabels[lang].ready
      : publishReadinessLabels[lang].notReady,
    reason: ready
      ? publishReadinessReadyReason[lang]
      : publishReadinessMissingReason[lang].replace(
          "{item label}",
          firstFailedLabel
        ),
  };
}

function buildLocalPublishProgress(
  publishChecklist: MagicPublishChecklistItem[]
): MagicPublishProgress {
  const passed = publishChecklist.filter((item) => item.passed).length;
  const total = publishChecklist.length;

  return {
    passed,
    total,
    percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
  };
}

function buildLocalCompletionProgress(
  steps: ReturnType<typeof createMagicEngineSteps>
): MagicCompletionProgress {
  const completed = steps.filter((step) => step.status === "ready").length;
  const total = steps.length;

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

function buildLocalEngineSummary(
  publishReadiness: MagicPublishReadiness,
  lang: MagicEngineLang = "en"
): MagicEngineSummary {
  return publishReadiness.ready
    ? engineSummaryText[lang].ready
    : engineSummaryText[lang].inProgress;
}

function buildLocalPublishWarning(
  publishReadiness: MagicPublishReadiness,
  lang: MagicEngineLang = "en"
): MagicPublishWarning {
  const show = !publishReadiness.ready;

  return {
    show,
    message: show ? publishWarningMessages[lang] : "",
  };
}

function buildLocalPublishSafety(
  publishReadiness: MagicPublishReadiness,
  publishWarning: MagicPublishWarning,
  lang: MagicEngineLang = "en"
): MagicPublishSafety {
  const canPublish = publishReadiness.ready && !publishWarning.show;

  return {
    canPublish,
    message: canPublish
      ? publishSafetyMessages[lang].canPublish
      : publishSafetyMessages[lang].blocked,
  };
}

export function buildLocalProductDraft(
  input: MagicProductInput
): MagicEngineResultWithRecommendations {
  const inputWithLang = input as MagicProductInputWithLang;
  const draft = {
    name: input.name || "",
    category: input.category || "",
    description: input.description || "",
    colors: input.colors || [],
    images: input.images || [],
    status: input.status || "draft",
  };
  const steps = createMagicEngineSteps(getStepStatuses(input));
  const recommendations = buildLocalRecommendations(draft);
  const productHealth = buildLocalProductHealth(
    draft,
    input,
    steps,
    recommendations
  );
  const publishChecklist = buildLocalPublishChecklist(
    draft,
    input,
    productHealth,
    recommendations
  );
  const publishReadiness = buildLocalPublishReadiness(
    publishChecklist,
    inputWithLang.lang
  );
  const publishWarning = buildLocalPublishWarning(
    publishReadiness,
    inputWithLang.lang
  );

  return {
    draft,
    steps,
    recommendations,
    autoFixActions: buildLocalAutoFixActions(recommendations),
    productHealth,
    publishChecklist,
    publishReadiness,
    publishProgress: buildLocalPublishProgress(publishChecklist),
    completionProgress: buildLocalCompletionProgress(steps),
    engineSummary: buildLocalEngineSummary(publishReadiness, inputWithLang.lang),
    publishWarning,
    publishSafety: buildLocalPublishSafety(
      publishReadiness,
      publishWarning,
      inputWithLang.lang
    ),
  };
}

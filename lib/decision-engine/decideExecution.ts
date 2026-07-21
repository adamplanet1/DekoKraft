import { classifyInstruction } from "./classifyInstruction";
import { findAvailableLocalProcessor } from "./localProcessors";
import { estimateExecutionCost, selectModel, selectQuality, selectSize } from "./selectExecutionSettings";
import type { DecisionConfidence, DecisionInput, DecisionPlanAction, DecisionPlanStep, DecisionReasonCode, DecisionResult, ExecutionProvider } from "./types";
import { SMART_EDIT_IMAGE_ESTIMATE_USD } from "../echo-guide/pricing";

type DecisionDraft = {
  provider: ExecutionProvider;
  confidence: DecisionConfidence;
  reasonCode: DecisionReasonCode;
  reasonText: string;
  actions: Array<{ provider: "local" | "openai"; action: DecisionPlanAction }>;
  warnings?: string[];
};

function blocked(reasonCode: DecisionReasonCode, reasonText: string): DecisionDraft {
  return { provider: "blocked", confidence: "high", reasonCode, reasonText, actions: [] };
}

function createPlan(input: DecisionInput, draft: DecisionDraft): DecisionPlanStep[] {
  return draft.actions.map((step, index) => {
    const processor = step.provider === "local" ? findAvailableLocalProcessor(step.action) : undefined;
    return {
      id: crypto.randomUUID(),
      order: index + 1,
      provider: step.provider,
      action: step.action,
      processorId: processor?.id,
      model: step.provider === "openai" ? selectModel(draft.provider, input.suggestedModel) : processor?.id,
      quality: selectQuality(step.provider === "local" ? "local" : draft.provider, input.suggestedQuality),
      size: selectSize(input.suggestedSize),
      estimatedCostUsd: step.provider === "openai" ? SMART_EDIT_IMAGE_ESTIMATE_USD : 0,
    };
  });
}

export function decideExecution(input: DecisionInput): DecisionResult {
  // Classify the user's positive intent. Echo Guide's final prompt contains
  // negative safeguards such as "do not redesign", which must not be mistaken
  // for a request to redesign the product.
  const classification = classifyInstruction(input.userInstruction);
  let draft: DecisionDraft;

  if (!input.userInstruction.trim() || !input.finalPrompt.trim()) draft = blocked("missing-user-instruction", "لا يمكن إنشاء خطة تنفيذ دون طلب واضح.");
  else if (input.workspace !== "image") draft = blocked("unsupported-workspace", "مساحة العمل الحالية لا تملك معالج Smart Edit تنفيذيًا في الإصدار الأول.");
  else if (!input.currentImageId) draft = blocked("missing-image", "يجب اختيار الصورة الحالية قبل التنفيذ.");
  else if (classification.protectedFeatureRisk || classification.ambiguous) {
    draft = {
      provider: "manual-review",
      confidence: "low",
      reasonCode: classification.protectedFeatureRisk ? "protected-feature-risk" : "low-confidence",
      reasonText: "الطلب متعارض أو قد يغيّر خصائص محمية؛ يلزم توضيحه قبل التنفيذ.",
      actions: [],
      warnings: ["لم يتم استدعاء أي معالج أو مزود مدفوع."],
    };
  } else if (classification.backgroundRemoval && (classification.sceneGeneration || classification.advertising || classification.generation)) {
    draft = {
      provider: "hybrid",
      confidence: "high",
      reasonCode: classification.advertising ? "requires-product-ad" : "requires-scene-generation",
      reasonText: "يحتاج الطلب فصل المنتج محليًا أولًا ثم تنفيذ المشهد التوليدي مرة واحدة بواسطة OpenAI.",
      actions: [
        { provider: "local", action: "background-removal" },
        { provider: "openai", action: classification.advertising ? "product-ad" : "scene-generation" },
      ],
      warnings: ["تنظيف الحواف المحلي النهائي مخطط لاحقًا لأن المعالج غير متوفر حاليًا."],
    };
  } else if (classification.advertising || classification.sceneGeneration || classification.generation || classification.relighting || classification.objectReplacement || classification.restoration) {
    const action: DecisionPlanAction = classification.advertising ? "product-ad"
      : classification.sceneGeneration ? "scene-generation"
      : classification.relighting ? "relighting"
      : classification.restoration ? "restoration"
      : "image-edit";
    const reasonCode: DecisionReasonCode = classification.advertising ? "requires-product-ad"
      : classification.sceneGeneration ? "requires-scene-generation"
      : classification.relighting ? "requires-relighting"
      : classification.objectReplacement ? "requires-object-generation"
      : classification.restoration ? "requires-complex-restoration"
      : "requires-generative-edit";
    draft = { provider: "openai", confidence: "high", reasonCode, reasonText: "يتطلب الطلب تعديلًا توليديًا لا يوفره المعالج المحلي الحالي.", actions: [{ provider: "openai", action }] };
  } else if (classification.backgroundRemoval) {
    draft = { provider: "local", confidence: "high", reasonCode: "simple-background-removal", reasonText: "إزالة الخلفية الصافية متاحة عبر المعالج المحلي مع الحفاظ على البكسلات.", actions: [{ provider: "local", action: "background-removal" }] };
  } else if (classification.cleanup || classification.resize || classification.formatConversion) {
    const action: DecisionPlanAction = classification.cleanup ? "edge-cleanup" : classification.resize ? "resize" : "format-conversion";
    const processor = findAvailableLocalProcessor(action);
    draft = processor
      ? { provider: "local", confidence: "high", reasonCode: classification.cleanup ? "simple-edge-cleanup" : classification.resize ? "simple-resize" : "simple-format-conversion", reasonText: "العملية البسيطة متاحة محليًا.", actions: [{ provider: "local", action }] }
      : { provider: "manual-review", confidence: "medium", reasonCode: "manual-review-required", reasonText: "المعالج المحلي المطلوب مسجل لكنه غير متوفر بعد.", actions: [], warnings: ["لن يتم استدعاء OpenAI بدلًا منه تلقائيًا."] };
  } else {
    draft = { provider: "manual-review", confidence: "low", reasonCode: "low-confidence", reasonText: "لم يتمكن المحرك الحتمي من تصنيف الطلب بثقة كافية.", actions: [], warnings: ["عدّل الطلب ليحدد التغيير المطلوب بدقة."] };
  }

  const plan = createPlan(input, draft);
  const estimatedCostUsd = estimateExecutionCost(draft.provider, plan);
  if (process.env.NODE_ENV === "development") console.info("[Decision Engine]", { provider: draft.provider, reason: draft.reasonCode, steps: plan.map((step) => step.action) });
  return {
    id: crypto.randomUUID(),
    executionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    provider: draft.provider,
    confidence: draft.confidence,
    reasonCode: draft.reasonCode,
    reasonText: draft.reasonText,
    requiresConfirmation: draft.provider === "local" || draft.provider === "openai" || draft.provider === "hybrid",
    requiresManualReview: draft.provider === "manual-review",
    estimatedCostUsd,
    estimatedCostMinUsd: estimatedCostUsd,
    estimatedCostMaxUsd: estimatedCostUsd,
    plan,
    warnings: draft.warnings ?? [],
    canExecute: draft.provider === "local" || draft.provider === "openai" || draft.provider === "hybrid",
  };
}

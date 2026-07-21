"use client";

import { GripVertical, Minus, Package, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import BackgroundOptionsPanel from "./BackgroundOptionsPanel";
import BeforeAfterPreview from "./BeforeAfterPreview";
import ColorOptionsPanel from "./ColorOptionsPanel";
import ProductSpecificationsCard from "./ProductSpecificationsCard";
import ProductCategoryPanel from "./ProductCategoryPanel";
import SmartEditComposer from "./SmartEditComposer";
import EchoGuideQuickActions from "./EchoGuideQuickActions";
import SmartEditMessages from "./SmartEditMessages";
import SmartEditOptionButtons from "./SmartEditOptionButtons";
import SmartEditRequestSummary from "./SmartEditRequestSummary";
import EchoGuidePanel from "./EchoGuidePanel";
import DecisionEnginePanel from "./DecisionEnginePanel";
import { categorySpecificationSchema, saveCategoryDrafts, type CategoryDrafts, type ProductCategoryId } from "./CategoryDraftStore";
import { assertAcceptedResultOwnership, saveAcceptedVisualPreference } from "./AcceptedResultStore";
import { saveConfirmedOriginalProduct, type SmartProductWorkingSession } from "./ConfirmedOriginalProductStore";
import { SMART_EDIT_SESSION_DRAFT_KEY, clearSmartEditExperimentData, confirmedProductDNAToSpecifications, loadConfirmedProductDNALearning, saveConfirmedProductSpecifications, type SmartProductSpecifications } from "./SmartEditLearningStore";
import { normalizeProductDNA, type ProductDNA } from "../../../lib/echo/echoProductDNA";
import EmptyProductMemoryState from "./EmptyProductMemoryState";
import ProductMemoryPicker, { type PlatformProductSelection, type ProductSelectionMode } from "./ProductMemoryPicker";
import { addAcceptedGeneratedVariant, type ProductMemory } from "./ProductMemoryStore";
import { buildEchoConfirmationSummary, detectEchoIntent, echoCapabilities, type EchoUserRole, type SmartEditFlowStatus, type SmartEditOptions } from "../../../lib/echo/echoGuide";
import { executeDecision } from "../../../lib/decision-engine/executeDecision";
import { recordDecisionSmartEdit, updateSmartEditHistoryStatus } from "../engine/HistoryLogger";
import type { WorkspaceId } from "../engine/workspaceTypes";
import { saveProductDNAToPrimaryStore } from "./PrimaryProductDNAStore";
import type { EchoGuideOperation, EchoGuideRecommendation, EchoGuideUiState } from "../../../lib/echo-guide/types";
import { studioServerFetch } from "../lib/studioServerApi";
import type { DecisionResult } from "../../../lib/decision-engine/types";

export type SmartEditStage = "product-confirmation" | "product-correction" | "ready-for-edit" | "edit-confirmation" | "confirmed";
type ProductRelation = "same-product-new-image" | "new-product-from-dna";

export type SmartEditChatProps = {
  workspace: WorkspaceId;
  participantId?: string;
  sellerId?: string;
  product: {
    id: string;
    name: string;
    productDNA?: ProductDNA | null;
    originalUploadedImage?: File | Blob | null;
    currentPreviewImage?: string | null;
    generatedResultImage?: string | null;
    productMemoryImage?: string | null;
    originalImageUrl?: string | null;
  };
  activeProductMemory: ProductMemory | null;
  onProductMemoryChange: (memory: ProductMemory) => void;
  onRequestUpload: () => void;
  onSelectProduct: (product: PlatformProductSelection) => ProductSelectionMode;
  boundaryRef: RefObject<HTMLDivElement | null>;
  onPreviewChange: (imageUrl: string, source: "generated" | "original") => void;
  onClose: () => void;
};

type SmartEditOptionPanel = "background" | "colors" | null;
type SmartEditOperationStatus = "idle" | "confirming" | "generating" | "success" | "error";
type GenerationSourceMetadata = {
  sourceUsed: "original-upload" | "current-preview" | "product-memory";
  background: string;
  preservedFeatures: string[];
};

const INITIAL_POSITION = { x: 24, y: 84 };

export default function SmartEditChat({ workspace, participantId, sellerId, product, activeProductMemory, boundaryRef, onPreviewChange, onProductMemoryChange, onRequestUpload, onSelectProduct, onClose }: SmartEditChatProps) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [stage, setStage] = useState<SmartEditStage>("product-confirmation");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [request, setRequest] = useState("");
  const [pendingRequest, setPendingRequest] = useState("");
  const [activeOptionPanel, setActiveOptionPanel] = useState<SmartEditOptionPanel>(null);
  const [smartEditOptions, setSmartEditOptions] = useState<SmartEditOptions>({ preserveShape: true, preserveDetails: true, improveQuality: false });
  const [workingSession, setWorkingSession] = useState<SmartProductWorkingSession | null>(null);
  const [echoUserRole] = useState<EchoUserRole>("artisan");
  const [requestConfirmed, setRequestConfirmed] = useState(false);
  const [echoGuideState, setEchoGuideState] = useState<EchoGuideUiState>("idle");
  const [echoGuideRecommendation, setEchoGuideRecommendation] = useState<EchoGuideRecommendation | null>(null);
  const [echoGuideFinalPrompt, setEchoGuideFinalPrompt] = useState("");
  const [echoGuideError, setEchoGuideError] = useState<string | null>(null);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<SmartEditFlowStatus>("idle");
  const [operationStatus, setOperationStatus] = useState<SmartEditOperationStatus>("idle");
  const [generationMessage, setGenerationMessage] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationSourceMetadata, setGenerationSourceMetadata] = useState<GenerationSourceMetadata | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<"original" | "generated">("original");
  const [isComparingResult, setIsComparingResult] = useState(false);
  const [customBackgroundColor, setCustomBackgroundColor] = useState("#ffffff");
  const [customProductColor, setCustomProductColor] = useState("#ffffff");
  const [dimensionError, setDimensionError] = useState("");
  const [productSelectionMessage, setProductSelectionMessage] = useState("");
  const [isDnaReferenceDecisionPending, setIsDnaReferenceDecisionPending] = useState(false);
  const [productRelation, setProductRelation] = useState<ProductRelation | null>(null);
  const [specifications, setSpecifications] = useState<SmartProductSpecifications>(() => {
    const productDNA = normalizeProductDNA({ ...(product.productDNA ?? {}), id: product.id, notes: product.productDNA?.notes || product.name } as Partial<ProductDNA> & Record<string, unknown>);
    const categoryId = ["packaging", "candles", "gifts", "kids", "services"].includes(productDNA.categoryId)
      ? productDNA.categoryId as SmartProductSpecifications["categoryId"]
      : "candles";
    return {
      id: productDNA.id,
      categoryId,
      categoryName: productDNA.categoryId ? t(`studio.smartEditChat.categories.${categoryId}`) : "",
      productType: productDNA.productType,
      shape: productDNA.shape ?? "",
      color: productDNA.color ?? "",
      material: productDNA.material ?? "",
      background: "",
      dimensions: productDNA.dimensions,
      usage: productDNA.usage ?? "",
      notes: productDNA.notes ?? product.name,
      hasWick: productDNA.hasWick ?? false,
      lidType: "", closureType: "", capacity: "", scent: productDNA.scent ?? "", burnTime: productDNA.burnTime ?? "", waxType: productDNA.waxType ?? "",
      personalization: "", occasion: "", ageGroup: "", educationalGoal: "", safetyNotes: "",
      serviceType: "", inputFileType: "", outputFileType: "", estimatedDuration: "",
    };
  });
  const [categoryDrafts, setCategoryDrafts] = useState<CategoryDrafts>(() => ({ candles: specifications }));
  const initialSpecificationsRef = useRef(specifications);

  useEffect(() => {
    if (!activeProductMemory || activeProductMemory.analysis.status !== "suggested") return;
    const productDNA = activeProductMemory.productDNA;
    const categoryId = ["packaging", "candles", "gifts", "kids", "services"].includes(productDNA.categoryId)
      ? productDNA.categoryId as SmartProductSpecifications["categoryId"]
      : "candles";
    setSpecifications((current) => {
      const suggested: SmartProductSpecifications = {
        ...current,
        id: productDNA.id,
        categoryId,
        categoryName: productDNA.categoryId ? t(`studio.smartEditChat.categories.${categoryId}`) : "",
        productType: productDNA.productType,
        shape: productDNA.shape ?? "",
        material: productDNA.material ?? "",
        color: productDNA.color ?? "",
        dimensions: productDNA.dimensions,
        usage: productDNA.usage ?? "",
        hasWick: productDNA.hasWick ?? false,
        notes: productDNA.notes ?? "",
      };
      initialSpecificationsRef.current = suggested;
      setCategoryDrafts((drafts) => ({ ...drafts, [categoryId]: suggested }));
      return suggested;
    });
  }, [activeProductMemory, t]);

  const specificationLabels = useMemo(() => ({
    categoryId: t("studio.smartEditChat.currentCategory"), categoryName: t("studio.smartEditChat.currentCategory"),
    productType: t("studio.smartEditChat.productType"), shape: t("studio.smartEditChat.shape"),
    color: t("studio.smartEditChat.color"), material: t("studio.smartEditChat.material"),
    background: t("studio.smartEditChat.background"), dimensions: t("studio.smartEditChat.dimensions"),
    usage: t("studio.smartEditChat.usage"), notes: t("studio.smartEditChat.notes"),
    hasWick: t("studio.smartEditChat.hasWick"), yes: t("studio.smartEditChat.yes"), no: t("studio.smartEditChat.no"),
    lidType: t("studio.smartEditChat.fields.lidType"), closureType: t("studio.smartEditChat.fields.closureType"), capacity: t("studio.smartEditChat.fields.capacity"),
    scent: t("studio.smartEditChat.fields.scent"), burnTime: t("studio.smartEditChat.fields.burnTime"), waxType: t("studio.smartEditChat.fields.waxType"),
    personalization: t("studio.smartEditChat.fields.personalization"), occasion: t("studio.smartEditChat.fields.occasion"), ageGroup: t("studio.smartEditChat.fields.ageGroup"),
    educationalGoal: t("studio.smartEditChat.fields.educationalGoal"), safetyNotes: t("studio.smartEditChat.fields.safetyNotes"), serviceType: t("studio.smartEditChat.fields.serviceType"),
    inputFileType: t("studio.smartEditChat.fields.inputFileType"), outputFileType: t("studio.smartEditChat.fields.outputFileType"), estimatedDuration: t("studio.smartEditChat.fields.estimatedDuration"),
    dimensionLength: t("studio.smartEditChat.fields.dimensionLength"), dimensionWidth: t("studio.smartEditChat.fields.dimensionWidth"),
    dimensionHeight: t("studio.smartEditChat.fields.dimensionHeight"), dimensionUnit: t("studio.smartEditChat.fields.dimensionUnit"),
  }), [t]);

  const categoryLabels = useMemo(() => ({
    packaging: t("studio.smartEditChat.categories.packaging"), candles: t("studio.smartEditChat.categories.candles"), gifts: t("studio.smartEditChat.categories.gifts"),
    kids: t("studio.smartEditChat.categories.kids"), services: t("studio.smartEditChat.categories.services"),
  }), [t]);

  const backgroundLabels = useMemo(() => ({
    transparent: t("studio.smartEditChat.backgroundOptions.transparent"), blurred: t("studio.smartEditChat.backgroundOptions.transparentBlur"),
    glass: t("studio.smartEditChat.backgroundOptions.transparentGlass"), white: t("studio.smartEditChat.backgroundOptions.white"),
    black: t("studio.smartEditChat.backgroundOptions.black"), original: t("studio.smartEditChat.backgroundOptions.original"), custom: t("studio.smartEditChat.backgroundOptions.custom"),
  }), [t]);
  const colorLabels = useMemo(() => ({
    preserve: t("studio.smartEditChat.colorOptions.preserveOriginal"), enhance: t("studio.smartEditChat.colorOptions.enhance"),
    warm: t("studio.smartEditChat.colorOptions.warm"), cool: t("studio.smartEditChat.colorOptions.cool"), monochrome: t("studio.smartEditChat.colorOptions.monochrome"),
    custom: t("studio.smartEditChat.colorOptions.custom"),
  }), [t]);

  useEffect(() => { closeRef.current?.focus(); }, []);

  const clampPosition = (x: number, y: number) => {
    const container = boundaryRef.current?.getBoundingClientRect();
    const panel = panelRef.current?.getBoundingClientRect();
    if (!container || !panel) return { x, y };
    return { x: Math.min(Math.max(0, x), Math.max(0, container.width - panel.width)), y: Math.min(Math.max(0, y), Math.max(0, container.height - panel.height)) };
  };

  useEffect(() => {
    const constrain = () => setPosition((current) => clampPosition(current.x, current.y));
    window.addEventListener("resize", constrain);
    return () => window.removeEventListener("resize", constrain);
  });

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(max-width: 720px)").matches || (event.target as HTMLElement).closest("button")) return;
    const container = boundaryRef.current?.getBoundingClientRect();
    if (!container) return;
    dragOffsetRef.current = { x: event.clientX - container.left - position.x, y: event.clientY - container.top - position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };
  const drag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = boundaryRef.current?.getBoundingClientRect();
    if (!container) return;
    setPosition(clampPosition(event.clientX - container.left - dragOffsetRef.current.x, event.clientY - container.top - dragOffsetRef.current.y));
  };
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  };

  const updateSpecifications = (next: SmartProductSpecifications) => {
    setSpecifications(next);
    const nextDrafts = { ...categoryDrafts, [next.categoryId]: next };
    setCategoryDrafts(nextDrafts);
    saveCategoryDrafts(nextDrafts);
    try {
      sessionStorage.setItem(SMART_EDIT_SESSION_DRAFT_KEY, JSON.stringify({ stage: "draft", productId: product.id, categoryDrafts: nextDrafts, updatedAt: new Date().toISOString() }));
    } catch {
      // The unconfirmed draft remains available in component state.
    }
  };

  const selectCategory = (categoryId: ProductCategoryId) => {
    const savedDrafts = { ...categoryDrafts, [specifications.categoryId]: specifications };
    const next = savedDrafts[categoryId] ?? {
      ...specifications,
      categoryId,
      categoryName: categoryLabels[categoryId],
      hasWick: false,
      lidType: "", closureType: "", capacity: "", scent: "", burnTime: "", waxType: "",
      personalization: "", occasion: "", ageGroup: "", educationalGoal: "", safetyNotes: "",
      serviceType: "", inputFileType: "", outputFileType: "", estimatedDuration: "",
    };
    const normalized = { ...next, categoryId, categoryName: categoryLabels[categoryId] };
    const nextDrafts = { ...savedDrafts, [categoryId]: normalized };
    setCategoryDrafts(nextDrafts);
    setSpecifications(normalized);
    saveCategoryDrafts(nextDrafts);
    setIsCategoryPanelOpen(false);
  };

  const canConfirmSpecifications = Boolean(product.originalUploadedImage || product.currentPreviewImage || product.productMemoryImage)
    && Boolean(activeProductMemory)
    && Boolean(specifications.productType.trim())
    && Boolean(specifications.shape.trim());
  const confirmBlockers = {
    hasImage: Boolean(product.originalUploadedImage || product.currentPreviewImage || product.productMemoryImage),
    hasDraft: Boolean(activeProductMemory && specifications.productType.trim() && specifications.shape.trim()),
    hasRelation: Boolean(productRelation),
  };

  const handleConfirmSpecifications = async () => {
    if (!product.originalUploadedImage && !product.currentPreviewImage && !product.productMemoryImage) {
      setDimensionError("يجب ربط صورة حالية قبل تأكيد المواصفات.");
      return;
    }
    if (!activeProductMemory || !specifications.productType.trim() || !specifications.shape.trim()) {
      setDimensionError("لا توجد مواصفات مكتملة وجاهزة للتأكيد.");
      return;
    }
    const currentSpecificationDraft = structuredClone(specifications);
    const values = [currentSpecificationDraft.dimensions.length, currentSpecificationDraft.dimensions.width, currentSpecificationDraft.dimensions.height];
    if (values.some((value) => value !== null && (!Number.isFinite(value) || value <= 0))) {
      setDimensionError(t("studio.smartEditChat.dimensionError"));
      return;
    }
    setDimensionError("");
    if (activeProductMemory.dnaReference && !productRelation) {
      setIsDnaReferenceDecisionPending(true);
      return;
    }

    let memoryToConfirm = activeProductMemory;
    if (activeProductMemory.dnaReference && productRelation === "same-product-new-image") {
      memoryToConfirm = {
        ...activeProductMemory,
        productId: null,
        source: "uploaded-image",
        productRelation,
        originalImage: activeProductMemory.originalImage,
      };
      currentSpecificationDraft.id = activeProductMemory.memoryId;
    } else if (activeProductMemory.dnaReference && productRelation === "new-product-from-dna") {
      const draftId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `product-draft-${Date.now()}`;
      memoryToConfirm = {
        ...activeProductMemory,
        productId: null,
        draftId,
        productRelation,
        productDNA: { ...activeProductMemory.productDNA, id: draftId },
        originalImage: activeProductMemory.originalImage,
      };
      currentSpecificationDraft.id = draftId;
    }
    const saveResult = await saveConfirmedProductSpecifications(memoryToConfirm, currentSpecificationDraft, initialSpecificationsRef.current, participantId ?? sellerId);
    if (!saveResult.success || !saveResult.record) {
      setDimensionError("تعذر حفظ المواصفات محليًا. لم تفقد الصفحة عملها، ويمكنك إعادة المحاولة.");
      return;
    }
    const confirmedSpecifications = confirmedProductDNAToSpecifications(saveResult.record);
    onProductMemoryChange(saveResult.memory);
    const session = saveConfirmedOriginalProduct(confirmedSpecifications, product.originalImageUrl ?? product.currentPreviewImage ?? product.productMemoryImage ?? null);
    setWorkingSession(session);
    setSmartEditOptions(session.workingCopy.smartEditOptions);
    setIsDnaReferenceDecisionPending(false);
    setRequestConfirmed(false);
    setGenerationStatus("editing-request");
    setGenerationMessage(t("studio.smartEditChat.readyMessage"));
    setStage("ready-for-edit");
  };
  const submitRequest = () => {
    const normalized = request.trim();
    if (!normalized) return;
    setPendingRequest(normalized);
    setRequestConfirmed(false);
    setGenerationStatus("waiting-confirmation");
    setOperationStatus("confirming");
    setEchoGuideState("idle");
    setEchoGuideRecommendation(null);
    setEchoGuideFinalPrompt("");
    setEchoGuideError(null);
    setDecision(null);
    setDecisionError(null);
    setStage("edit-confirmation");
  };

  const updateSmartEditOptions = (next: SmartEditOptions) => {
    setSmartEditOptions(next);
    setWorkingSession((current) => current ? { ...current, workingCopy: { ...current.workingCopy, smartEditOptions: next } } : current);
    setRequestConfirmed(false);
    setGenerationError(null);
    setGenerationStatus("waiting-confirmation");
    setOperationStatus("confirming");
    setStage("edit-confirmation");
    setEchoGuideState("idle");
    setEchoGuideRecommendation(null);
    setEchoGuideFinalPrompt("");
    setEchoGuideError(null);
    setDecision(null);
    setDecisionError(null);
  };

  const hasRequestedEdit = Boolean(smartEditOptions.background || smartEditOptions.colors || smartEditOptions.lighting || smartEditOptions.shadows || smartEditOptions.improveQuality || pendingRequest.trim() || request.trim());
  const activeSourceImage = product.originalUploadedImage
    ?? product.currentPreviewImage
    ?? product.productMemoryImage
    ?? null;
  const activeSourcePriority = product.originalUploadedImage instanceof Blob
    ? "uploaded-image"
    : product.currentPreviewImage
      ? "current-preview"
      : "product-memory";
  const hasCurrentImage = activeSourceImage instanceof Blob || typeof activeSourceImage === "string";
  const canGenerate = hasCurrentImage && Boolean(workingSession?.original.confirmedOriginalProductDNA) && hasRequestedEdit && Boolean(echoGuideRecommendation) && Boolean(decision?.canExecute) && operationStatus !== "generating";

  const loadCurrentImageForGeneration = async () => {
    if (activeSourceImage instanceof Blob) return activeSourceImage;
    if (typeof activeSourceImage === "string") {
      try {
        const response = await fetch(activeSourceImage);
        if (response.ok) return await response.blob();
      } catch {
        // Report the current source failure; never fall through to Product Memory.
      }
      throw new Error("تعذر قراءة الصورة الحالية لإرسالها إلى محرك التوليد. لم يتم استخدام صورة Product Memory بدلاً منها.");
    }
    throw new Error(t("studio.smartEditChat.noOriginalImage"));
  };

  const echoGuideOperation: EchoGuideOperation = smartEditOptions.background?.mode === "transparent"
    ? "background-removal"
    : smartEditOptions.output?.purpose === "advertisement"
      ? "product-ad"
      : "image-edit";

  const analyzeExecutionDecision = async (guide = echoGuideRecommendation) => {
    if (!guide) { setDecisionError("أنشئ توصية Echo Guide أولًا."); return; }
    setDecisionLoading(true);
    setDecisionError(null);
    try {
      const response = await studioServerFetch("/api/decision-engine/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          productId: product.id || undefined,
          workspace,
          operation: guide.operation,
          userInstruction: pendingRequest || request.trim(),
          currentImageId: hasCurrentImage ? (product.id ? `${product.id}:current-image` : "studio-current-image") : undefined,
          echoGuideRecommendationId: guide.id,
          finalPrompt: echoGuideFinalPrompt || guide.finalPrompt,
        }),
      });
      const payload = await response.json() as { success?: boolean; decision?: DecisionResult; message?: string };
      if (!response.ok || !payload.success || !payload.decision) throw new Error(payload.message || "تعذر إنشاء قرار التنفيذ.");
      setDecision(payload.decision);
      recordDecisionSmartEdit({
        generationId: payload.decision.executionId,
        executionId: payload.decision.executionId,
        recommendationId: guide.id,
        decisionId: payload.decision.id,
        provider: payload.decision.provider,
        plan: payload.decision.plan,
        workspace,
        tool: "smart-edit",
        productId: product.id || undefined,
        participantId,
        sellerId,
        operation: guide.operation,
        userInstruction: pendingRequest || request.trim(),
        finalPrompt: echoGuideFinalPrompt || guide.finalPrompt,
        model: guide.suggestedModel,
        quality: guide.suggestedQuality,
        size: guide.suggestedSize,
        estimatedCost: payload.decision.estimatedCostUsd,
        original: { source: activeSourcePriority },
      }, payload.decision.provider === "blocked");
    } catch (error) {
      setDecision(null);
      setDecisionError(error instanceof Error ? error.message : "تعذر إنشاء قرار التنفيذ.");
    } finally {
      setDecisionLoading(false);
    }
  };

  const createGuideRecommendation = async () => {
    if (!hasRequestedEdit) { setEchoGuideError(t("studio.smartEditChat.appearanceQuestion")); return; }
    setEchoGuideState("loading-context");
    setEchoGuideError(null);
    try {
      const response = await studioServerFetch("/api/echo-guide/recommend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          productId: product.id || undefined,
          workspace,
          operation: echoGuideOperation,
          userInstruction: pendingRequest || request.trim(),
          currentImageId: product.id ? `${product.id}:current-image` : "studio-current-image",
        }),
      });
      const payload = await response.json() as { success?: boolean; recommendation?: EchoGuideRecommendation; message?: string };
      if (!response.ok || !payload.success || !payload.recommendation) throw new Error(payload.message || "تعذر إنشاء توصية Echo Guide.");
      setEchoGuideRecommendation(payload.recommendation);
      setEchoGuideFinalPrompt(payload.recommendation.finalPrompt);
      setRequestConfirmed(false);
      setEchoGuideState("recommendation-ready");
      setDecision(null);
      await analyzeExecutionDecision(payload.recommendation);
    } catch (error) {
      setEchoGuideState("error");
      setEchoGuideError(error instanceof Error ? error.message : "تعذر إنشاء توصية Echo Guide.");
    }
  };

  const handleGenerate = async (guide = echoGuideRecommendation, executionDecision = decision) => {
    if (!hasCurrentImage) { setGenerationError(t("studio.smartEditChat.noOriginalImage")); return; }
    if (!workingSession) { setGenerationError(t("studio.smartEditChat.confirmSpecifications")); return; }
    if (!hasRequestedEdit) { setGenerationError(t("studio.smartEditChat.appearanceQuestion")); return; }
    if (!guide || !echoGuideFinalPrompt.trim()) { setGenerationError("أنشئ توصية Echo Guide واعتمدها أولًا."); return; }
    if (!executionDecision?.canExecute) { setGenerationError(executionDecision?.reasonText ?? "يجب اعتماد قرار تنفيذ قابل للتنفيذ أولًا."); return; }
    const approvedGuide = { ...guide, finalPrompt: echoGuideFinalPrompt.trim() };
    setEchoGuideRecommendation(approvedGuide);
    setRequestConfirmed(true);
    setEchoGuideState("executing");
    setGenerationStatus("generating");
    updateSmartEditHistoryStatus(executionDecision.executionId, "executing");
    setOperationStatus("generating");
    const isTransparentBackground = smartEditOptions.background?.mode === "transparent" && executionDecision.provider === "local";
    setGenerationMessage(isTransparentBackground ? t("studio.smartEditChat.transparentGenerating") : t("studio.smartEditChat.generating"));
    setGenerationError(null);
    setGenerationSourceMetadata(null);
    try {
      const currentImage = await loadCurrentImageForGeneration();
      const result = await executeDecision(executionDecision, {
        sourceImage: currentImage,
        productDNA: workingSession.original.confirmedOriginalProductDNA,
        options: smartEditOptions,
        instruction: approvedGuide.finalPrompt,
        role: echoUserRole,
        background: smartEditOptions.background?.mode ?? "original",
        outputFormat: "png",
        preserveProduct: true,
        preserveWick: true,
        sourcePriority: activeSourcePriority,
        workspace,
        tool: "smart-edit",
        productId: product.id || undefined,
        participantId,
        sellerId,
        originalSource: activeSourcePriority,
        userInstruction: pendingRequest || request.trim(),
        echoGuideRecommendationId: approvedGuide.id,
        model: approvedGuide.suggestedModel,
        quality: approvedGuide.suggestedQuality,
        size: approvedGuide.suggestedSize,
        ratio: approvedGuide.suggestedRatio,
      });
      if (result.status === "provider_not_connected") {
        setGenerationStatus("provider-not-connected");
        setOperationStatus("error");
        setGenerationError(result.message ?? t("studio.smartEditChat.generationUnavailable"));
        setGenerationMessage("");
        setEchoGuideState("error");
        return;
      }
      if (!result.success) throw new Error(result.message ?? t("studio.smartEditChat.generationUnavailable"));
      if (!result.imageBase64) throw new Error("وصل الطلب إلى المحرك، لكنه لم يرجع صورة.");
      if (isTransparentBackground && (result.mimeType !== "image/png" || result.outputFormat !== "png" || result.background !== "transparent" || !result.hasAlpha)) {
        throw new Error(t("studio.smartEditChat.transparentInvalidResult"));
      }
      if (activeSourcePriority === "uploaded-image" && result.sourceUsed !== "original-upload") {
        throw new Error("تم إيقاف النتيجة لأن المحرك لم يستخدم الصورة الحالية.");
      }
      if (!result.sourceUsed) throw new Error("لم يؤكد الخادم مصدر الصورة المستخدمة. لم يتم عرض النتيجة.");
      const imageUrl = `data:image/png;base64,${result.imageBase64}`;
      const requiresPaidLedger = executionDecision.provider === "openai" || executionDecision.provider === "hybrid";
      if (!result.generationId || !result.costRecordId || (requiresPaidLedger && !result.ledgerEntryId)) {
        throw new Error("اكتملت الصورة، لكن سجل التكلفة أو القيد المالي لم يكتمل. لم يتم عرض النتيجة.");
      }
      setGenerationId(result.generationId);
      setGeneratedImageUrl(imageUrl);
      setGenerationSourceMetadata({ sourceUsed: result.sourceUsed, background: result.background ?? "", preservedFeatures: result.preservedFeatures ?? [] });
      setActivePreview("generated");
      onPreviewChange(imageUrl, "generated");
      setGenerationStatus("generated");
      setOperationStatus("success");
      setEchoGuideState("result-ready");
      setGenerationMessage(isTransparentBackground ? t("studio.smartEditChat.transparentSuccess") : "");
    } catch (error) {
      setGenerationStatus("failed");
      setOperationStatus("error");
      setGenerationMessage("");
      setGenerationError(error instanceof Error ? error.message : t("studio.smartEditChat.generationUnavailable"));
      setEchoGuideState("error");
    }
  };

  const editOriginalSpecifications = () => {
    if (!workingSession) return;
    const editable = structuredClone(workingSession.original.confirmedOriginalProductDNA);
    setSpecifications(editable);
    setCategoryDrafts((current) => ({ ...current, [editable.categoryId]: editable }));
    setStage("product-confirmation");
    setGenerationStatus("idle");
    setOperationStatus("idle");
    setGenerationMessage("");
    setRequestConfirmed(false);
    setEchoGuideState("idle");
    setEchoGuideRecommendation(null);
    setEchoGuideFinalPrompt("");
    setDecision(null);
    setDecisionError(null);
  };

  const cancelGenerationRequest = () => {
    if (decision) updateSmartEditHistoryStatus(decision.executionId, "cancelled");
    const reset: SmartEditOptions = { preserveShape: true, preserveDetails: true, improveQuality: false };
    setSmartEditOptions(reset);
    setWorkingSession((current) => current ? { ...current, workingCopy: { ...current.workingCopy, smartEditOptions: reset } } : current);
    setRequest("");
    setPendingRequest("");
    setActiveOptionPanel(null);
    setRequestConfirmed(false);
    setGenerationStatus("editing-request");
    setOperationStatus("idle");
    setStage("ready-for-edit");
    setEchoGuideState("idle");
    setEchoGuideRecommendation(null);
    setEchoGuideFinalPrompt("");
    setEchoGuideError(null);
    setDecision(null);
    setDecisionError(null);
  };

  const applyQuickAction = (action: "professionalBackground" | "improveLighting" | "reduceShadows" | "preserveShape" | "advertisement" | "reviewQuality") => {
    const next: SmartEditOptions = action === "professionalBackground"
      ? { ...smartEditOptions, background: { mode: "white" }, lighting: { mode: "soft-studio", strength: 70 } }
      : action === "improveLighting" ? { ...smartEditOptions, lighting: { mode: "soft-studio", strength: 70 } }
      : action === "reduceShadows" ? { ...smartEditOptions, shadows: { mode: "reduce", strength: 60 } }
      : action === "preserveShape" ? { ...smartEditOptions, preserveShape: true, preserveDetails: true }
      : action === "advertisement" ? { ...smartEditOptions, output: { purpose: "advertisement", aspectRatio: "1:1" } }
      : { ...smartEditOptions, improveQuality: true };
    updateSmartEditOptions(next);
  };

  const acceptGeneratedResult = async () => {
    if (!generatedImageUrl || !workingSession || !activeProductMemory || generationStatus !== "generated") return;
    setEchoGuideState("accepting");
    try {
      assertAcceptedResultOwnership(product.id, {
        workspace,
        decisionId: decision?.id,
        executionId: decision?.executionId,
        provider: decision?.provider,
      }, { participantId, sellerId });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "تعذر التحقق من ملكية نتيجة التعديل.");
      setEchoGuideState("error");
      return;
    }
    const acceptedAt = new Date().toISOString();
    const acceptedDNA = {
      ...activeProductMemory.productDNA,
      smartEditProfile: {
        successfulSettings: structuredClone(smartEditOptions) as Record<string, unknown>,
        quality: "accepted" as const,
        preserveWick: workingSession.original.confirmedOriginalProductDNA.hasWick,
        preserveExactShape: smartEditOptions.preserveShape,
        avoidStrongShadow: smartEditOptions.shadows?.mode === "reduce",
        preferredLighting: smartEditOptions.lighting?.mode,
        preferredBackground: smartEditOptions.background?.mode,
        preferredRatio: smartEditOptions.output?.aspectRatio,
        preferredQuality: echoGuideRecommendation?.suggestedQuality,
        preferredProvider: decision && (decision.provider === "local" || decision.provider === "openai" || decision.provider === "hybrid") ? decision.provider : undefined,
        acceptedWorkflow: decision?.plan.map((step) => `${step.provider}:${step.action}`),
        protectedFeatures: echoGuideRecommendation?.preserve,
        composition: smartEditOptions.output?.purpose,
        updatedAt: acceptedAt,
      },
    };
    const memoryWithAcceptedDNA = { ...activeProductMemory, productDNA: acceptedDNA, updatedAt: acceptedAt };
    const variantResult = addAcceptedGeneratedVariant(memoryWithAcceptedDNA, generatedImageUrl, {
      name: `echo-smart-edit-${Date.now()}.png`,
      type: "image/png",
    });
    if (!variantResult.saved) {
      setGenerationError("تعذر حفظ النتيجة كنسخة Product Variant جديدة. بقيت النسخة الأصلية دون تغيير.");
      setEchoGuideState("error");
      return;
    }
    onProductMemoryChange(variantResult.memory);
    if (variantResult.memory.productId) {
      const dnaSaved = await saveProductDNAToPrimaryStore(acceptedDNA);
      if (!dnaSaved) {
        setGenerationError("تم اعتماد النسخة محليًا، لكن تعذر تحديث Product DNA في سجل المنتج الرئيسي.");
      }
    }
    await saveAcceptedVisualPreference(product.id, workingSession.original.confirmedOriginalProductDNA, smartEditOptions, pendingRequest || request.trim(), echoUserRole, {
      workspace,
      recommendationId: echoGuideRecommendation?.id,
      finalPrompt: echoGuideFinalPrompt,
      model: echoGuideRecommendation?.suggestedModel,
      quality: echoGuideRecommendation?.suggestedQuality,
      size: echoGuideRecommendation?.suggestedSize,
      decisionId: decision?.id,
      executionId: decision?.executionId,
      provider: decision?.provider,
    }, { participantId, sellerId });
    if (generationId) updateSmartEditHistoryStatus(generationId, "accepted", { participantId: participantId ?? sellerId, productId: product.id });
    setGenerationStatus("generated");
    setGenerationMessage(t("studio.smartEditChat.resultAccepted"));
    setStage("confirmed");
    setEchoGuideState("accepted");
  };

  const showOriginalResult = () => {
    const originalUrl = product.originalImageUrl ?? workingSession?.original.originalImageSource;
    if (!originalUrl) return;
    setActivePreview("original");
  };

  const showGeneratedResult = () => {
    if (!generatedImageUrl) return;
    setActivePreview("generated");
  };

  const rejectGeneratedResult = () => {
    setEchoGuideState("rejecting");
    const originalUrl = product.originalImageUrl ?? workingSession?.original.originalImageSource;
    if (originalUrl) onPreviewChange(originalUrl, "original");
    showOriginalResult();
    setGeneratedImageUrl(null);
    setGenerationSourceMetadata(null);
    setRequestConfirmed(false);
    setGenerationStatus("editing-request");
    setOperationStatus("idle");
    setGenerationMessage("");
    setGenerationError(null);
    if (generationId) updateSmartEditHistoryStatus(generationId, "rejected", { participantId: participantId ?? sellerId, productId: product.id });
    setGenerationId(null);
    setEchoGuideState("rejected");
  };

  const downloadGeneratedResult = () => {
    if (!generatedImageUrl) return;
    const anchor = document.createElement("a");
    anchor.href = generatedImageUrl;
    anchor.download = `echo-smart-edit-${Date.now()}.png`;
    anchor.click();
  };

  const echoSummary = workingSession ? buildEchoConfirmationSummary({ productDNA: workingSession.original.confirmedOriginalProductDNA, smartEditOptions, userInstruction: pendingRequest || request.trim() }) : null;
  const requestSummary = echoSummary ? `${t("studio.smartEditChat.requestSummary")} ${echoSummary.changes.join(" · ")}` : t("studio.smartEditChat.requestSummary");

  return (
    <section
      ref={panelRef}
      id="echo-smart-edit-chat"
      className={`smartEditChat${isMinimized ? " smartEditChat--minimized" : ""}${isDragging ? " smartEditChat--dragging" : ""}${isCategoryPanelOpen ? " smartEditChat--categories-open" : ""}`}
      style={{ "--smart-edit-x": `${position.x}px`, "--smart-edit-y": `${position.y}px` } as CSSProperties}
      role="dialog"
      aria-modal="false"
      aria-labelledby="echo-smart-edit-chat-title"
    >
      <div className="smartEditChat__header" onPointerDown={startDrag} onPointerMove={drag} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
        <span className="smartEditChat__drag" aria-label={t("studio.smartEditChat.drag")}><GripVertical size={18} aria-hidden="true" /></span>
        <h2 id="echo-smart-edit-chat-title"><Sparkles size={18} aria-hidden="true" />{t("studio.smartEditChat.title")}</h2>
        <div className="smartEditChat__windowActions">
          {stage === "product-confirmation" && <button type="button" className="smartEditChat__productsButton" aria-expanded={isProductPickerOpen} onClick={() => setIsProductPickerOpen((current) => !current)}><Package size={17} /><span>{t("studio.smartEditChat.products")}</span></button>}
          <button type="button" aria-label={t("studio.smartEditChat.minimize")} onClick={() => setIsMinimized((current) => !current)}><Minus size={17} /></button>
          <button ref={closeRef} type="button" aria-label={t("studio.smartEditChat.close")} onClick={onClose}><X size={17} /></button>
        </div>
      </div>

      {!isMinimized && <div className="smartEditChat__body">
        <ProductMemoryPicker open={isProductPickerOpen} onClose={() => setIsProductPickerOpen(false)} onSelect={(selectedProduct) => {
          setIsProductPickerOpen(false);
          setProductRelation(null);
          setIsDnaReferenceDecisionPending(false);
          setDimensionError("");
          const mode = onSelectProduct(selectedProduct);
          setProductSelectionMessage(mode === "apply-dna-to-current-image"
            ? "تم تطبيق جينات ومواصفات المنتج المختار على الصورة الحالية. بقيت الصورة المرفوعة دون تغيير."
            : "تم فتح المنتج المحفوظ مع صورته ومواصفاته.");
        }} />
        {!activeProductMemory ? <EmptyProductMemoryState onChooseProduct={() => setIsProductPickerOpen(true)} onUploadImage={onRequestUpload} /> : <>
        {productSelectionMessage && <p className="smartEditMemorySuggestion" role="status">{productSelectionMessage}</p>}
        {isCategoryPanelOpen && <ProductCategoryPanel activeCategory={specifications.categoryId} labels={categoryLabels} closeLabel={t("studio.smartEditChat.close")} onSelect={selectCategory} onClose={() => setIsCategoryPanelOpen(false)} />}
        <SmartEditMessages>
          {stage === "product-confirmation" && <div className="smartEditMessage smartEditMessage--echo"><p>{t("studio.smartEditChat.intro")}</p></div>}
          {stage === "product-confirmation" && <>
            {activeProductMemory.analysis.status === "analyzing" && <div className="smartEditMemorySuggestion" role="status"><strong>يحلل Echo بيانات الصورة المتاحة…</strong></div>}
            {activeProductMemory.analysis.status === "suggested" && !activeProductMemory.dnaReference && <div className="smartEditMemorySuggestion" role="status"><strong>Echo اقترح هذه المواصفات من الصورة.</strong><p>يرجى تأكيدها أو تصحيحها. لا يمكن تحديد الأبعاد الحقيقية بدقة من الصورة وحدها؛ أدخل المقاسات يدويًا أو أضف مرجع قياس.</p></div>}
            {activeProductMemory.analysis.status === "failed" && <div className="smartEditMemorySuggestion" role="alert"><strong>تعذر تحليل الصورة محليًا.</strong><p>يمكنك إدخال المواصفات يدويًا، ولن تُستخدم أي بيانات من منتج سابق.</p></div>}
            <div className="smartEditCurrentCategory"><strong>{t("studio.smartEditChat.currentCategory")}:</strong><span>{specifications.categoryName}</span><button type="button" onClick={() => setIsCategoryPanelOpen(true)}>{t("studio.smartEditChat.changeCategory")}</button></div>
            <ProductSpecificationsCard specifications={specifications} fields={categorySpecificationSchema[specifications.categoryId]} labels={specificationLabels} yes={t("studio.smartEditChat.yes")} no={t("studio.smartEditChat.no")} onChange={updateSpecifications} />
            {dimensionError && <p className="smartEditFieldError" role="alert">{dimensionError}</p>}
            {isDnaReferenceDecisionPending && <div className="smartEditMemorySuggestion" role="group" aria-label="تحديد علاقة الصورة بالمنتج">
              <strong>هل هذه الصورة صورة جديدة لنفس المنتج، أم منتج جديد مبني على نفس DNA؟</strong>
              <div className="smartEditChat__actions">
                <button
                  type="button"
                  aria-pressed={productRelation === "same-product-new-image"}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); setProductRelation("same-product-new-image"); }}
                >صورة جديدة لنفس المنتج</button>
                <button
                  type="button"
                  aria-pressed={productRelation === "new-product-from-dna"}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); setProductRelation("new-product-from-dna"); }}
                >منتج جديد مبني على نفس DNA</button>
              </div>
              <div className="smartEditChat__actions">
                <button
                  type="button"
                  disabled={!canConfirmSpecifications || !productRelation}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => { event.stopPropagation(); void handleConfirmSpecifications(); }}
                >{t("studio.smartEditChat.confirmSpecifications")}</button>
                <button type="button" onClick={() => { setProductRelation(null); setIsDnaReferenceDecisionPending(false); }}>إلغاء</button>
              </div>
            </div>}
            {!isDnaReferenceDecisionPending && <div className="smartEditChat__actions">
              <button
                type="button"
                disabled={!canConfirmSpecifications}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => { event.stopPropagation(); void handleConfirmSpecifications(); }}
              >{t("studio.smartEditChat.confirmSpecifications")}</button>
              <button type="button" onClick={onClose}>{t("studio.smartEditChat.cancel")}</button>
            </div>}
            {process.env.NODE_ENV === "development" && ((!canConfirmSpecifications) || (isDnaReferenceDecisionPending && !productRelation)) && <div className="smartEditDebug" role="status">
              <strong>لم يكتمل التأكيد:</strong>
              <ul>
                <li>الصورة: {confirmBlockers.hasImage ? "جاهزة" : "غير جاهزة"}</li>
                <li>المواصفات: {confirmBlockers.hasDraft ? "جاهزة" : "غير جاهزة"}</li>
                {isDnaReferenceDecisionPending && <li>نوع العلاقة: {confirmBlockers.hasRelation ? "محدد" : "غير محدد"}</li>}
              </ul>
            </div>}
          </>}
          {stage !== "product-confirmation" && <>
            <div className="smartEditOriginalSaved" role="status"><span>{t("studio.smartEditChat.originalSaved")}</span><button type="button" onClick={editOriginalSpecifications}>{t("studio.smartEditChat.editOriginalSpecifications")}</button></div>
            <section className="smartEditPromptSection">
              <div className="echoGuideIntro"><strong>{t("studio.smartEditChat.echoGuideTitle")}</strong><p>{t("studio.smartEditChat.echoGuideIntro")}</p></div>
              <EchoGuideQuickActions labels={{ professionalBackground: t("studio.smartEditChat.quickActions.professionalBackground"), improveLighting: t("studio.smartEditChat.quickActions.improveLighting"), reduceShadows: t("studio.smartEditChat.quickActions.reduceShadows"), preserveShape: t("studio.smartEditChat.quickActions.preserveShape"), advertisement: t("studio.smartEditChat.quickActions.advertisement"), reviewQuality: t("studio.smartEditChat.quickActions.reviewQuality") }} onAction={applyQuickAction} />
              <h3>{t("studio.smartEditChat.appearanceQuestion")}</h3>
              <SmartEditOptionButtons
                labels={{ background: t("studio.smartEditChat.backgroundOption"), colors: t("studio.smartEditChat.colorsOption"), lighting: t("studio.smartEditChat.lightingOption"), shadows: t("studio.smartEditChat.shadowsOption"), preserveShape: t("studio.smartEditChat.preserveShapeOption"), quality: t("studio.smartEditChat.improveQualityOption") }}
                active={activeOptionPanel}
                onToggle={(panel) => setActiveOptionPanel((current) => current === panel ? null : panel)}
                preserveShape={smartEditOptions.preserveShape}
                improveQuality={smartEditOptions.improveQuality}
                lightingActive={Boolean(smartEditOptions.lighting)}
                shadowsActive={Boolean(smartEditOptions.shadows)}
                onTogglePreserveShape={() => updateSmartEditOptions({ ...smartEditOptions, preserveShape: !smartEditOptions.preserveShape })}
                onToggleQuality={() => updateSmartEditOptions({ ...smartEditOptions, improveQuality: !smartEditOptions.improveQuality })}
                onToggleLighting={() => updateSmartEditOptions({ ...smartEditOptions, lighting: smartEditOptions.lighting ? undefined : { mode: "soft-studio", strength: 70 } })}
                onToggleShadows={() => updateSmartEditOptions({ ...smartEditOptions, shadows: smartEditOptions.shadows ? undefined : { mode: "reduce", strength: 60 } })}
              />
              {activeOptionPanel === "background" && <BackgroundOptionsPanel
                value={smartEditOptions.background}
                labels={backgroundLabels}
                customColor={customBackgroundColor}
                onChange={(background) => updateSmartEditOptions({ ...smartEditOptions, background })}
                onCustomColor={(value) => { setCustomBackgroundColor(value); updateSmartEditOptions({ ...smartEditOptions, background: { mode: "custom", customColor: value } }); }}
              />}
              {activeOptionPanel === "colors" && <ColorOptionsPanel
                value={smartEditOptions.colors}
                labels={colorLabels}
                customColor={customProductColor}
                onChange={(colors) => updateSmartEditOptions({ ...smartEditOptions, colors })}
                onCustomColor={(value) => { setCustomProductColor(value); updateSmartEditOptions({ ...smartEditOptions, colors: { mode: "custom", customColor: value } }); }}
              />}
            </section>
            {hasRequestedEdit && <SmartEditRequestSummary
              summary={requestSummary}
              changes={echoSummary?.changes}
              protectedItems={echoSummary?.protectedProperties}
              purpose={echoSummary?.purpose}
              aspectRatio={echoSummary?.aspectRatio}
              confirmLabel={t("studio.smartEditChat.confirmRequest")}
              editLabel={t("studio.smartEditChat.modifyGeneration")}
              cancelLabel={t("studio.smartEditChat.cancelGeneration")}
              disabled={false}
              busy={generationStatus === "generating"}
              onConfirm={() => void createGuideRecommendation()}
              onEdit={() => { setRequestConfirmed(false); setEchoGuideState("idle"); setEchoGuideRecommendation(null); setEchoGuideFinalPrompt(""); setDecision(null); setDecisionError(null); setStage("ready-for-edit"); setGenerationStatus("editing-request"); setOperationStatus("idle"); }}
              onCancel={cancelGenerationRequest}
            />}
            {hasRequestedEdit && <EchoGuidePanel
              state={echoGuideState}
              recommendation={echoGuideRecommendation}
              finalPrompt={echoGuideFinalPrompt}
              error={echoGuideError}
              onFinalPromptChange={(value) => { setEchoGuideFinalPrompt(value); setRequestConfirmed(false); setDecision(null); }}
              onCreate={() => void createGuideRecommendation()}
              onApprove={() => void analyzeExecutionDecision()}
              onCancel={cancelGenerationRequest}
            />}
            {echoGuideRecommendation && <DecisionEnginePanel
              decision={decision}
              loading={decisionLoading}
              executing={operationStatus === "generating"}
              error={decisionError}
              onAnalyze={() => void analyzeExecutionDecision()}
              onExecute={() => void handleGenerate()}
              onEdit={() => { setDecision(null); setDecisionError(null); setStage("ready-for-edit"); }}
              onCancel={cancelGenerationRequest}
            />}
            {echoGuideRecommendation && !canGenerate && operationStatus !== "generating" && <p className="smartEditFieldError" role="status">{!hasCurrentImage ? t("studio.smartEditChat.noOriginalImage") : !workingSession ? t("studio.smartEditChat.confirmSpecifications") : t("studio.smartEditChat.appearanceQuestion")}</p>}
            {generationMessage && <p className={`smartEditGenerationStatus smartEditGenerationStatus--${generationStatus}`} role="status">{generationMessage}</p>}
            {generationError && <p className="smartEditFieldError" role="alert">{generationError}</p>}
            {generationSourceMetadata && <div className="smartEditMemorySuggestion" role="status">
              <p>المصدر المستخدم: {generationSourceMetadata.sourceUsed === "original-upload" ? "الصورة المرفوعة الحالية" : generationSourceMetadata.sourceUsed === "current-preview" ? "المعاينة الحالية" : "صورة Product Memory"}</p>
              <p>الخلفية: {generationSourceMetadata.background === "transparent" ? "شفافة" : generationSourceMetadata.background}</p>
              <p>اللون محفوظ: {generationSourceMetadata.preservedFeatures.some((feature) => feature.endsWith(" color")) ? "نعم" : "غير مؤكد"}</p>
              <p>الفتيل محفوظ: {generationSourceMetadata.preservedFeatures.includes("wick") ? "نعم" : "غير مؤكد"}</p>
            </div>}
            {generatedImageUrl && (product.originalImageUrl || workingSession?.original.originalImageSource) && <BeforeAfterPreview
              originalUrl={(product.originalImageUrl ?? workingSession?.original.originalImageSource)!}
              resultUrl={generatedImageUrl}
              activePreview={activePreview}
              comparing={isComparingResult}
              labels={{ compare: t("studio.smartEditChat.compareBeforeAfter"), showOriginal: t("studio.smartEditChat.showOriginal"), showResult: t("studio.smartEditChat.showResult"), modify: t("studio.smartEditChat.modifyGeneration"), retry: t("studio.smartEditChat.retryGeneration"), accept: t("studio.smartEditChat.acceptResult"), reject: t("studio.smartEditChat.rejectResult"), download: t("studio.smartEditChat.downloadResult") }}
              onCompare={setIsComparingResult}
              onShowOriginal={showOriginalResult}
              onShowResult={showGeneratedResult}
              onModify={() => { setRequestConfirmed(false); setGenerationStatus("editing-request"); setOperationStatus("idle"); setStage("ready-for-edit"); }}
              onRetry={() => void handleGenerate()}
              onAccept={acceptGeneratedResult}
              onReject={rejectGeneratedResult}
              onDownload={downloadGeneratedResult}
            />}
            {process.env.NODE_ENV === "development" && <details className="smartEditDebug"><summary>Smart Edit State</summary><pre>{JSON.stringify({ activeProductMemory, learningEchoProductDNA: loadConfirmedProductDNALearning(), dimensions: workingSession?.original.confirmedOriginalProductDNA.dimensions ?? specifications.dimensions, requestConfirmed, generationStatus, operationStatus, intent: detectEchoIntent(pendingRequest || request, echoUserRole), role: echoUserRole, capabilities: echoCapabilities }, null, 2)}</pre><button type="button" onClick={() => { if (clearSmartEditExperimentData()) setGenerationMessage("تم مسح بيانات التجربة المحلية."); else setGenerationError("تعذر مسح بيانات التجربة المحلية."); }}>مسح بيانات التجربة</button></details>}
          </>}
        </SmartEditMessages>
        <SmartEditComposer value={request} placeholder={t("studio.smartEditChat.appearanceQuestion")} sendLabel={t("studio.smartEditChat.send")} disabled={stage === "product-confirmation" || generationStatus === "generating"} onChange={(value) => { setRequest(value); setRequestConfirmed(false); setGenerationStatus("editing-request"); }} onSubmit={submitRequest} />
        </>}
      </div>}
    </section>
  );
}

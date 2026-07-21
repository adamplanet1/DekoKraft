import { buildEchoImagePrompt } from "../../../lib/echo/buildEchoImagePrompt";
import type { EchoUserRole, SmartEditOptions } from "../../../lib/echo/echoGuide";
import type { SmartProductSpecifications } from "../../../lib/echo/echoProductDNA";
import { removeBackgroundPreservingSource } from "../../../lib/echo/removeBackgroundPreservingSource";
import { recordSmartEditAccounting } from "../../../lib/smart-edit/ExecutionAccounting";
import { isWorkspaceId, WORKSPACE_TOOL_IDS, type WorkspaceToolId } from "../../studio/engine/workspaceTypes";
import { SMART_EDIT_IMAGE_ESTIMATE_USD } from "../../../lib/echo-guide/pricing";
import { isExecutionProvider, type DecisionPlanStep } from "../../../lib/decision-engine/types";
import { buildEchoGuideRequest } from "../../../lib/echo-guide/buildContext";
import { createEchoGuideRecommendation } from "../../../lib/echo-guide/createRecommendation";
import { decideExecution } from "../../../lib/decision-engine/decideExecution";
import { getSellerProduct, sellerProducts } from "../../data/sellerProducts";
import { ParticipantAccessError, participantAccessResponse, resolveRequestParticipantId } from "../../../lib/auth/participantAccess";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const roles = new Set<EchoUserRole>(["artisan", "visitor", "admin"]);

function isPngWithAlphaChannel(imageBase64: string) {
  try {
    const bytes = Buffer.from(imageBase64, "base64");
    const pngSignature = "89504e470d0a1a0a";
    if (bytes.length < 33 || bytes.subarray(0, 8).toString("hex") !== pngSignature) return false;
    const colorType = bytes[25];
    const hasDirectAlpha = colorType === 4 || colorType === 6;
    const hasTransparencyChunk = bytes.includes(Buffer.from("tRNS", "ascii"));
    return hasDirectAlpha || hasTransparencyChunk;
  } catch {
    return false;
  }
}

function parseJson<T>(value: FormDataEntryValue | null): T | null {
  if (typeof value !== "string") return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const formData = await request.formData();
  const sourceImage = formData.get("sourceImage");
  const productDNA = parseJson<SmartProductSpecifications>(formData.get("productDNA"));
  const editSettings = parseJson<SmartEditOptions>(formData.get("editSettings"));
  const instruction = typeof formData.get("instruction") === "string" ? String(formData.get("instruction")) : "";
  const userInstruction = typeof formData.get("userInstruction") === "string" ? String(formData.get("userInstruction")) : "";
  const roleValue = formData.get("role");
  const role = typeof roleValue === "string" && roles.has(roleValue as EchoUserRole) ? roleValue as EchoUserRole : null;
  const requestedBackground = formData.get("background");
  const outputFormat = formData.get("outputFormat");
  const preserveProduct = formData.get("preserveProduct") === "true";
  const preserveWick = formData.get("preserveWick") === "true";
  const sourcePriority = formData.get("sourcePriority");
  const productMemoryImage = formData.get("productMemoryImage");
  const workspaceValue = formData.get("workspace");
  const toolValue = formData.get("tool");
  const productId = typeof formData.get("productId") === "string" ? String(formData.get("productId")) : undefined;
  const requestedParticipantId = typeof formData.get("participantId") === "string" ? String(formData.get("participantId")) : typeof formData.get("sellerId") === "string" ? String(formData.get("sellerId")) : undefined;
  let participantId: string | undefined;
  try { participantId = await resolveRequestParticipantId(requestedParticipantId); }
  catch (error) { return participantAccessResponse(error); }
  const sellerId = participantId;
  const echoGuideRecommendationId = typeof formData.get("echoGuideRecommendationId") === "string" ? String(formData.get("echoGuideRecommendationId")) : "";
  const recommendedModel = typeof formData.get("recommendedModel") === "string" ? String(formData.get("recommendedModel")) : "";
  const quality = typeof formData.get("quality") === "string" ? String(formData.get("quality")) : undefined;
  const size = typeof formData.get("size") === "string" ? String(formData.get("size")) : undefined;
  const ratio = typeof formData.get("ratio") === "string" ? String(formData.get("ratio")) : undefined;
  const requestedExecutionId = typeof formData.get("executionId") === "string" ? String(formData.get("executionId")) : "";
  const decisionId = typeof formData.get("decisionId") === "string" ? String(formData.get("decisionId")) : "";
  const executionProviderValue = formData.get("executionProvider");
  const executionPlan = parseJson<DecisionPlanStep[]>(formData.get("executionPlan"));
  const generationId = requestedExecutionId || crypto.randomUUID();
  const hasOriginalUploadedImage = sourcePriority === "uploaded-image" && sourceImage instanceof File && sourceImage.size > 0;
  const hasProductMemoryImage = productMemoryImage instanceof File && productMemoryImage.size > 0;
  const sourceUsed = sourcePriority === "uploaded-image"
    ? "original-upload"
    : sourcePriority === "current-preview"
      ? "current-preview"
      : "product-memory";

  if (!(sourceImage instanceof File) || sourceImage.size === 0) return Response.json({ success: false, status: "failed", message: "الصورة الحالية sourceImage مطلوبة للتعديل." }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.has(sourceImage.type)) return Response.json({ success: false, status: "failed", message: "نوع الصورة الحالية غير مدعوم." }, { status: 415 });
  if (sourceImage.size > MAX_IMAGE_SIZE) return Response.json({ success: false, status: "failed", message: "حجم الصورة الحالية يتجاوز 12MB." }, { status: 413 });
  if (hasProductMemoryImage) return Response.json({ success: false, status: "failed", message: "لا يُسمح بإرسال صورة Product Memory مع طلب Smart Edit." }, { status: 400 });
  if (!(["uploaded-image", "current-preview", "product-memory"] as const).includes(sourcePriority as "uploaded-image" | "current-preview" | "product-memory")) return Response.json({ success: false, status: "failed", message: "أولوية مصدر الصورة غير صالحة." }, { status: 400 });
  if (!productDNA?.categoryId || !productDNA.productType) return Response.json({ success: false, status: "failed", message: "يجب تأكيد Product DNA أولًا." }, { status: 400 });
  if (!editSettings || !role) return Response.json({ success: false, status: "failed", message: "بيانات الطلب غير صالحة." }, { status: 400 });
  if (requestedBackground !== (editSettings.background?.mode ?? "original")) return Response.json({ success: false, status: "failed", message: "قيمة الخلفية المرسلة لا تطابق طلب التعديل المؤكد." }, { status: 400 });
  if (outputFormat !== "png") return Response.json({ success: false, status: "failed", message: "صيغة إخراج Smart Edit يجب أن تكون PNG." }, { status: 400 });
  if (!preserveProduct) return Response.json({ success: false, status: "failed", message: "يجب تفعيل حماية شكل المنتج قبل التوليد." }, { status: 400 });
  if (!preserveWick) return Response.json({ success: false, status: "failed", message: "يجب تفعيل حماية الفتيل قبل التوليد." }, { status: 400 });
  if (!isWorkspaceId(workspaceValue)) return Response.json({ success: false, status: "failed", message: "مساحة العمل غير صالحة." }, { status: 400 });
  if (typeof toolValue !== "string" || !WORKSPACE_TOOL_IDS.includes(toolValue as WorkspaceToolId)) return Response.json({ success: false, status: "failed", message: "أداة مساحة العمل غير صالحة." }, { status: 400 });
  if (!echoGuideRecommendationId || !recommendedModel) return Response.json({ success: false, status: "failed", message: "يجب اعتماد توصية Echo Guide قبل التنفيذ." }, { status: 400 });
  if (!requestedExecutionId || !decisionId || !isExecutionProvider(executionProviderValue) || executionProviderValue === "blocked" || executionProviderValue === "manual-review") return Response.json({ success: false, status: "failed", message: "قرار التنفيذ غير صالح أو غير قابل للتنفيذ." }, { status: 400 });
  if (!Array.isArray(executionPlan) || executionPlan.length === 0) return Response.json({ success: false, status: "failed", message: "خطة التنفيذ مطلوبة." }, { status: 400 });
  const hasEdit = Boolean(editSettings.background || editSettings.colors || editSettings.lighting || editSettings.shadows || editSettings.improveQuality || instruction.trim());
  if (!hasEdit) return Response.json({ success: false, status: "failed", message: "اختر تعديلًا أو اكتب طلبًا." }, { status: 400 });
  if (participantId && productId && sellerProducts.some((product) => product.id === productId) && !getSellerProduct(participantId, productId)) {
    return participantAccessResponse(new ParticipantAccessError(403, "لا يمكنك تعديل هذا المنتج لأنه لا ينتمي إلى حسابك."));
  }

  const operation = editSettings.output?.purpose === "advertisement"
    ? "product-ad"
    : requestedBackground === "transparent" ? "background-removal" : "image-edit";
  const trustedGuideRequest = await buildEchoGuideRequest({ participantId, productId, workspace: workspaceValue, operation, userInstruction, currentImageId: `${generationId}:source-image` });
  const trustedGuide = createEchoGuideRecommendation(trustedGuideRequest);
  const trustedDecision = decideExecution({
    participantId,
    productId,
    workspace: workspaceValue,
    operation,
    userInstruction,
    currentImageId: `${generationId}:source-image`,
    echoGuideRecommendationId,
    finalPrompt: instruction,
    preserve: trustedGuide.preserve,
    avoid: trustedGuide.avoid,
    suggestedModel: trustedGuide.suggestedModel,
    suggestedQuality: trustedGuide.suggestedQuality,
    suggestedSize: trustedGuide.suggestedSize,
    suggestedRatio: trustedGuide.suggestedRatio,
    productDNAAvailable: trustedGuide.contextSources.productDNAUsed,
    echoMemoryAvailable: trustedGuide.contextSources.echoMemoryUsed,
  });
  const submittedPlanSignature = executionPlan.map((step) => `${step.provider}:${step.action}`).join("|");
  const trustedPlanSignature = trustedDecision.plan.map((step) => `${step.provider}:${step.action}`).join("|");
  if (trustedDecision.provider !== executionProviderValue || submittedPlanSignature !== trustedPlanSignature) {
    return Response.json({ success: false, status: "failed", message: "توقفت العملية لأن خطة التنفيذ لا تطابق قرار DekoBrain الموثوق." }, { status: 409 });
  }

  console.log("[Echo Smart Edit] source selection", {
    hasOriginalUploadedImage,
    hasProductMemoryImage,
    selectedSource: sourceUsed === "original-upload" ? "originalUploadedImage" : sourceUsed,
    preserveWick,
    requestedBackground: editSettings.background,
    executionId: generationId,
    decisionId,
    executionProvider: executionProviderValue,
  });

  const prompt = buildEchoImagePrompt(productDNA, editSettings, instruction);
  void prompt;

  const preservedFeatures = ["input-image color", "input-image shape", "wick"];
  if (executionProviderValue === "local") {
    if (!executionPlan.some((step) => step.provider === "local" && step.action === "background-removal")) {
      return Response.json({ success: false, status: "failed", message: "المعالج المحلي المطلوب غير متوفر." }, { status: 422 });
    }
    try {
      if (process.env.NODE_ENV === "development") console.info("[Decision Engine] local processor called", { executionId: generationId, processor: "local-pixel-background-removal" });
      const sourceBytes = Buffer.from(await sourceImage.arrayBuffer());
      const result = await removeBackgroundPreservingSource(sourceBytes);
      const imageBase64 = result.buffer.toString("base64");
      if (!isPngWithAlphaChannel(imageBase64)) throw new Error("تعذر إنشاء قناة شفافية Alpha صالحة.");
      const model = "local-pixel-background-removal";
      const generationTimeMs = Date.now() - startedAt;
      const accounting = await recordSmartEditAccounting({
        generationId,
        createdAt: new Date().toISOString(),
        workspace: workspaceValue,
        tool: toolValue as WorkspaceToolId,
        model,
        operation: "background-removal",
        estimatedCostUsd: 0,
        actualCostUsd: 0,
        generationTimeMs,
        productId,
        participantId,
        sellerId,
        echoGuideRecommendationId,
        quality,
        size,
        ratio,
        decisionId,
        executionProvider: executionProviderValue,
        executionPlan,
      });
      return Response.json({
        success: true,
        status: "generated",
        imageBase64,
        mimeType: "image/png",
        outputFormat: "png",
        sourceUsed,
        background: "transparent",
        preservedFeatures,
        hasAlpha: true,
        generationId,
        decisionId,
        executionProvider: executionProviderValue,
        model,
        estimatedCostUsd: 0,
        actualCostUsd: 0,
        generationTimeMs,
        ...accounting,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "تعذر فصل الخلفية عن الصورة الحالية.";
      console.error("[Echo Smart Edit] pixel-preserving background removal failed", message);
      return Response.json({ success: false, status: "failed", message }, { status: 422 });
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ success: false, status: "provider_not_connected", message: "محرك التوليد غير متصل: مفتاح الخدمة غير موجود." });
  }

  try {
    let providerSourceImage: File = sourceImage;
    if (executionProviderValue === "hybrid") {
      const localStep = executionPlan.find((step) => step.provider === "local" && step.action === "background-removal");
      const openAiSteps = executionPlan.filter((step) => step.provider === "openai");
      if (!localStep || openAiSteps.length !== 1) return Response.json({ success: false, status: "failed", message: "خطة التنفيذ الهجينة يجب أن تحتوي خطوة محلية وخطوة OpenAI واحدة." }, { status: 400 });
      if (process.env.NODE_ENV === "development") console.info("[Decision Engine] hybrid local processor called", { executionId: generationId, processor: "local-pixel-background-removal" });
      const localResult = await removeBackgroundPreservingSource(Buffer.from(await sourceImage.arrayBuffer()));
      providerSourceImage = new File([localResult.buffer], "echo-hybrid-preprocessed.png", { type: "image/png" });
    }
    const providerFormData = new FormData();
    const providerModel = recommendedModel === "gpt-image-2" ? recommendedModel : "gpt-image-2";
    providerFormData.append("model", providerModel);
    providerFormData.append("image[]", providerSourceImage, providerSourceImage.name || "echo-current-source-image");
    providerFormData.append("prompt", prompt);
    providerFormData.append("output_format", "png");

    if (process.env.NODE_ENV === "development") console.info("[Decision Engine] OpenAI route called", { executionId: generationId, provider: executionProviderValue });
    const providerResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: providerFormData,
    });

    const providerPayload = await providerResponse.json() as {
      data?: Array<{ b64_json?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
      error?: { message?: string; code?: string };
    };

    if (!providerResponse.ok) {
      console.error("[Echo Smart Edit] image provider request failed", {
        status: providerResponse.status,
        requestId: providerResponse.headers.get("x-request-id"),
        code: providerPayload.error?.code,
        message: providerPayload.error?.message,
      });
      return Response.json({ success: false, status: "failed", message: providerPayload.error?.message || "تعذر الاتصال بمحرك التوليد." }, { status: providerResponse.status });
    }

    const imageBase64 = providerPayload.data?.[0]?.b64_json;
    if (!imageBase64) {
      return Response.json({ success: false, status: "failed", message: "وصل الطلب إلى المحرك، لكنه لم يرجع صورة." }, { status: 502 });
    }

    const generatedBytes = Buffer.from(imageBase64, "base64");
    const sourceBytes = Buffer.from(await sourceImage.arrayBuffer());
    if (generatedBytes.equals(sourceBytes)) {
      return Response.json({ success: false, status: "failed", message: "أعاد محرك التوليد الصورة الأصلية نفسها. لم يتم اعتماد النتيجة." }, { status: 502 });
    }

    const hasAlpha = isPngWithAlphaChannel(imageBase64);
    const inputTokens = providerPayload.usage?.input_tokens;
    const outputTokens = providerPayload.usage?.output_tokens
      ?? (typeof providerPayload.usage?.total_tokens === "number" && typeof inputTokens === "number"
        ? Math.max(0, providerPayload.usage.total_tokens - inputTokens)
        : undefined);
    const generationTimeMs = Date.now() - startedAt;
    const accounting = await recordSmartEditAccounting({
      generationId,
      createdAt: new Date().toISOString(),
      workspace: workspaceValue,
      tool: toolValue as WorkspaceToolId,
      model: providerModel,
      operation: "image-edit",
      estimatedCostUsd: SMART_EDIT_IMAGE_ESTIMATE_USD,
      actualCostUsd: SMART_EDIT_IMAGE_ESTIMATE_USD,
      inputTokens,
      outputTokens,
      generationTimeMs,
      productId,
      participantId,
      sellerId,
      echoGuideRecommendationId,
      quality,
      size,
      ratio,
      decisionId,
      executionProvider: executionProviderValue,
      executionPlan,
    });

    return Response.json({
      success: true,
      status: "generated",
      imageBase64,
      mimeType: "image/png",
      outputFormat: "png",
      sourceUsed,
      background: requestedBackground,
      preservedFeatures,
      hasAlpha,
      generationId,
      decisionId,
      executionProvider: executionProviderValue,
      model: providerModel,
      estimatedCostUsd: SMART_EDIT_IMAGE_ESTIMATE_USD,
      actualCostUsd: SMART_EDIT_IMAGE_ESTIMATE_USD,
      inputTokens,
      outputTokens,
      generationTimeMs,
      ...accounting,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر الاتصال بمحرك التوليد.";
    console.error("[Echo Smart Edit] image provider connection failed", message);
    return Response.json({ success: false, status: "failed", message }, { status: 502 });
  }
}

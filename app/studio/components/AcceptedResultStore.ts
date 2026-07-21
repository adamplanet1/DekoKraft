import { saveConfirmedLearning } from "../../components/ui/dekobrain-experiment/LearningEchoStore";
import type { SmartProductSpecifications } from "./SmartEditLearningStore";
import type { EchoUserRole, SmartEditOptions } from "../../../lib/echo/echoGuide";
import type { WorkspaceId } from "../engine/workspaceTypes";
import type { ExecutionProvider } from "../../../lib/decision-engine/types";
import { loadCurrentUserSession } from "../../seller/lib/sellerSession";
import { loadSmartEditHistory } from "../engine/HistoryLogger";

export const ACCEPTED_VISUAL_PREFERENCES_KEY = "dekokraft.learningEcho.acceptedVisualPreferences";
export const ARTISAN_VISUAL_IDENTITY_KEY = "dekokraft.learningEcho.artisanVisualIdentity";

type PreferenceConfidence = { key: string; confirmationCount: number; rejectionCount: number; confidence: number };

function updateArtisanIdentity(keys: string[]) {
  let current: PreferenceConfidence[] = [];
  try { const parsed: unknown = JSON.parse(localStorage.getItem(ARTISAN_VISUAL_IDENTITY_KEY) ?? "[]"); if (Array.isArray(parsed)) current = parsed as PreferenceConfidence[]; } catch {}
  const map = new Map(current.map((item) => [item.key, item]));
  keys.forEach((key) => {
    const previous = map.get(key) ?? { key, confirmationCount: 0, rejectionCount: 0, confidence: 0 };
    const confirmationCount = previous.confirmationCount + 1;
    map.set(key, { ...previous, confirmationCount, confidence: confirmationCount / (confirmationCount + previous.rejectionCount + 1) });
  });
  localStorage.setItem(ARTISAN_VISUAL_IDENTITY_KEY, JSON.stringify([...map.values()]));
}

type AcceptedExecutionMetadata = {
  workspace: WorkspaceId;
  recommendationId?: string;
  finalPrompt?: string;
  model?: string;
  quality?: string;
  size?: string;
  decisionId?: string;
  executionId?: string;
  provider?: ExecutionProvider;
};

type AcceptedParticipantIdentity = { participantId?: string; sellerId?: string };

export function assertAcceptedResultOwnership(productId: string, execution: AcceptedExecutionMetadata, identity: AcceptedParticipantIdentity = {}) {
  const targetParticipantId = identity.participantId ?? identity.sellerId;
  if (targetParticipantId) {
    const session = loadCurrentUserSession();
    if (!session || (session.role === "participant" && session.participantId !== targetParticipantId)) {
      throw new Error("غير مسموح لك بتحديث ذاكرة هذا المشارك.");
    }
    const executionRecord = execution.executionId
      ? loadSmartEditHistory().find((record) => record.executionId === execution.executionId)
      : undefined;
    if (!executionRecord || (executionRecord.participantId ?? executionRecord.sellerId) !== targetParticipantId || executionRecord.productId !== productId) {
      throw new Error("تعذر اعتماد النتيجة لأن سجل التنفيذ لا يطابق المشارك والمنتج الحاليين.");
    }
  }
  return targetParticipantId;
}

export async function saveAcceptedVisualPreference(productId: string, productDNA: SmartProductSpecifications, options: SmartEditOptions, instruction: string, role: EchoUserRole, execution: AcceptedExecutionMetadata, identity: AcceptedParticipantIdentity = {}) {
  const targetParticipantId = assertAcceptedResultOwnership(productId, execution, identity);
  // Temporary local persistence.
  // Replace with Learning Echo backend later.
  const record = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `visual-${Date.now()}`,
    type: "accepted_visual_preference" as const,
    productId,
    participantId: targetParticipantId,
    categoryId: productDNA.categoryId,
    role,
    options,
    instruction,
    prompt: execution.finalPrompt || instruction,
    compressedPrompt: (execution.finalPrompt || instruction).trim().replace(/\s+/g, " "),
    corrections: [],
    rating: 1,
    workspace: execution.workspace,
    recommendationId: execution.recommendationId,
    model: execution.model,
    quality: execution.quality,
    size: execution.size,
    decisionId: execution.decisionId,
    executionId: execution.executionId,
    provider: execution.provider,
    resultAccepted: true,
    acceptedAt: new Date().toISOString(),
  };
  const previous = (() => { try { const parsed: unknown = JSON.parse(localStorage.getItem(ACCEPTED_VISUAL_PREFERENCES_KEY) ?? "[]"); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })();
  localStorage.setItem(ACCEPTED_VISUAL_PREFERENCES_KEY, JSON.stringify([...previous, record]));
  updateArtisanIdentity([options.background?.mode && `${options.background.mode}-background`, options.colors?.mode && `${options.colors.mode}-colors`, options.preserveShape && "preserve-shape", options.lighting?.mode && `${options.lighting.mode}-lighting`].filter(Boolean) as string[]);
  saveConfirmedLearning({
    productId,
    participantId: targetParticipantId,
    workspace: execution.workspace,
    productDNA: { id: productId, productName: productDNA.productType, identity: `${productDNA.productType} · ${productDNA.material}`, category: productDNA.categoryName, material: productDNA.material, shape: productDNA.shape, color: productDNA.color, style: productDNA.notes, usage: productDNA.usage, dimensions: `${productDNA.dimensions.length} × ${productDNA.dimensions.width} × ${productDNA.dimensions.height} ${productDNA.dimensions.unit}`, description: productDNA.notes, imageName: "", completeness: 100, needsConfirmation: [], confirmedTraits: [productDNA.shape, productDNA.color], updatedAt: record.acceptedAt },
    correction: {},
    artisanPreference: { instruction, preserveShape: options.preserveShape, preserveOriginalColors: options.colors?.mode === "preserve", preferredBackground: options.background?.mode },
  });
  try {
    const response = await fetch("/api/echo-guide/memory/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: record.id,
        participantId: targetParticipantId,
        productId,
        workspace: execution.workspace,
        acceptedPreference: instruction,
        promptRecipe: record.compressedPrompt,
        correction: execution.finalPrompt && execution.finalPrompt !== instruction ? execution.finalPrompt : undefined,
        model: execution.model ?? "unknown",
        quality: execution.quality,
        size: execution.size,
        decisionId: execution.decisionId,
        executionId: execution.executionId,
        provider: execution.provider,
        successfulSettings: {
          preserveShape: options.preserveShape,
          preserveDetails: options.preserveDetails,
          background: options.background?.mode ?? "original",
          lighting: options.lighting?.mode ?? "original",
          ratio: options.output?.aspectRatio ?? "1:1",
        },
        accepted: true,
        acceptedAt: record.acceptedAt,
      }),
    });
    if (!response.ok) console.error("[Echo Guide] Accepted memory mirror was not persisted.");
  } catch (error) {
    console.error("[Echo Guide] Accepted memory mirror was not persisted.", error);
  }
  return record;
}

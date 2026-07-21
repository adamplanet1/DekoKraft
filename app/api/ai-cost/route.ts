import {
  addAICostRecord,
  getAICostSummary,
  listAICostRecords,
  updateAICostRecord,
} from "../../../lib/ai-cost/costStore";
import {
  AI_COST_OPERATIONS,
  AI_COST_ROLES,
  AI_COST_STATUSES,
  type AICostOperation,
  type AICostProvider,
  type AICostRecord,
  type AICostRecordInput,
  type AICostRecordPatch,
  type AICostRole,
  type AICostStatus,
} from "../../../lib/ai-cost/types";
import {
  ParticipantAccessError,
  participantAccessResponse,
  requireAuthenticatedUser,
} from "../../../lib/auth/participantAccess";
import { getParticipantProfile } from "../../../lib/participants/registry";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 240;
const MAX_METADATA_DEPTH = 4;
const sensitiveMetadataKey = /(?:base64|prompt|api.?key|image(?:data|bytes|payload))/i;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredText(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required.`);
  }
  return value.trim().slice(0, MAX_TEXT_LENGTH);
}

function optionalText(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("Optional text values must be strings.");
  return value.trim().slice(0, MAX_TEXT_LENGTH) || undefined;
}

function finiteNonNegative(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number.`);
  }
  return value;
}

function optionalCount(value: unknown, field: string) {
  if (value === undefined || value === null) return undefined;
  const count = finiteNonNegative(value, field);
  if (!Number.isInteger(count)) throw new Error(`${field} must be an integer.`);
  return count;
}

function sanitizeMetadataValue(value: unknown, depth: number): unknown {
  if (depth > MAX_METADATA_DEPTH) return undefined;
  if (value === null || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") {
    if (value.startsWith("data:image/")) return undefined;
    return value.slice(0, 500);
  }
  if (Array.isArray(value)) {
    return value
      .slice(0, 30)
      .map((entry) => sanitizeMetadataValue(entry, depth + 1))
      .filter((entry) => entry !== undefined);
  }
  if (!isObject(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !sensitiveMetadataKey.test(key))
      .map(([key, entry]) => [key.slice(0, 80), sanitizeMetadataValue(entry, depth + 1)])
      .filter(([, entry]) => entry !== undefined),
  );
}

function sanitizeMetadata(value: unknown) {
  if (value === undefined || value === null) return undefined;
  if (!isObject(value)) throw new Error("metadata must be an object.");
  return sanitizeMetadataValue(value, 0) as Record<string, unknown>;
}

function parseNewRecord(value: unknown): AICostRecordInput {
  if (!isObject(value)) throw new Error("A JSON object is required.");
  const operation = requiredText(value.operation, "operation");
  const status = requiredText(value.status, "status");
  const role = optionalText(value.role);
  const provider = optionalText(value.provider);

  if (!AI_COST_OPERATIONS.includes(operation as AICostOperation)) {
    throw new Error("Unsupported AI operation.");
  }
  if (!AI_COST_STATUSES.includes(status as AICostStatus)) {
    throw new Error("Unsupported cost status.");
  }
  if (role && !AI_COST_ROLES.includes(role as AICostRole)) {
    throw new Error("Unsupported user role.");
  }
  if (provider && !(["local", "openai", "hybrid"] as const).includes(provider as AICostProvider)) throw new Error("Unsupported execution provider.");

  return {
    userId: requiredText(value.userId, "userId"),
    userName: optionalText(value.userName),
    role: role as AICostRole | undefined,
    productId: optionalText(value.productId),
    productName: optionalText(value.productName),
    participantId: optionalText(value.participantId),
    operation: operation as AICostOperation,
    provider: provider as AICostProvider | undefined,
    workspace: optionalText(value.workspace),
    tool: optionalText(value.tool),
    model: requiredText(value.model, "model"),
    requestId: optionalText(value.requestId),
    executionId: optionalText(value.executionId),
    generationTimeMs: value.generationTimeMs === undefined
      ? undefined
      : finiteNonNegative(value.generationTimeMs, "generationTimeMs"),
    imageCount: optionalCount(value.imageCount, "imageCount"),
    inputTokens: optionalCount(value.inputTokens, "inputTokens"),
    outputTokens: optionalCount(value.outputTokens, "outputTokens"),
    estimatedCostUsd: finiteNonNegative(value.estimatedCostUsd, "estimatedCostUsd"),
    actualCostUsd: value.actualCostUsd === undefined
      ? undefined
      : finiteNonNegative(value.actualCostUsd, "actualCostUsd"),
    status: status as AICostStatus,
    errorMessage: optionalText(value.errorMessage),
    metadata: sanitizeMetadata(value.metadata),
  };
}

function parsePatch(value: unknown): { id: string; patch: AICostRecordPatch } {
  if (!isObject(value)) throw new Error("A JSON object is required.");
  const id = requiredText(value.id, "id");
  const patch: AICostRecordPatch = {};

  if (value.status !== undefined) {
    const status = requiredText(value.status, "status");
    if (!AI_COST_STATUSES.includes(status as AICostStatus)) {
      throw new Error("Unsupported cost status.");
    }
    patch.status = status as AICostStatus;
  }
  if (value.actualCostUsd !== undefined) {
    patch.actualCostUsd = finiteNonNegative(value.actualCostUsd, "actualCostUsd");
  }
  if (value.requestId !== undefined) patch.requestId = optionalText(value.requestId);
  if (value.errorMessage !== undefined) patch.errorMessage = optionalText(value.errorMessage);
  if (Object.keys(patch).length === 0) throw new Error("No supported patch values were supplied.");

  return { id, patch };
}

async function payload(participantId?: string) {
  const [records, summary] = await Promise.all([
    listAICostRecords(),
    getAICostSummary(participantId),
  ]);
  return { records: participantId ? records.filter((record) => (record.participantId ?? record.sellerId) === participantId) : records, summary };
}

export async function GET(request: Request) {
  try {
    const session = await requireAuthenticatedUser();
    const requestedParticipantId = new URL(request.url).searchParams.get("participantId") ?? undefined;
    const participantId = session.role === "participant" ? session.participantId : requestedParticipantId;
    if (session.role === "admin" && participantId && !getParticipantProfile(participantId)) {
      throw new ParticipantAccessError(404, "لم يتم العثور على المشارك أو السجل المطلوب.");
    }
    return Response.json(await payload(participantId));
  } catch (error) {
    if (error instanceof ParticipantAccessError) return participantAccessResponse(error);
    console.error("[AI Cost] Failed to read cost data.", error);
    return Response.json({ error: "Unable to read AI cost data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuthenticatedUser();
    const input = parseNewRecord(await request.json());
    const participantId = session.role === "participant" ? session.participantId : input.participantId;
    const record: AICostRecord = {
      ...input,
      participantId,
      sellerId: participantId ? undefined : input.sellerId,
      userId: participantId ?? input.userId,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await addAICostRecord(record);
    return Response.json({ record, summary: await getAICostSummary(session.role === "participant" ? participantId : undefined) }, { status: 201 });
  } catch (error) {
    if (error instanceof ParticipantAccessError) return participantAccessResponse(error);
    const message = error instanceof Error ? error.message : "Invalid AI cost record.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuthenticatedUser();
    const { id, patch } = parsePatch(await request.json());
    const existing = (await listAICostRecords()).find((record) => record.id === id);
    if (!existing) return Response.json({ error: "AI cost record not found." }, { status: 404 });
    const ownerId = existing.participantId ?? existing.sellerId;
    if (session.role === "participant" && ownerId !== session.participantId) {
      throw new ParticipantAccessError(403, "غير مسموح لك بالوصول إلى بيانات هذا المشارك.");
    }
    const record = await updateAICostRecord(id, patch);
    return Response.json({ record, summary: await getAICostSummary(session.role === "participant" ? session.participantId : undefined) });
  } catch (error) {
    if (error instanceof ParticipantAccessError) return participantAccessResponse(error);
    const message = error instanceof Error ? error.message : "Invalid AI cost patch.";
    return Response.json({ error: message }, { status: 400 });
  }
}

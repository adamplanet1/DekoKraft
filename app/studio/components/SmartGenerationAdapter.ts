import type { SmartEditOptions } from "../../../lib/echo/echoGuide";
import type { SmartProductSpecifications } from "./SmartEditLearningStore";

export type SmartGenerationPayload = {
  sourceImage: File | Blob;
  productDNA: SmartProductSpecifications;
  edits: SmartEditOptions;
  instruction: string;
};

export type SmartGenerationResult = { status: "generated"; imageUrl: string; resultBlob: Blob } | { status: "unavailable"; reason: "engine-not-connected" };

export async function generateSmartProductImage(payload: SmartGenerationPayload): Promise<SmartGenerationResult> {
  void payload;
  // Adapter boundary prepared for the real AI image-generation backend.
  // No synthetic result is returned until that backend is connected.
  return { status: "unavailable", reason: "engine-not-connected" };
}

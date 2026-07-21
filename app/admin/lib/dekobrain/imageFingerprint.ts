import type { ProvisionalCategory } from "../../types/dekobrain";

export function normalizeMediaFilename(name: string) {
  return name.toLowerCase().replace(/\.[^.]+$/, "").replace(/(?:copy|kopie|نسخة|copie)[-_ ]*\d*/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
}

export async function generateImageFingerprint(file: File) {
  if (!globalThis.crypto?.subtle) throw new Error("fingerprint-unavailable");
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createSimilarityKey(input: { width: number; height: number; fileSizeBytes: number; filename: string; category: ProvisionalCategory }) {
  const sizeBucket = Math.round(input.fileSizeBytes / (256 * 1024));
  return [input.category, normalizeMediaFilename(input.filename), input.width, input.height, sizeBucket].join(":");
}

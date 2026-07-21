import "server-only";

import { promises as fs } from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { normalizeProductDNA, type ProductDNA } from "../echo/echoProductDNA";
import { findAcceptedEchoGuideMemory } from "./serverMemoryStore";
import type { EchoGuideMemoryContext, EchoGuideProductContext, EchoGuideRequest, EchoGuideWorkspace } from "./types";

type ProductRow = Record<string, unknown>;
const productsPath = path.join(process.cwd(), "app", "data", "products.xlsx");

function parseObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

async function findProductRow(productId: string) {
  try {
    const workbook = XLSX.read(await fs.readFile(productsPath), { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return null;
    return XLSX.utils.sheet_to_json<ProductRow>(sheet).find((row) => String(row.id ?? "") === productId) ?? null;
  } catch (error) {
    console.error("[Echo Guide] Failed to read confirmed Product DNA.", error);
    return null;
  }
}

export async function buildEchoGuideProductContext(productId?: string): Promise<EchoGuideProductContext | undefined> {
  if (!productId) return undefined;
  const row = await findProductRow(productId);
  if (!row) return undefined;
  const embedded = parseObject(row.productDNA) ?? {};
  const productDNA = normalizeProductDNA({
    ...embedded,
    id: String(embedded.id ?? row.id ?? ""),
    categoryId: String(embedded.categoryId ?? row.category ?? ""),
    productType: String(embedded.productType ?? row.productType ?? row.type ?? row.title ?? ""),
    shape: embedded.shape ?? row.shape,
    material: embedded.material ?? row.material,
    color: embedded.color ?? row.color,
    dimensions: embedded.dimensions ?? parseObject(row.dimensions),
    usage: embedded.usage ?? row.usage,
    hasWick: embedded.hasWick ?? row.hasWick,
    confirmed: embedded.confirmed,
    confirmedAt: embedded.confirmedAt,
    smartEditProfile: embedded.smartEditProfile,
  } as Partial<ProductDNA> & Record<string, unknown>);
  if (!productDNA.confirmed) return undefined;
  const profile = productDNA.smartEditProfile;
  const dimensions = productDNA.dimensions;
  const protectedFeatures = [
    productDNA.shape && `${productDNA.shape} shape`,
    productDNA.color && `${productDNA.color} color`,
    productDNA.material && `${productDNA.material} texture`,
    productDNA.hasWick && "complete visible wick",
    profile?.preserveExactShape && "exact product shape",
  ].filter((item): item is string => Boolean(item));
  return {
    productId: productDNA.id,
    productName: typeof row.title === "string" ? row.title : productDNA.productType,
    productType: productDNA.productType,
    material: productDNA.material,
    dimensions: dimensions.confirmed
      ? `${dimensions.length ?? "?"} × ${dimensions.width ?? "?"} × ${dimensions.height ?? "?"} ${dimensions.unit}`
      : undefined,
    protectedFeatures,
    preferredBackground: profile?.preferredBackground,
    preferredLighting: profile?.preferredLighting,
    preferredRatio: profile?.preferredRatio,
    preferredQuality: profile?.preferredQuality,
  };
}

export async function buildEchoGuideMemoryContext(participantId: string | undefined, productId: string | undefined, workspace: EchoGuideWorkspace): Promise<EchoGuideMemoryContext | undefined> {
  const records = await findAcceptedEchoGuideMemory(participantId, productId, workspace);
  if (!records.length) return undefined;
  return {
    acceptedPreferences: [...new Set(records.map((record) => record.acceptedPreference).filter(Boolean))],
    rejectedPatterns: [],
    successfulSettings: Object.assign({}, ...records.map((record) => record.successfulSettings)),
    previousCorrections: [...new Set(records.map((record) => record.correction).filter((value): value is string => Boolean(value)))],
  };
}

export async function buildEchoGuideRequest(input: Omit<EchoGuideRequest, "productContext" | "memoryContext">): Promise<EchoGuideRequest> {
  const [productContext, memoryContext] = await Promise.all([
    buildEchoGuideProductContext(input.productId),
    buildEchoGuideMemoryContext(input.participantId, input.productId, input.workspace),
  ]);
  return { ...input, productContext, memoryContext };
}

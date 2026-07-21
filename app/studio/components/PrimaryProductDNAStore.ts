import { normalizeProductDNA, type ProductDNA } from "../../../lib/echo/echoProductDNA";
import { studioServerFetch } from "../lib/studioServerApi";

type PrimaryProductRow = Record<string, unknown>;

const categoryAliases: Record<string, ProductDNA["categoryId"]> = {
  candle: "candles",
  gift: "gifts",
};

const parseStoredObject = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
};

export function productRowToDNA(row: PrimaryProductRow): ProductDNA {
  const embedded = parseStoredObject(row.productDNA) ?? {};
  const storedDimensions = parseStoredObject(row.dimensions) ?? {};
  const category = String(embedded.categoryId ?? row.category ?? "");
  return normalizeProductDNA({
    ...embedded,
    id: String(embedded.id ?? row.id ?? ""),
    categoryId: categoryAliases[category] ?? category,
    productType: String(embedded.productType ?? row.productType ?? row.type ?? row.title ?? ""),
    shape: embedded.shape ?? row.shape,
    material: embedded.material ?? row.material,
    color: embedded.color ?? row.color,
    usage: embedded.usage ?? row.usage,
    hasWick: embedded.hasWick ?? row.hasWick,
    scent: embedded.scent ?? row.scent ?? row.fragrance,
    burnTime: embedded.burnTime ?? row.burnTime,
    waxType: embedded.waxType ?? row.waxType,
    notes: embedded.notes ?? row.notes ?? row.description,
    confirmed: embedded.confirmed,
    confirmedAt: embedded.confirmedAt,
    dimensions: Object.keys(storedDimensions).length ? storedDimensions : embedded.dimensions,
  } as Partial<ProductDNA> & Record<string, unknown>);
}

export async function loadProductDNAFromPrimaryStore(productId: string): Promise<ProductDNA | null> {
  try {
    const response = await studioServerFetch("/api/admin/products/", { cache: "no-store" });
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return null;
    const row = payload.find((item) => item && typeof item === "object" && String((item as PrimaryProductRow).id ?? "") === productId);
    return row ? productRowToDNA(row as PrimaryProductRow) : null;
  } catch (error) {
    console.error("[Product DNA] Failed to load the primary product record:", error);
    return null;
  }
}

export async function saveProductDNAToPrimaryStore(productDNA: ProductDNA): Promise<boolean> {
  try {
    const normalized = normalizeProductDNA(productDNA as ProductDNA & Record<string, unknown>);
    const response = await studioServerFetch("/api/admin/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: normalized.id,
        category: normalized.categoryId,
        title: normalized.notes || normalized.productType || normalized.id,
        productType: normalized.productType,
        shape: normalized.shape,
        material: normalized.material,
        color: normalized.color,
        dimensions: normalized.dimensions,
        usage: normalized.usage,
        hasWick: normalized.hasWick,
        scent: normalized.scent,
        burnTime: normalized.burnTime,
        waxType: normalized.waxType,
        notes: normalized.notes,
        productDNA: normalized,
      }),
    });
    const payload = await response.json().catch(() => null) as { success?: boolean } | null;
    return response.ok && payload?.success === true;
  } catch (error) {
    console.error("[Product DNA] Failed to save the primary product record:", error);
    return false;
  }
}

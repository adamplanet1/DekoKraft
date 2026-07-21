import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { normalizeProductDNA, type ProductDNA } from "../../../../lib/echo/echoProductDNA";

export const dynamic = "force-static";

const filePath = path.join(process.cwd(), "app", "data", "products.xlsx");
const productImagesRoot = path.join(process.cwd(), "public", "images", "homepage");

type ProductRow = Record<string, unknown>;

const jsonColumns = new Set(["dimensions", "productDNA", "availableColors"]);

function parseJsonColumn(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function deserializeRow(row: ProductRow): ProductRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, jsonColumns.has(key) ? parseJsonColumn(value) : value])
  );
}

function serializeRow(row: ProductRow): ProductRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      jsonColumns.has(key) && value !== undefined && value !== null && typeof value !== "string"
        ? JSON.stringify(value)
        : value,
    ])
  );
}

function legacyDimensionsFromRow(row: ProductRow) {
  if (row.dimensions && typeof row.dimensions === "object") return row.dimensions;
  const value = typeof row.size_cm === "string" ? row.size_cm : "";
  const values = value.match(/\d+(?:[.,]\d+)?/g)?.slice(0, 3).map((item) => Number(item.replace(",", "."))) ?? [];
  return { length: values[0] ?? null, width: values[1] ?? null, height: values[2] ?? null, unit: values.length ? "cm" as const : "mm" as const };
}

function resolvePrimaryProductImage(row: ProductRow): string | null {
  const direct = [row.imageUrl, row.primaryImageUrl, row.mainImage, row.thumbnail]
    .find((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (direct && (direct.startsWith("/") || /^https?:\/\//.test(direct))) return direct;

  const id = String(row.id ?? "").trim();
  const category = String(row.category ?? "").trim();
  if (!id || !category) return null;
  const folderAliases: Record<string, string> = { candle: "candles", candles: "candles", gift: "gift", gifts: "gift", kids: "kids", services: "services" };
  const folder = folderAliases[category] ?? category;
  const directory = path.join(productImagesRoot, folder, id);
  try {
    if (!fs.existsSync(directory)) return null;
    if (direct && fs.existsSync(path.join(directory, direct))) {
      return `/images/homepage/${folder}/${encodeURIComponent(id)}/${encodeURIComponent(direct)}`;
    }
    const files = fs.readdirSync(directory)
      .filter((file) => /\.(?:avif|gif|jpe?g|png|webp)$/i.test(file))
      .sort((left, right) => {
        const leftScore = left.includes("-1200.") ? 0 : left.includes("-600.") ? 1 : 2;
        const rightScore = right.includes("-1200.") ? 0 : right.includes("-600.") ? 1 : 2;
        return leftScore - rightScore || left.localeCompare(right);
      });
    return files[0] ? `/images/homepage/${folder}/${encodeURIComponent(id)}/${encodeURIComponent(files[0])}` : null;
  } catch (error) {
    console.error(`[Products API] Failed to resolve image for ${id}:`, error);
    return null;
  }
}

function normalizeProductRow(row: ProductRow): ProductRow {
  const embedded = row.productDNA && typeof row.productDNA === "object" ? row.productDNA as Record<string, unknown> : {};
  const productDNA = normalizeProductDNA({
    ...embedded,
    id: String(embedded.id ?? row.id ?? ""),
    categoryId: String(embedded.categoryId ?? row.category ?? ""),
    productType: String(embedded.productType ?? row.productType ?? row.type ?? row.title ?? row.title_ar ?? ""),
    shape: embedded.shape ?? row.shape,
    material: embedded.material ?? row.material,
    color: embedded.color ?? row.color,
    dimensions: embedded.dimensions ?? legacyDimensionsFromRow(row),
    usage: embedded.usage ?? row.usage,
    scent: embedded.scent ?? row.scent ?? row.fragrance,
    notes: embedded.notes ?? row.notes ?? row.description ?? row.description_ar,
    confirmed: embedded.confirmed,
    confirmedAt: embedded.confirmedAt,
  } as Partial<ProductDNA> & Record<string, unknown>);
  return { ...row, dimensions: productDNA.dimensions, productDNA, primaryImageUrl: resolvePrimaryProductImage(row) };
}

function readRows(): ProductRow[] {
  try {
    if (!fs.existsSync(filePath)) return [];

    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];

    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<ProductRow>(sheet).map(deserializeRow);
  } catch (error) {
    console.log("❌ خطأ في قراءة products.xlsx:", error);
    return [];
  }
}

function writeRows(rows: ProductRow[]) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows.map(serializeRow));
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  fs.writeFileSync(filePath, buffer);
}

export async function GET() {
  return NextResponse.json(readRows().map(normalizeProductRow));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductRow;
    const title = String(body.title || "").trim();
    const category = String(body.category || "").trim();

    if (!title || !category) {
      return NextResponse.json(
        { success: false, errorCode: "missing_required_fields" },
        { status: 400 }
      );
    }

    const rows = readRows();

    const productId = String(body.id || crypto.randomUUID());
    const index = rows.findIndex(
      (item) => String(item.id ?? "") === productId && String(item.category ?? "") === category
    );
    const previous = index >= 0 ? rows[index] : {};
    const previousDNA = previous.productDNA && typeof previous.productDNA === "object" ? previous.productDNA as Record<string, unknown> : {};
    const submittedDNA = body.productDNA && typeof body.productDNA === "object" ? body.productDNA as Record<string, unknown> : {};
    const productDNA = normalizeProductDNA({
      ...previousDNA,
      ...submittedDNA,
      id: productId,
      categoryId: category,
      productType: submittedDNA.productType ?? body.productType ?? body.type ?? title,
      shape: submittedDNA.shape ?? body.shape ?? previous.shape,
      material: submittedDNA.material ?? body.material ?? previous.material,
      color: submittedDNA.color ?? body.color ?? previous.color,
      dimensions: submittedDNA.dimensions ?? body.dimensions ?? previous.dimensions,
      usage: submittedDNA.usage ?? body.usage ?? previous.usage,
      hasWick: submittedDNA.hasWick ?? body.hasWick ?? previous.hasWick,
      scent: submittedDNA.scent ?? body.scent ?? body.fragrance ?? previous.scent,
      burnTime: submittedDNA.burnTime ?? body.burnTime ?? previous.burnTime,
      waxType: submittedDNA.waxType ?? body.waxType ?? previous.waxType,
      notes: submittedDNA.notes ?? body.notes ?? body.description ?? previous.notes,
      confirmed: submittedDNA.confirmed,
      confirmedAt: submittedDNA.confirmedAt,
    } as Partial<ProductDNA> & Record<string, unknown>);
    const product: ProductRow = {
      ...previous,
      ...body,
      id: productId,
      title,
      category,
      imageCount: Number(body.imageCount || 0),
      extension: body.extension || "webp",
      currency: body.currency || "EUR",
      dimensions: productDNA.dimensions,
      productDNA,
    };

    if (index >= 0) {
      rows[index] = { ...rows[index], ...product };
    } else {
      rows.push(product);
    }

    writeRows(rows);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown product save error";

    console.error("Failed to save product:", error);

    return NextResponse.json(
      {
        success: false,
        errorCode: "save_failed",
        ...(process.env.NODE_ENV === "development"
          ? { errorMessage }
          : {}),
      },
      { status: 500 }
    );
  }
}

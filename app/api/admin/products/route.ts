import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

export const dynamic = "force-static";

const filePath = path.join(process.cwd(), "app", "data", "products.xlsx");

type ProductRow = Record<string, string | number | boolean | null | undefined>;

function readRows(): ProductRow[] {
  try {
    if (!fs.existsSync(filePath)) return [];

    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];

    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<ProductRow>(sheet);
  } catch (error) {
    console.log("❌ خطأ في قراءة products.xlsx:", error);
    return [];
  }
}

function writeRows(rows: ProductRow[]) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
  XLSX.writeFile(workbook, filePath);
}

export async function GET() {
  return NextResponse.json(readRows());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductRow;
    const rows = readRows();

    const product: ProductRow = {
      ...body,
      imageCount: Number(body.imageCount || 0),
      extension: body.extension || "webp",
      currency: body.currency || "EUR",
    };

    const index = rows.findIndex(
      (item) => item.id === product.id && item.category === product.category
    );

    if (index >= 0) {
      rows[index] = { ...rows[index], ...product };
    } else {
      rows.push(product);
    }

    writeRows(rows);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save product" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const category = String(formData.get("category") || "");
    const productId = String(formData.get("productId") || "");
    const files = formData.getAll("images") as File[];

    if (!category || !productId || files.length === 0) {
      return NextResponse.json(
        { error: "Missing category, productId or images" },
        { status: 400 }
      );
    }

    const productFolder = path.join(
      process.cwd(),
      "public",
      "images",
      "homepage",
      category,
      productId
    );

    if (!fs.existsSync(productFolder)) {
      fs.mkdirSync(productFolder, { recursive: true });
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buffer = Buffer.from(await file.arrayBuffer());
      const number = String(i + 1).padStart(2, "0");

      await sharp(buffer)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(productFolder, `${productId}-${number}-600.webp`));

      await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 86 })
        .toFile(path.join(productFolder, `${productId}-${number}-1200.webp`));
    }

    return NextResponse.json({
      success: true,
      count: files.length,
      folder: `/images/homepage/${category}/${productId}`,
    });
  } catch (error) {
    console.log("❌ خطأ في رفع الصور:", error);

    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

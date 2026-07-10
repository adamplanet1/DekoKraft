import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function saveProductImages(
  fileBuffer: Buffer,
  productId: string,
  imageNumber: number,
  category: string
) {
  const number = String(imageNumber).padStart(2, "0");

  const folder = path.join(
    process.cwd(),
    "public",
    "images",
    "homepage",
    category,
    productId
  );

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  // صورة 600
  await sharp(fileBuffer)
    .resize({
      width: 600,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: 85,
    })
    .toFile(
      path.join(folder, `${productId}-${number}-600.webp`)
    );

  // صورة 1200
  await sharp(fileBuffer)
    .resize({
      width: 1200,
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({
      quality: 90,
    })
    .toFile(
      path.join(folder, `${productId}-${number}-1200.webp`)
    );

  return {
    image600: `${productId}-${number}-600.webp`,
    image1200: `${productId}-${number}-1200.webp`,
  };
}
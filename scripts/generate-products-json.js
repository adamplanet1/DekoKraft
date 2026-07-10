/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const basePath = path.join(__dirname, "..", "public", "images", "homepage");
const excelPath = path.join(__dirname, "..", "app", "data", "products.xlsx");

function getFolders(folderPath) {
  if (!fs.existsSync(folderPath)) return [];

  return fs
    .readdirSync(folderPath)
    .filter((name) => fs.statSync(path.join(folderPath, name)).isDirectory())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function readExcelProducts() {
  if (!fs.existsSync(excelPath)) {
    console.log("⚠️ ملف Excel غير موجود:", excelPath);
    return [];
  }

  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

function countImages(productPath, productId, extension) {
  const files = fs.existsSync(productPath) ? fs.readdirSync(productPath) : [];

  const numbers = files
    .filter(
      (file) =>
        file.startsWith(`${productId}-`) &&
        file.endsWith(`-1200.${extension}`)
    )
    .map((file) => {
      const match = file.match(/-(\d+)-1200\./);
      return match ? Number(match[1]) : null;
    })
    .filter((num) => num !== null)
    .sort((a, b) => a - b);

  numbers.forEach((num) => {
    const n = String(num).padStart(2, "0");

    const img600 = path.join(productPath, `${productId}-${n}-600.${extension}`);
    const img1200 = path.join(productPath, `${productId}-${n}-1200.${extension}`);

    if (!fs.existsSync(img600)) {
      console.log(`⚠️ ناقصة صورة 600: ${productId}-${n}-600.${extension}`);
    }

    if (!fs.existsSync(img1200)) {
      console.log(`⚠️ ناقصة صورة 1200: ${productId}-${n}-1200.${extension}`);
    }
  });

  return numbers.length;
}

function titleFromId(id) {
  return id
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function findExcelRow(excelRows, categoryFolder, productId) {
  return excelRows.find((row) => {
    const rowId = String(row.id || "").trim();
    const rowCategory = String(row.category || "").trim();

    return rowId === productId && rowCategory === categoryFolder;
  });
}

function cleanRow(row) {
  const cleaned = {};

  Object.keys(row).forEach((key) => {
    const value = row[key];

    if (value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

function generateCategoryProducts(categoryFolder, excelRows) {
  const categoryPath = path.join(basePath, categoryFolder);
  const productFolders = getFolders(categoryPath);

  const products = productFolders.map((productId) => {
    const productPath = path.join(categoryPath, productId);
    const excelRow = findExcelRow(excelRows, categoryFolder, productId);
    const extension = excelRow?.extension || "webp";

    const imageCount = countImages(productPath, productId, extension);

    return {
      id: productId,
      category: categoryFolder,
      title: excelRow?.title_ar || excelRow?.title_en || titleFromId(productId),
      description: excelRow?.description_ar || "",
      imageCount,
      extension,
      ...cleanRow(excelRow || {}),
    };
  });

  const outputPath = path.join(categoryPath, "products.json");
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), "utf8");

  console.log(`✅ تم إنشاء: ${categoryFolder}/products.json`);
}

function main() {
  const excelRows = readExcelProducts();
  const categories = getFolders(basePath);

  categories.forEach((categoryFolder) => {
    generateCategoryProducts(categoryFolder, excelRows);
  });

  console.log("✅ انتهى إنشاء كل ملفات products.json");
}

main();

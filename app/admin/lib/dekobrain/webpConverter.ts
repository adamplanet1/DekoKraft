import type { WebPConversionResult } from "../../types/dekobrain";

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image-load-failed"));
    image.src = url;
  });
}

export async function convertImageToWebP(file: File, quality: number): Promise<WebPConversionResult> {
  if (file.type === "image/gif") throw new Error("animated-gif-unsupported");
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error("unsupported-format");

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas-unavailable");
    context.drawImage(image, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("conversion-failed")), "image/webp", quality / 100);
    });
    const outputName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    const outputFile = new File([blob], outputName, { type: "image/webp", lastModified: Date.now() });
    return {
      file: outputFile,
      previewUrl: URL.createObjectURL(blob),
      originalSizeBytes: file.size,
      convertedSizeBytes: blob.size,
      percentageSaved: Math.round((1 - blob.size / file.size) * 100),
      width: image.naturalWidth,
      height: image.naturalHeight,
      quality,
    };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}


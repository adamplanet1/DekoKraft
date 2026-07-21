import type { BackgroundStudioType, DekoBrainCompositionSettings } from "../../types/dekobrain";

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("composition-image-load-failed"));
    image.src = url;
  });
}

function exportPng(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("composition-export-failed")), "image/png"));
}

export async function composeProductBackground(input: { productUrl: string; originalUrl: string; backgroundType: BackgroundStudioType; settings: DekoBrainCompositionSettings; uploadedBackgroundUrl?: string }) {
  const product = await loadImage(input.productUrl);
  const original = await loadImage(input.originalUrl);
  const width = original.naturalWidth;
  const height = original.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("composition-canvas-unavailable");
  if (input.backgroundType === "white") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, width, height); }
  else if (input.backgroundType === "color") { context.fillStyle = input.settings.color; context.fillRect(0, 0, width, height); }
  else if (input.backgroundType === "gradient" || input.backgroundType === "smart") { const gradient=context.createLinearGradient(0,0,width,height);gradient.addColorStop(0,input.settings.gradientStart);gradient.addColorStop(1,input.settings.gradientEnd);context.fillStyle=gradient;context.fillRect(0,0,width,height); }
  else if (input.backgroundType === "blur") { const blur=Math.max(12,Math.round(Math.min(width,height)*.03));context.save();context.filter=`blur(${blur}px)`;context.drawImage(original,-blur,-blur,width+blur*2,height+blur*2);context.restore(); }
  else if (input.backgroundType === "upload" && input.uploadedBackgroundUrl) { const background=await loadImage(input.uploadedBackgroundUrl);const ratio=Math.max(width/background.naturalWidth,height/background.naturalHeight);const drawWidth=background.naturalWidth*ratio;const drawHeight=background.naturalHeight*ratio;context.drawImage(background,(width-drawWidth)/2,(height-drawHeight)/2,drawWidth,drawHeight); }
  const safe = Math.min(width, height) * (input.settings.safeArea / 100);
  const baseScale = Math.min((width-safe*2)/product.naturalWidth,(height-safe*2)/product.naturalHeight);
  const drawWidth = product.naturalWidth * baseScale * input.settings.scale;
  const drawHeight = product.naturalHeight * baseScale * input.settings.scale;
  const x = (width-drawWidth)/2 + input.settings.offsetX/100 * (width-drawWidth)/2;
  const y = (height-drawHeight)/2 + input.settings.offsetY/100 * (height-drawHeight)/2;
  context.save();
  if (input.settings.shadow > 0) { context.shadowColor=`rgba(0,0,0,${Math.min(.55,input.settings.shadow/140)})`;context.shadowBlur=input.settings.shadow;context.shadowOffsetY=input.settings.shadow/4; }
  context.drawImage(product,x,y,drawWidth,drawHeight);
  context.restore();
  return exportPng(canvas);
}

export type CanvaDesignType = "instagram-square" | "instagram-story" | "facebook-post" | "product-card" | "custom";
export type CanvaExportPayload = { imageUrl:string;fileName:string;productName?:string;price?:string;text?:string;designType:CanvaDesignType;backgroundMode?:string };
export type CanvaConnectionStatus = "not-configured" | "connecting" | "connected" | "error";

export function buildCanvaExportPayload(input:CanvaExportPayload):CanvaExportPayload {
  return { imageUrl:input.imageUrl,fileName:input.fileName,productName:input.productName?.trim()||undefined,price:input.price?.trim()||undefined,text:input.text?.trim()||undefined,designType:input.designType,backgroundMode:input.backgroundMode };
}

export async function prepareCanvaDesign(payload:CanvaExportPayload):Promise<{status:"preview-only";payload:CanvaExportPayload}> {
  return { status:"preview-only",payload };
}

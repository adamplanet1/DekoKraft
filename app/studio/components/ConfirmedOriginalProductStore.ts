import type { SmartProductSpecifications } from "./SmartEditLearningStore";
import type { SmartEditOptions } from "../../../lib/echo/echoGuide";

export type ConfirmedOriginalProduct = {
  confirmedOriginalProductDNA: SmartProductSpecifications;
  originalImageSource: string | null;
  confirmedAt: string;
};

export type SmartProductWorkingSession = {
  original: ConfirmedOriginalProduct;
  workingCopy: { productDNA: SmartProductSpecifications; smartEditOptions: SmartEditOptions };
};

const clone = <T,>(value: T): T => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value)) as T;

export function saveConfirmedOriginalProduct(productDNA: SmartProductSpecifications, imageSource: string | null): SmartProductWorkingSession {
  const original = { confirmedOriginalProductDNA: clone(productDNA), originalImageSource: imageSource, confirmedAt: new Date().toISOString() };
  const session: SmartProductWorkingSession = {
    original,
    workingCopy: { productDNA: clone(productDNA), smartEditOptions: { preserveShape: true, preserveDetails: true, improveQuality: false } },
  };
  return session;
}

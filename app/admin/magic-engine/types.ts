export type MagicEngineLang = "ar" | "en" | "de" | "fr";

export type EngineStepId =
  | "images"
  | "specifications"
  | "productUnderstanding"
  | "productCard"
  | "productBlueprint"
  | "productContent"
  | "seo"
  | "aiImages"
  | "readyToPublish";

export type EngineStepStatus = "ready" | "waiting" | "notStarted";

export type LocalizedText = Record<MagicEngineLang, string>;

export type MagicEngineStep = {
  id: EngineStepId;
  title: LocalizedText;
  description: LocalizedText;
  status: EngineStepStatus;
};

export type MagicProductImage = {
  id: string;
  name?: string;
  preview?: string;
  role?: string;
};

export type MagicProductInput = {
  name?: string;
  category?: string;
  description?: string;
  colors?: string[];
  images?: MagicProductImage[];
  status?: string;
};

export type MagicProductDraft = {
  name: string;
  category: string;
  description: string;
  colors: string[];
  images: MagicProductImage[];
  status: string;
};

export type MagicEngineResult = {
  draft: MagicProductDraft;
  steps: MagicEngineStep[];
};

/** Supported market identifiers for DekoKraft global expansion. */
export type MarketCode = "germany" | "algeria" | "france" | "usa";

/** Currency codes used by configured markets. */
export type CurrencyCode = "EUR" | "DZD" | "USD";

/** High-level pricing strategy for market-specific product positioning. */
export type PricingStrategy = "premium" | "local" | "competitive";

/** Language codes supported by the global market layer. */
export type LanguageCode = "de" | "en" | "ar" | "fr" | "es";

/** Text direction used by the default market language. */
export type Direction = "ltr" | "rtl";

/** Static market configuration used to localize pricing, language, and layout. */
export interface GlobalMarket {
  code: MarketCode;
  currency: CurrencyCode;
  symbol: string;
  defaultLanguage: LanguageCode;
  supportedLanguages: LanguageCode[];
  direction: Direction;
  pricingStrategy: PricingStrategy;
}

/** Foundation market registry for DekoKraft global commerce. */
export const GLOBAL_MARKETS: GlobalMarket[] = [
  {
    code: "germany",
    currency: "EUR",
    symbol: "€",
    defaultLanguage: "de",
    supportedLanguages: ["de", "en", "ar"],
    direction: "ltr",
    pricingStrategy: "premium",
  },
  {
    code: "algeria",
    currency: "DZD",
    symbol: "دج",
    defaultLanguage: "ar",
    supportedLanguages: ["ar", "fr"],
    direction: "rtl",
    pricingStrategy: "local",
  },
  {
    code: "france",
    currency: "EUR",
    symbol: "€",
    defaultLanguage: "fr",
    supportedLanguages: ["fr", "en"],
    direction: "ltr",
    pricingStrategy: "premium",
  },
  {
    code: "usa",
    currency: "USD",
    symbol: "$",
    defaultLanguage: "en",
    supportedLanguages: ["en", "es"],
    direction: "ltr",
    pricingStrategy: "competitive",
  },
];

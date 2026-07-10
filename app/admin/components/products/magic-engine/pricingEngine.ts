export type MagicCreatorReadablePrice = {
  currency: string;
  visibleTotal?: number;
  finalPrice?: number;
  minimumAcceptablePrice?: number;
  hardMinimumPrice?: number;
};

export function getVisiblePrice(price: MagicCreatorReadablePrice): number {
  return price.visibleTotal ?? price.finalPrice ?? 0;
}

export function getMinimumPrice(price: MagicCreatorReadablePrice): number {
  return price.hardMinimumPrice ?? price.minimumAcceptablePrice ?? 0;
}

export function getPricingSummary(price: MagicCreatorReadablePrice): string {
  return `Visible price: ${getVisiblePrice(price)} ${price.currency}. Minimum price: ${getMinimumPrice(price)} ${price.currency}.`;
}

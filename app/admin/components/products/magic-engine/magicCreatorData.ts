import {
  woodenLaserBoxCustomerOffer,
  woodenLaserBoxDefaultConfiguration,
  woodenLaserBoxManufacturingPackage,
  woodenLaserBoxNegotiationDecision,
  woodenLaserBoxOrder,
  woodenLaserBoxPreview,
  woodenLaserBoxPrice,
  woodenLaserBoxRecipe,
  woodenLaserBoxSample,
} from "./magicCreatorSamples";

// Local read-only data entry point for Magic Creator v1.
// This keeps the first reference flow easy to import later.
export const woodenLaserBoxCreatorFlow = [
  woodenLaserBoxSample,
  woodenLaserBoxDefaultConfiguration,
  woodenLaserBoxRecipe,
  woodenLaserBoxPreview,
  woodenLaserBoxPrice,
  woodenLaserBoxCustomerOffer,
  woodenLaserBoxNegotiationDecision,
  woodenLaserBoxManufacturingPackage,
  woodenLaserBoxOrder,
];

export const magicCreatorReferenceSamples = [woodenLaserBoxSample];

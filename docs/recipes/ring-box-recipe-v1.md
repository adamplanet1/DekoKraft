# Ring Box Recipe v1

## 1. Product Identity

- Product Name: Ring Box
- Product Category: Wooden Gift / Jewelry Packaging
- Studio: Wooden Gift Studio
- Product Code: WGS-RING-BOX-V1

## 2. Available Sizes

- Small single-ring box
- Medium ring box
- Large premium ring box
- Custom size by request

Each size should define width, height, depth, wall thickness, lid style, and insert space before implementation.

## 3. Materials

Examples:

- Oak
- Beech
- Walnut
- MDF

Material choice affects appearance, production constraints, finishing options, and customer-facing value.

## 4. Color / Finish

Possible finishes:

- Natural wood
- Clear varnish
- Dark stain
- Light stain
- Painted finish
- Unfinished raw wood

Finish options should be compatible with the selected material.

## 5. Engraving Options

- None
- Text
- Logo
- Image

Engraving can be placed on the lid, inside lid, front face, or custom position depending on size and material.

## 6. Configuration Variables

- selectedSize
- customWidth
- customHeight
- customDepth
- material
- finish
- engravingType
- engravingText
- uploadedLogo
- uploadedImage
- engravingPosition
- quantity
- packagingType
- giftMessage

## 7. Manufacturing Rules

- Recipe must define final dimensions before production.
- Material must be selected before pricing or manufacturing.
- Engraving files must be reviewed before production.
- Logo or image engraving requires usable source artwork.
- Custom sizes require manual review before publishing.
- Wall thickness must match selected material and box size.
- Lid fit must be checked before production.
- Recipe is the manufacturing source of truth.

## 8. Packaging

Packaging options:

- Standard protective packaging
- Gift-ready packaging
- Premium presentation packaging
- Custom brand packaging by request

Packaging should protect the box and match the selected product positioning.

## 9. Estimated Production Time

Initial estimate:

- Standard product: 30-60 minutes
- Engraved product: 45-90 minutes
- Custom size or premium finish: manual review required

Production time depends on material, size, engraving, finish, and packaging.

## 10. Pricing Variables

List variables only. No calculations.

- materialCost
- woodThickness
- boxSize
- cuttingTime
- engravingTime
- assemblyTime
- finishCost
- packagingCost
- quantity
- customizationComplexity
- artworkReviewNeeded
- margin
- minimumAcceptablePrice
- hardMinimumPrice

## 11. Required Engines

Reference only:

- Wizard Engine
- Configuration Engine
- Pricing Engine
- Preview Engine
- Knowledge Engine

## 12. Success Criteria

This Product Recipe is considered complete when:

- Product identity is clear.
- Supported sizes are defined.
- Supported materials are defined.
- Finish options are documented.
- Engraving options are documented.
- Configuration variables are complete.
- Manufacturing rules are clear.
- Packaging options are defined.
- Estimated production time is documented.
- Pricing variables are listed without calculations.
- Required engines are identified.
- A customer can configure a Ring Box through the shared platform flow without custom engine changes.

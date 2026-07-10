# Magic Web Roadmap

## Project Vision

DekoKraft CMS is the admin system for managing DekoKraft products, media, product content, and future store operations.

The Magic Web idea is to turn the CMS into a smart creation studio: a place where a product can be described naturally, supported with images and colors, and gradually transformed into structured product data, store content, SEO content, image plans, and publish-ready product pages.

The current focus is smart product creation. The Product Modal is becoming the first “Magic Web” workspace: upload images, describe the product, select colors, assign image roles, preview smart analysis, preview a product card, preview a full blueprint, and track progress through a product engine pipeline.

Future SaaS direction: this system may evolve into a reusable multilingual smart-commerce CMS for creators, handmade shops, small businesses, and product teams. It should remain modular, safe, multilingual, and ready for later AI/backend integrations.

## Current Implemented Product Workflow

The current product workflow is UI/local-state only. There is no backend saving, no real AI call, and no file processing yet.

- Product modal: existing modal opened from the Products page Add Product button.
- Product name: basic product name input.
- Category: basic category input.
- Price: numeric price input.
- Status: status select with Active, Draft, and Archived.
- Smart product description: large `productDescription` textarea for writing product specifications in natural language.
- Color picker: single color field opens a small panel with preset colors and native `type="color"` picker.
- Custom color request: text input for future customer special color orders.
- Multi-image upload: allows selecting multiple images, currently capped to 4 local preview slots.
- Image roles: each uploaded image can be assigned a role:
  - Main product image
  - Gallery image
  - Color group image
  - AI reference image
  - Catalog image
  - Social media image
- Image ordering: uploaded images can be reordered locally with drag and drop.
- Smart Analysis: local “Analyze Specifications” button reveals a Product Understanding panel with placeholder result rows.
- Build Product Card: local button reveals a placeholder product card preview.
- Smart Product Blueprint: local button reveals grouped placeholder sections for identity, details, marketing, SEO, and store metadata.
- Smart Product Engine pipeline: local visual pipeline showing steps and statuses for Images, Specifications, Product Understanding, Product Card, Product Blueprint, Product Content, SEO, AI Images, and Ready to Publish.

## Current Components And Folders

### `app/admin/components/products/ProductModal.tsx`

Main smart product creation modal. It currently contains the local UI foundation for product fields, smart product description, color selection, custom color request, image uploads, image roles, Smart Analysis, Build Product Card, Smart Product Blueprint, and Smart Product Engine pipeline.

### `app/admin/components/products/ProductsToolbar.tsx`

Top products page toolbar. Shows localized title/subtitle and the Add Product button. The button receives `onAddProduct` from the Products page and opens the modal.

### `app/admin/components/products/ProductSearch.tsx`

Reusable controlled search input. Receives `lang`, `value`, and `onChange`. Uses localized placeholders for Arabic, English, German, and French.

### `app/admin/components/products/ProductFilters.tsx`

Reusable controlled filters bar. Receives `lang`, `category`, `status`, `onCategoryChange`, and `onStatusChange`. Uses localized category/status labels and placeholders.

### `app/admin/components/products/ProductsTable.tsx`

Reusable products table layout. Receives `products` and `lang`. Currently supports empty-state display and localized column headers. It is not connected to backend data yet.

### `app/admin/components/products/ProductRow.tsx`

Reusable table row foundation for a single product. Shows placeholder image area, product name, category, price, status badge, and edit/delete buttons with localized labels.

### `app/admin/components/ProductGallery.tsx`

Existing gallery-related component. It is outside the new smart modal workflow and should be treated carefully unless the user specifically asks to update gallery behavior.

### `ProductImages.tsx`

Planned/expected product image module name. If added later, it should own reusable image upload, preview, role, sorting, and image processing UI logic currently living inside `ProductModal.tsx`.

### `ProductPrices.tsx`

Planned/expected product pricing module name. If added later, it should own product price, old price, currency, discount, and offer logic.

### `ProductSpecifications.tsx`

Planned/expected product specifications module name. If added later, it should own structured specs extracted from natural language product descriptions.

### `ProductSections.tsx`

Planned/expected product sections module name. If added later, it should help split product creation into clean reusable sections inside the modal or editor.

### `app/globals.css`

Global admin styling. Contains the current layout, products page styles, modal styles, Smart Analysis card styles, Product Card preview styles, Blueprint styles, Smart Product Engine styles, image preview styles, and responsive behavior.

### `app/admin/types.ts`

Admin type definitions. Currently includes `ProductRow` and product fields such as category, titles, price, color, `availableColors`, and `customColorRequest`.

### `app/admin/data`

Admin data folder area if present/added later. Should be used for local admin-only constants or seed-like configuration, not backend persistence unless explicitly requested.

### `app/api/admin`

Admin API route area. Existing API code should not be expanded or connected from the smart product workflow unless the user explicitly requests backend integration.

## Rules For Future Codex Work

- Make small safe changes.
- Modify only the files requested by the user.
- Do not add backend behavior unless explicitly requested.
- Do not make real AI calls yet.
- Do not save products or files unless explicitly requested.
- Always keep Arabic, English, German, and French labels when touching user-facing product UI.
- Preserve current local UI behavior unless the user asks to change it.
- Run ESLint after changes for the files that were changed.
- Prefer local state and placeholders while the workflow is still in prototype mode.
- Keep product work modular so future extraction into smaller components stays easy.

## Next Roadmap

- Connect Product Engine steps to real local state more deeply.
- Improve modal sections and reduce visual density.
- Add real product draft state.
- Add local product preview.
- Add save draft later.
- Add backend later.
- Add AI later.
- Add image generation later.
- Add SEO generation later.
- Add learning/game product modules later.
- Extract large modal sections into reusable product components when requested.
- Add validation for required fields and 3 to 4 image requirements.
- Add structured product data model once the UI workflow is stable.

## How To Continue In A New Codex Session

Before making changes in a new Codex session, read this file first:

`MAGIC_WEB_ROADMAP.md`

Use it to understand the current Magic Web direction, what is already implemented, what must remain local-only, and which safety rules apply. After reading it, inspect the specific files mentioned by the user and only modify the requested files.

# Magic Web Architecture

## Purpose

Magic Web is a smart product creation system inside DekoKraft CMS. Its purpose is to help turn a small amount of product input into a complete, multilingual, publish-ready product experience.

The system starts with simple human input: product images, basic product fields, and natural-language specifications. Over time, Magic Web will help generate structured product data, product content, SEO metadata, image plans, gallery order, and publishing readiness.

## Main Flow

```text
Product images + product specifications
→ Smart Product Analysis
→ Product Understanding
→ Product Card
→ Product Blueprint
→ Product Content
→ SEO
→ AI Image Planning
→ Gallery Ordering
→ Ready to Publish
```

## Engine Modules

### `image-engine`

Future module for handling product images. It may manage uploads, previews, image roles, ordering, validation, optimization, WebP conversion, background removal, and image quality checks.

### `analysis-engine`

Future module for analyzing product specifications and images. It may extract product category, materials, colors, scent, dimensions, keywords, product type, and missing information.

### `product-engine`

Future module for building the structured product object. It should combine manual fields, analysis results, image roles, colors, pricing, status, and generated draft data.

### `seo-engine`

Future module for SEO content. It may generate SEO titles, descriptions, URL slugs, suggested keywords, image ALT text, and multilingual search metadata.

### `gallery-engine`

Future module for deciding gallery order and image usage. It may choose the main image, gallery images, catalog image, social media image, AI reference image, and color group images.

### `publishing-engine`

Future module for publish readiness. It should check required fields, required images, missing translations, SEO completeness, pricing, category, and product status before publishing.

### `ai-engine`

Future module for AI integrations. It should be optional, controlled, and never required for the manual product workflow to work.

## Data Principles

- The user enters only a few fields whenever possible.
- The system helps generate the rest.
- Manual mode must always work.
- AI will be added later.
- Backend will be added later.
- No feature should depend only on AI.
- Generated data should remain editable by the user.
- The product workflow should support drafts before publishing.
- Local UI prototypes should not imply that data is saved.

## Product Creation Philosophy

The user should be able to upload product images and write simple product specifications in natural language. Magic Web should then help build a complete product page from that input.

The goal is not to replace the creator. The goal is to reduce repetitive work, organize product details, suggest useful content, and guide the product toward a publish-ready state.

## Multilingual Rules

Magic Web product UI should support:

- Arabic
- English
- German
- French

Arabic must keep RTL support. Product labels, helper text, generated placeholders, and future product content should be designed with multilingual output in mind.

## Future SaaS Vision

This architecture can later become a SaaS product for creators, artisans, small shops, and specialized product businesses.

Possible future audiences and product types include:

- Handmade creators
- Artisans
- Small online shops
- Educational games
- Encyclopedic products
- Candles
- Wooden products
- Gift products
- Custom services
- Personalized products

Magic Web should stay modular enough that each store or product category can use only the engines it needs.

## How Codex Should Use This File

Codex must read this file before changing product architecture.

Before editing architecture, product engine logic, AI flow, image flow, publishing flow, or data models, Codex should also check:

- `MAGIC_WEB_ROADMAP.md`
- `MAGIC_WEB_RULES.md`
- `MAGIC_WEB_CHANGELOG.md`
- `MAGIC_WEB_IDEAS.md`

Architecture work should stay small, explicit, and aligned with the current local-first prototype unless the user clearly asks to connect backend, AI, saving, or publishing behavior.

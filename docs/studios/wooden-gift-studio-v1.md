# Wooden Gift Studio Blueprint v1

## 1. Purpose

The Wooden Gift Studio is the first complete Studio used to validate the platform architecture.

It focuses on configurable wooden gift products that can move through the shared Magic Creator flow: sample selection, configuration, recipe, preview, price, decision, and checkout. The Studio proves that a focused product family can use common platform engines without requiring custom engine logic for every product.

## 2. Starter Products

The Wooden Gift Studio starts with five products:

- Ring Box
- Jewelry Box
- Gift Box
- Memory Box
- Custom Wooden Box

Each starter product should be simple enough to configure, preview, price, and prepare for production through the shared platform model.

## 3. Shared Engines

The Studio uses existing shared engines without modifying them:

- Wizard Engine: guides the customer through the creator journey.
- Configuration Engine: validates selected dimensions, material, color, decoration, text, and quantity.
- Pricing Engine: reads or prepares pricing data for the configured product.
- Decision Engine: determines whether the current configuration can continue.
- Knowledge Engine: provides product rules, production guidance, and improvement notes.
- Preview Engine: generates or displays product previews from configuration and recipe data.

The Studio should provide data and rules to these engines, not change the engines themselves.

## 4. Studio Recipe

The Studio contains only product recipes and business rules.

Recipes define how each wooden gift product is produced, including materials, dimensions, supported decorations, generated outputs, production constraints, and workshop requirements.

Business rules define limits such as supported sizes, allowed materials, decoration options, minimum quantities, quality checks, and publishing readiness.

The Studio does not own the shared platform flow. It only contributes product-specific knowledge.

## 5. Success Criteria

A customer can configure a box from start to checkout using the existing platform engines.

Success means:

- The customer can choose one of the starter wooden gift products.
- The customer can configure the box.
- The platform can produce a recipe-driven preview.
- The platform can show a price.
- The platform can evaluate readiness.
- The platform can prepare checkout and production data through the existing shared engines.

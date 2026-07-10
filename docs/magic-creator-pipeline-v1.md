# Magic Creator Pipeline v1

Magic Creator converts a selected Sample into a confirmed Order through a controlled pipeline. Each stage has a clear role, input, output, generator, and dependency chain.

## 1. Sample

### Purpose

Defines the starting product or design template the customer can customize.

### Input

Reference product data, product identity, available capabilities, and allowed customization options.

### Output

A selected Sample.

### What Generates It

Admin-created product reference data or approved internal sample definitions.

### What Depends on It

Configuration depends on Sample because the Sample defines what can be customized.

## 2. Configuration

### Purpose

Captures the customer-selected options for the Sample.

### Input

Selected Sample and customer choices such as dimensions, material, color, decoration, text, uploaded image, quantity, and optional customer offer.

### Output

A Configuration object.

### What Generates It

Customer input through the Magic Creator UI.

### What Depends on It

Recipe, Preview, Price, Manufacturing Package, and Order depend on Configuration.

## 3. Recipe

### Purpose

Normalizes the Configuration into the manufacturing source of truth.

### Input

Sample and Configuration.

### Output

A Recipe describing production requirements, supported materials, machine needs, generated outputs, and manufacturing instructions.

### What Generates It

The Magic Creator recipe builder.

### What Depends on It

Preview, Price, Manufacturing Package, and Order documents depend on Recipe.

## 4. Preview

### Purpose

Shows the customer and team what the configured product should look like or how it should be produced.

### Input

Recipe and Configuration.

### Output

Preview data such as preview image, technical drawing preview, or production preview.

### What Generates It

The preview generator.

### What Depends on It

Customer review, Manufacturing Package, and Order confirmation can depend on Preview.

## 5. Price

### Purpose

Calculates customer-facing price and internal pricing boundaries.

### Input

Recipe, Configuration, materials, production method, quantity, and pricing rules.

### Output

Price data including calculated price, visible total, minimum acceptable price, and hard minimum price.

### What Generates It

The pricing engine.

### What Depends on It

Customer Offer, Negotiation, and Order depend on Price.

## 6. Customer Offer

### Purpose

Captures an optional price proposed by the customer.

### Input

Configuration, visible Price, and customer-entered offer.

### Output

CustomerOffer data.

### What Generates It

Customer input through the offer step.

### What Depends on It

Negotiation depends on Customer Offer when an offer is submitted.

## 7. Negotiation

### Purpose

Evaluates the Customer Offer against business limits and decides whether to accept, reject, counter, suggest installments, or simplify the design.

### Input

Customer Offer, Price, hard minimum price, minimum acceptable price, and business rules.

### Output

NegotiationDecision.

### What Generates It

The negotiation decision layer.

### What Depends on It

Order depends on NegotiationDecision when negotiation is used.

## 8. Manufacturing Package

### Purpose

Prepares the workshop-ready production package.

### Input

Recipe, Configuration, Preview, Price, and final order intent.

### Output

ManufacturingPackage containing production files, material list, machine settings, operator notes, and estimated production time.

### What Generates It

The manufacturing package generator.

### What Depends on It

Order and workshop production depend on Manufacturing Package.

## 9. Order

### Purpose

Closes the Magic Creator loop and records the confirmed customer order.

### Input

Sample, Configuration, Recipe, Preview, Price, Customer Offer, NegotiationDecision, and ManufacturingPackage.

### Output

Order data with payment status, production status, final price, and references to all pipeline stages.

### What Generates It

The order confirmation layer.

### What Depends on It

Payment, production scheduling, fulfillment, and customer communication depend on Order.

## Golden Rules

- Only Configuration is directly editable by the customer.
- Everything else is generated from Configuration and Recipe.
- UI displays data but does not decide.
- Recipe is the manufacturing source of truth.

# Universal Product Model v1

## 1. Vision

Every offering in Einkauf Centrum Plus is a Product.

A Product can be a physical item, a service, a custom-made object, a digital preparation step, a manufacturing workflow, or a hybrid of these. The model treats all offerings consistently so the system can support simple catalog products today and richer Magic Creator workflows later.

## 2. Product DNA

### Identity

Identity describes what the Product is: name, description, status, brand, audience, and customer-facing meaning.

### Capabilities

Capabilities describe what the Product can do or support. They are reusable building blocks such as laser cutting, embroidery, customization, packaging, or 3D printing.

### Recipe

Recipe describes how the Product is produced. It is the manufacturing source of truth and defines the steps, materials, machines, outputs, and production constraints.

### Pricing

Pricing describes how the Product is valued, including visible customer prices, internal costs, margins, minimum acceptable prices, and negotiation boundaries.

### Manufacturing

Manufacturing describes the production package generated from the Recipe, such as files, material lists, machine settings, operator notes, and reports.

### Knowledge

Knowledge describes reusable rules, notes, constraints, business assumptions, and production guidance used to improve product creation and operation.

## 3. Capability Model

Products are defined by capabilities, not categories.

Categories are useful for browsing, but capabilities are what make the system flexible. A Product can combine multiple capabilities without needing a new product type for every business idea.

Examples:

- Laser
- Embroidery
- 3D Printing
- Candle
- Customization
- Packaging

A wooden box, for example, may use Laser, Customization, and Packaging capabilities. A gift set may combine Candle, Packaging, and Customization capabilities.

## 4. Recipe Model

Products never know machines.

Recipes know machines.

This keeps the Product model clean and reusable. A Product describes the offer and its capabilities, while a Recipe describes how that offer is produced with a specific machine, workflow, file format, or manufacturing method.

For example, a Product may support the Laser capability. The Recipe decides whether it needs a laser cutter, which file outputs are required, which material thicknesses are supported, and what production method should be used.

## 5. Architecture Laws

- Generic before specific.
- Products do not know machines.
- Recipe is the source of manufacturing truth.

## 6. Future Expansion

New machines, services, and workflows should be added by introducing new capabilities and recipes instead of redesigning Products.

If Einkauf Centrum Plus adds a new machine, the system can add a new Recipe that knows how to use it. If a new service is introduced, the system can add a capability and connect it to existing or new Products. This keeps the model open for future business ideas without forcing product data to be rewritten each time the workshop grows.

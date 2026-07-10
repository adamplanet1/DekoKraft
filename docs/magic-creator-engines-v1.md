# Magic Creator Engines v1

Magic Creator v1 is organized as a set of focused engines. Each engine owns one part of the custom order journey and passes structured data to the next layer.

## Engine Independence Principle

Each engine has a single responsibility and can evolve independently.

An engine should not take over another engine's job. This keeps Magic Creator easier to test, extend, and replace as Einkauf Centrum Plus adds new machines, services, products, and workflows.

## 1. Wizard Engine

### Purpose

Controls the customer-facing journey structure from Sample selection to Order confirmation.

### Input

Available steps, current step, completion state, and read-only pipeline data.

### Output

The current wizard step, step availability, and step display state.

### Responsibilities

- Define the order of the Magic Creator journey.
- Show which step is available, locked, or completed.
- Guide the customer through the flow.
- Keep the UI journey consistent.

### What It Must NOT Do

- It must not calculate prices.
- It must not generate manufacturing data.
- It must not decide negotiation outcomes.
- It must not modify Recipe truth.

### Dependencies

Depends on step definitions and high-level pipeline state.

## 2. Configuration Engine

### Purpose

Transforms customer choices into a valid Configuration.

### Input

Selected Sample, allowed customization options, and customer selections.

### Output

Configuration data.

### Responsibilities

- Validate customer-editable options.
- Normalize selected dimensions, material, color, decoration, text, images, quantity, and optional offer fields.
- Ensure every Configuration belongs to a Sample.
- Trigger downstream updates when customer choices change.

### What It Must NOT Do

- It must not calculate final price.
- It must not generate production files.
- It must not decide which machine is used.
- It must not accept or reject customer offers.

### Dependencies

Depends on Sample and allowed configuration rules.

## 3. Pricing Engine

### Purpose

Calculates customer-facing price and internal pricing boundaries.

### Input

Recipe, Configuration, materials, quantity, production method, and pricing rules.

### Output

Price data including calculated total, visible total, minimum acceptable price, hard minimum price, and optional installment suggestion.

### Responsibilities

- Calculate price from production requirements.
- Keep internal cost details hidden from the customer.
- Provide safe negotiation limits.
- Support future installment suggestions.

### What It Must NOT Do

- It must not edit Configuration.
- It must not generate previews.
- It must not produce manufacturing files.
- It must not accept an order by itself.

### Dependencies

Depends on Recipe, Configuration, material assumptions, and pricing rules.

## 4. Decision Engine

### Purpose

Evaluates business decisions such as negotiation outcomes and order readiness.

### Input

Customer Offer, Price, hard minimum price, minimum acceptable price, and business rules.

### Output

NegotiationDecision or readiness decision data.

### Responsibilities

- Accept, reject, or counter customer offers.
- Suggest installment or simplified design when appropriate.
- Protect the hard minimum price.
- Keep decision results explainable.

### What It Must NOT Do

- It must not expose hidden pricing details to the customer.
- It must not generate manufacturing files.
- It must not change the Recipe.
- It must not directly edit customer Configuration.

### Dependencies

Depends on Price, Customer Offer, business limits, and negotiation rules.

## 5. Recommendation Engine

### Purpose

Suggests helpful next actions, improvements, or business guidance.

### Input

Sample, Configuration, Recipe, Preview, Price, NegotiationDecision, and pipeline status.

### Output

Recommendation data such as next action, improvement suggestion, or business tip.

### Responsibilities

- Identify missing or weak product configuration data.
- Suggest clearer decoration, better images, quantity changes, or price-related next steps.
- Provide non-blocking guidance to the customer or admin.
- Support future marketing and manufacturing recommendations.

### What It Must NOT Do

- It must not make final business decisions.
- It must not override the Decision Engine.
- It must not modify the Recipe.
- It must not save changes automatically.

### Dependencies

Depends on current pipeline data and recommendation rules.

## 6. Knowledge Engine

### Purpose

Stores and retrieves reusable internal knowledge for Magic Creator.

### Input

Product rules, material constraints, pricing assumptions, production notes, configuration guidance, and future ideas.

### Output

Knowledge records or guidance that other engines can use.

### Responsibilities

- Keep reusable rules and notes organized.
- Support product, material, and manufacturing guidance.
- Capture FutureIdea records without disrupting v1 development.
- Provide context for future engines.

### What It Must NOT Do

- It must not decide orders.
- It must not calculate prices.
- It must not generate files.
- It must not directly control the UI journey.

### Dependencies

Depends on internal knowledge records, FutureIdea records, and approved business rules.

## 7. Manufacturing Engine

### Purpose

Generates workshop-ready manufacturing data from Recipe and Configuration.

### Input

Recipe, Configuration, Preview, Price, and confirmed production intent.

### Output

ManufacturingPackage with production files, material list, machine settings, operator notes, and production report.

### Responsibilities

- Generate or prepare DXF, SVG, LightBurn files, technical drawings, and reports.
- Build the workshop package.
- Translate Recipe truth into production-ready data.
- Keep manufacturing data aligned with Configuration changes.

### What It Must NOT Do

- It must not decide customer price.
- It must not accept negotiations.
- It must not edit customer Configuration directly.
- It must not treat Preview as the source of truth.

### Dependencies

Depends on Recipe, Configuration, Preview, Price, and manufacturing rules.

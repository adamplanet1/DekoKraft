# Magic Orchestrator v1

## 1. Purpose

The Magic Orchestrator coordinates Magic Creator engines.

It decides which engine should run, in what order, and with which input data. It does not contain business logic. Business rules, validation, pricing, recommendations, negotiation, and manufacturing decisions belong inside their dedicated engines.

The Orchestrator is a coordination layer, not a decision layer.

## 2. Managed Engines

The Orchestrator may coordinate these engines:

- Wizard Engine
- Configuration Engine
- Decision Engine
- Pricing Engine
- Negotiation Engine
- Knowledge Engine
- Manufacturing Engine

Each engine owns one responsibility and exposes a defined input/output contract.

## 3. Engine Flow

The initial Magic Creator v1 flow is:

1. Wizard Engine identifies the current step and journey state.
2. Configuration Engine produces and validates the Configuration.
3. Decision Engine checks whether the current creator state can continue.
4. Pricing Engine reads pricing data or prepares pricing output.
5. Negotiation Engine evaluates customer offer data when negotiation is available.
6. Knowledge Engine supplies reusable rules, guidance, and future ideas.
7. Manufacturing Engine prepares workshop-ready package data.

The Orchestrator passes data between engines and collects their outputs for the UI or future persistence layer.

## 4. Engine Independence Principle

Engines never call each other directly.

An engine should not import another engine to continue the workflow. Instead, the Orchestrator calls each engine, receives its output, and passes the needed data to the next engine.

This keeps engines independent, testable, replaceable, and easier to evolve.

## 5. Event Flow (Future)

Future versions may replace direct orchestration with events.

For example:

- `configuration.updated`
- `recipe.generated`
- `price.updated`
- `offer.submitted`
- `negotiation.decided`
- `manufacturing.package.generated`
- `order.confirmed`

In an event-based model, engines react to events instead of being called directly in a fixed sequence. This can make the system more flexible as Magic Creator grows, especially when backend processing, async manufacturing file generation, or external integrations are introduced.

## 6. Engine Contracts

Every engine has defined inputs and outputs.

An engine contract should explain:

- What data the engine accepts.
- What data the engine returns.
- What the engine is responsible for.
- What the engine must not do.
- Which errors or blocked states it can report.

The Orchestrator depends on these contracts. Stable contracts allow engines to evolve internally without breaking the full Magic Creator flow.

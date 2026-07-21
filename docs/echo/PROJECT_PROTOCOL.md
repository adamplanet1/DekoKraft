# Echo Project Protocol

This file governs development workflow. Domain terminology and invariants are defined exclusively in `docs/echo/PROTOCOL.md`.

## Vision

Echo helps turn an early idea into a clear, trackable mission that can grow with the user.

## Mission

Build a small, understandable foundation for creating missions, completing steps, and learning from future mission history.

## Core Principles

- Keep the domain model explicit and reusable.
- Separate business rules from presentation.
- Prefer deterministic, testable transformations.
- Add infrastructure only when a validated use case requires it.
- Preserve user control and data clarity.

## Development Rules

- Use strict TypeScript and the Next.js App Router.
- Keep UI, domain types, and business logic in separate modules.
- Do not introduce AI, APIs, or persistence before their planned sprint.
- Avoid duplicate models and parallel sources of truth.
- Validate changes with TypeScript, lint, and focused behavior checks.

## Sprint Workflow

1. Define one narrow sprint goal and acceptance criteria.
2. Inspect the current implementation and relevant decisions.
3. Implement the smallest compatible change.
4. Verify behavior and technical checks.
5. Record architectural decisions when direction or constraints change.

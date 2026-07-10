# Engine Contracts Specification v1

## 1. Purpose

Every engine communicates only through contracts.

Contracts define what an engine accepts, what it returns, which events it emits, and which errors it can report. This keeps engines independent and prevents hidden dependencies between internal logic.

The goal is to make the platform easier to maintain, test, replace, and scale as DekoKraft grows.

## 2. Contract Structure

Each engine contract defines:

### Input

The data required by the engine to perform its responsibility.

Input should be explicit, typed, and limited to what the engine truly needs.

### Output

The data returned by the engine after it runs.

Output should be stable, understandable, and safe for other systems to consume.

### Events

The events emitted when important work is completed or blocked.

Examples:

- `ConfigurationValidated`
- `RecipeCompleted`
- `PricingPrepared`
- `OrderDelivered`

### Errors

The errors or blocked states the engine can report.

Errors should be descriptive enough for the Orchestrator, admin, or creator to understand what must happen next.

## 3. Engine Independence

Engines never call each other's internal logic.

They communicate only through contracts and events. An engine should not import another engine to continue the workflow. Instead, the Orchestrator passes outputs from one engine into another engine's contract.

This protects each engine's responsibility and keeps internal changes from breaking unrelated parts of the platform.

## 4. Versioning

Contracts must evolve without breaking compatibility.

### v1

The first stable version of a contract.

### v2

A newer version that may add fields, clarify outputs, or support new workflows.

### Deprecated

A contract version that should no longer be used for new work but may remain available for existing flows until migration is complete.

Versioning rules:

- Do not remove required fields without a new version.
- Prefer adding optional fields before creating a breaking change.
- Document migration notes when a contract changes.
- Keep deprecated contracts available long enough for dependent workflows to move.

## 5. Benefits

### Maintainability

Contracts make engine boundaries clear and reduce accidental coupling.

### Scalability

New engines, workflows, and studios can be added without rewriting existing engines.

### Testability

Each engine can be tested with known input and expected output.

### Replaceability

An engine can be replaced or upgraded as long as it continues to satisfy the same contract.

# Mission Analyzer Specification v0.1

Status: **Historical specification — implemented and accepted in Sprint 7**

This document preserves the reviewed pre-implementation specification that guided Sprint 7. The operational architecture and ownership are recorded in `PROTOCOL.md`, `ARCHITECTURE.md`, `RESPONSIBILITY_MATRIX.md`, and ADR-012. The requirements below remain the historical acceptance baseline.

## Purpose

Mission Analyzer converts a validated mission request into a small, deterministic description that Planner can use. It exists to keep interpretation separate from step generation: Analyzer describes the request; Planner decides the ordered plan.

Analyzer is responsible for:

- Classifying the kind of mission.
- Detecting information required for deterministic planning that is missing.
- Estimating planning complexity at a coarse level.
- Reporting whether planning can proceed.
- Supplying non-binding planning hints derived from the input.

Analyzer is not responsible for creating steps, creating or updating Missions, orchestrating components, storing state, executing work, or making decisions on behalf of the user.

## Input

Analyzer receives one immutable value:

```ts
interface MissionAnalysisInput {
  title: string;
  goal: string;
}
```

- `title` is the proposed Mission title derived from the user's idea.
- `goal` is the proposed intended outcome.

Both fields are strings and must be interpreted without mutation. Analyzer receives no React state, MissionStore instance, existing Mission snapshot, generated steps, user profile, history, external context, or services.

A current Mission is intentionally not an input in v0.1. In the existing lifecycle, analysis precedes planning and Mission creation; therefore no Mission domain object exists at analysis time. Analysis of an existing Mission would require a separate, justified contract.

## Output

Analyzer returns one immutable result:

```ts
type MissionKind = "learning" | "building" | "generic";

type MissionComplexity = "low" | "medium" | "high";

interface MissionAnalysis {
  kind: MissionKind;
  missingInformation: string[];
  complexity: MissionComplexity;
  planningPossible: boolean;
  planningHints: string[];
}
```

Field rules:

- `kind` describes the request using the currently supported planning categories.
- `missingInformation` contains concise facts needed to produce a useful deterministic plan. An empty array means no required information is known to be missing.
- `complexity` is a deterministic planning estimate, not a duration, cost, risk score, or guarantee.
- `planningPossible` states whether the supplied title and goal contain enough information for Planner to proceed.
- `planningHints` contains ordered, non-binding guidance for Planner. It never contains `MissionStep` objects or executable actions.

No identity, timestamps, progress, status, steps, confidence score, user data, or persistence metadata belongs in `MissionAnalysis`. Those fields are either owned by the Mission domain or are not justified by the current foundation.

## Validation and Determinism

- The same normalized input must always produce the same analysis.
- Analyzer must not silently repair or mutate its input.
- Whitespace-only title or goal is missing information.
- `planningPossible` must be derived from explicit validation rules, not intuition or external knowledge.
- Every missing-information item and planning hint must be explainable from the supplied title and goal.
- Output arrays must be newly created values and must not expose mutable internal state.

Sprint 7 defined and tested exact classification, complexity, and readiness rules. It replaced the previous classification ownership deliberately; duplicate classification rules remain forbidden.

## Responsibilities

Mission Analyzer answers only these questions:

1. What supported kind of mission is this?
2. Which planning-critical information is missing?
3. What is its coarse planning complexity?
4. Is deterministic planning currently possible?
5. Which bounded hints may help Planner choose a plan?
6. Should the application request clarification before planning?

The answer to the final question is represented by `planningPossible` and `missingInformation`. Analyzer reports the condition; EchoKernel coordinates any future clarification behavior. Analyzer does not communicate with React or the user.

## Non-Responsibilities

Mission Analyzer must never:

- Create, order, complete, or modify Mission steps.
- Create a Mission or calculate its progress or status.
- Store, retrieve, select, update, or delete Missions.
- Mutate a Mission, request, or Store snapshot.
- Render or update React UI.
- Call Planner, StepGenerator, MissionEngine, MissionState, or MissionStore directly.
- Own execution, clarification workflow, or component orchestration.
- Use AI, an LLM, an API, the internet, memory, learning, or external knowledge.
- Produce business recommendations or automatic user decisions.

## Interaction Contract

The implemented creation flow is:

```text
React UI
    ↓ mission request
EchoKernel
    ↓ analyze(input)
Mission Analyzer
    ↑ MissionAnalysis
EchoKernel
    ↓ plan(input, analysis)
Planner
    ↑ MissionStep[]
EchoKernel
    ↓ execute(input, steps)
MissionEngine
    ↑ Mission
EchoKernel
    ↓ add mission
MissionStore
```

All arrows between domain components are coordinated by EchoKernel. The visual sequence `MissionAnalyzer → Planner` means that Kernel passes the analysis result forward; Analyzer never invokes Planner itself.

React continues to communicate only with EchoKernel. Planner remains the sole owner of plan creation, MissionEngine remains the owner of Mission creation, and MissionStore remains the single source of truth for Mission lifetime.

Analysis failure does not create a partial Mission or write anything to MissionStore. EchoKernel exposes a typed `analysis_blocked` result without changing domain state implicitly.

## Ownership Boundaries

| Rule or value | Owner |
| --- | --- |
| Capture title and goal | React UI |
| Coordinate analysis and subsequent stages | EchoKernel |
| Mission kind and planning readiness | Mission Analyzer |
| Missing-information and complexity rules | Mission Analyzer |
| Ordered Mission steps | Planner through StepGenerator |
| Mission creation and creation validation | MissionEngine |
| Step transitions, progress, and status | Mission State |
| Mission lifetime and snapshots | MissionStore |

Mission classification has one owner: Mission Analyzer. Classification logic is absent from Planner and StepGenerator.

## Future Extension Points

The following are explicitly future work and are not part of v0.1:

- Risk analysis.
- Dependency discovery.
- Time estimation.
- External knowledge.
- Broader language understanding.
- Analysis of an existing Mission.
- Domain-specific analysis policies.

Each extension requires demonstrated need, a protocol-compatible contract, an ownership decision, and focused tests before implementation.

## Out of Scope

- AI and LLMs.
- APIs, internet access, and external services.
- Learning, Memory, Brain, or Intelligence modules.
- Database or persistent analysis results.
- Business recommendations.
- Automatic decisions or autonomous execution.
- New Mission fields, statuses, or lifecycle transitions.
- Changes to the current Mission Workspace.

## Implementation Closure Notes

- Sprint 7 revised `PROTOCOL.md` to include the operational Analyzer.
- ADR-012 transferred classification from StepGenerator to Mission Analyzer without duplication.
- `ARCHITECTURE.md` describes Analyzer as a current component coordinated only by EchoKernel.
- No current document supports a separate Mission description field. The input consequently uses the existing domain terms `title` and `goal`.

## Sprint 7 Acceptance Baseline

The accepted implementation remains conformant while:

- Its public input and output match this minimal contract or an explicitly reviewed revision.
- EchoKernel remains the sole orchestrator and public application boundary.
- Analyzer is deterministic and has no side effects.
- Planner alone creates steps.
- MissionEngine, Mission State, and MissionStore responsibilities remain unchanged.
- Classification has one implementation owner and no duplicated rules.
- Unit tests cover every analysis field, invalid input, deterministic output, and mutation isolation.
- No out-of-scope capability is introduced.

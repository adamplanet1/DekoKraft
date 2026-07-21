# Echo Protocol v0.2 — Domain Foundation

This document is the single source of truth for Echo domain language and rules. Architecture describes implementation structure; this protocol defines what the concepts mean.

## Mission

A Mission is a trackable unit of work created from one analyzed, non-empty idea and one Planner-produced sequence of steps.

Required properties:

- `id`: unique mission identity.
- `title`: the trimmed user idea.
- `goal`: the intended outcome.
- `status`: current lifecycle state.
- `progress`: number of completed steps.
- `createdAt` and `updatedAt`: ISO timestamps.
- `steps`: ordered, non-empty step collection.

MissionEngine creates a Mission. Mission State produces immutable step transitions. MissionStore owns its in-memory lifetime. Echo has no user-account ownership model in v0.2; “ownership” means the Store is authoritative for Mission state.

## Step

A Step is one ordered action within exactly one Mission snapshot. It has an `id`, a title, and a completion flag.

- Planner owns plans and StepGenerator constructs their steps.
- A Mission must contain at least one step; current plans contain three to seven.
- Array order is execution order and does not change when completion changes.
- A valid step update toggles only the addressed step.
- Unknown step IDs cause no Mission change.

## Progress

Progress is the count of completed steps:

```text
progress = completed steps
0 <= progress <= total steps
```

Mission State owns this calculation after every valid step transition. MissionEngine initializes progress to zero. React may format the stored values as a percentage for display, but it must not write or independently persist progress.

Not allowed:

- Manually incrementing or decrementing progress.
- Storing a second progress value outside the Mission.
- Letting UI or MissionStore calculate domain progress.

## Mission Status

The only valid v0.2 statuses are:

- `draft`: zero completed steps.
- `active`: more than zero but fewer than all steps are complete.
- `completed`: every step is complete.

Transitions are derived from step completion:

```text
draft ↔ active ↔ completed
```

Uncompleting a step can move `completed` to `active`; uncompleting all steps returns the Mission to `draft`. `cancelled` and `paused` are not valid v0.2 statuses and must not be stored or displayed as domain state without a protocol and type revision.

## Mission Lifecycle

The conceptual lifecycle is:

```text
Idea → Mission request → Planning → Mission → Execution → Completion
```

Component ownership:

| Transition | Owner |
| --- | --- |
| Capture idea | React UI |
| Coordinate request | EchoKernel |
| Analyze and classify request | Mission Analyzer |
| Create plan | Planner through StepGenerator |
| Create Mission | MissionEngine |
| Add and retrieve Mission | MissionStore through EchoKernel |
| Complete or uncomplete a step | Mission State through EchoKernel |
| Derive progress and status | Mission State |
| Select a Mission for display | React UI by Mission ID |
| Delete Mission lifetime | MissionStore through EchoKernel |

Planning occurs before MissionEngine materializes the Mission object because a valid Mission requires steps.

## Mission Analyzer

Mission Analyzer deterministically interprets a proposed Mission title and goal before planning. It owns classification, missing-information detection, coarse planning complexity, planning readiness, and non-binding planning hints.

Analyzer is stateless and side-effect free. It never creates steps or Missions, stores state, invokes other domain components, or communicates with React. EchoKernel is its only application caller and stops the creation workflow when analysis reports that planning is not possible.

## EchoKernel

EchoKernel is the public application API and orchestration boundary.

Responsibilities:

- Run Think/Analyze → Plan → Execute → Reflect → Learn for creation.
- Coordinate MissionStore reads and lifetime operations.
- Route step updates through Mission State.

Current public API:

- Pipeline stages: `think`, `plan`, `execute`, `reflect`, `learn`.
- Workspace operations: `createMission`, `getMission`, `getAllMissions`, `deleteMission`, `updateMission`.

EchoKernel never renders UI, analyzes or generates step content itself, calculates step transitions, or exposes the Store instance.

## MissionStore

MissionStore is the single source of truth for in-memory Mission lifetime.

Responsibilities:

- Add, find, list, replace, and remove Missions.
- Preserve independent state for multiple Missions.
- Return defensive copies for mutation isolation.

The Store does not plan, generate steps, calculate progress or status, select UI state, or persist beyond the current memory lifetime.

## MissionEngine

MissionEngine creates a Mission from a valid idea and Planner-supplied steps. It trims and validates the title, requires a non-empty plan, generates identity and timestamps, and initializes status and progress.

MissionEngine does not own planning, storage, UI selection, or step updates. Step updates and their validation belong to Mission State.

## Planner

Planner converts Analyzer-supplied mission analysis into an ordered `MissionStep[]` by delegating deterministic construction to StepGenerator.

Outputs contain three to seven incomplete steps with stable ordering. Planning is rule-based, uses no external service, and is limited to the currently implemented learning, building, and generic rules.

Planner never classifies, creates, or stores Missions and never updates Mission state.

## React UI

React may:

- Capture idea text and button actions.
- Keep the selected Mission ID.
- Hold an isolated render snapshot returned through EchoKernel.
- Render Mission lists, details, progress formatting, status, and steps.
- Request create, update, retrieve, and delete operations through EchoKernel.

React must never:

- Import MissionStore, MissionEngine, Mission State, Planner, or StepGenerator.
- Mutate a Mission or Step.
- Calculate or persist domain status.
- Write progress or maintain a second Mission source of truth.

## Architectural Rules

1. **Single Source of Truth:** MissionStore owns current in-memory Mission state.
2. **Single Owner Principle:** Every domain rule has one owning layer.
3. **Immutable Snapshots:** Store boundaries return defensive copies; domain transitions return new objects.
4. **No Duplicated Business Logic:** UI formatting is allowed, domain recalculation elsewhere is not.
5. **One Responsibility per Layer:** Rendering, orchestration, lifetime, creation, transitions, planning, and generation remain separate.
6. **Evidence-First Architecture:** Changes require a demonstrated need and focused validation.
7. **Domain Before AI:** Domain rules must remain explicit and testable without intelligent services.

## Forbidden in v0.2

- Brain, Learning, or Intelligence modules.
- AI or external decision services.
- Database, backend, API, routing, localStorage, or advanced memory.
- New statuses or speculative domain properties without a protocol revision.

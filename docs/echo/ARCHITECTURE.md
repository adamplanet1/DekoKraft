# Echo Architecture

Domain concepts and invariants are defined in `docs/echo/PROTOCOL.md`.

## UI

`app/echo/page.tsx` is a two-panel Mission Workspace: the left panel creates, lists, selects, and deletes missions; the right panel displays and continues the selected mission. React owns only input, selection, and a render snapshot. MissionStore remains the source of truth, accessed exclusively through Echo Kernel.

## Echo Kernel

`app/echo/kernel/EchoKernel.ts` is the orchestration boundary for Echo behavior:

```text
User → Echo Kernel → Think/Analyze → Plan → Execute → Reflect → Learn
```

- `think()` normalizes the request and asks Mission Analyzer for deterministic analysis.
- `plan()` asks Planner to create the matching steps.
- `execute()` asks Mission Engine to create the Mission.
- `reflect()` currently returns the Mission unchanged.
- `learn()` currently returns the Mission unchanged.

Mission lookup, listing, deletion, and step updates also pass through Kernel delegates. Echo Kernel is the only public entry point; consumers never import Planner, StepGenerator, Mission Engine, Mission State, or MissionStore directly.

Creation returns a typed success or `analysis_blocked` result. A blocked analysis stops before Planner and cannot write to MissionStore.

## Mission Analyzer

`app/echo/analyzer/MissionAnalyzer.ts` is a deterministic, stateless analysis boundary used only by Echo Kernel. It receives a proposed title and goal and returns classification, missing information, coarse complexity, planning readiness, and bounded planning hints. It contains no planning, step generation, Mission creation, UI, or storage logic.

## Planner

`app/echo/planner/Planner.ts` remains the planning boundary used by Kernel. It consumes Analyzer output and delegates step construction to `app/echo/planner/StepGenerator.ts`.

## Step Generator

`app/echo/planner/StepGenerator.ts` owns deterministic step-generation rules only. It produces three to seven steps from a mission title, goal, and Analyzer-supplied kind. Only Planner uses StepGenerator.

## Mission Engine

`app/echo/engine/MissionEngine.ts` creates missions from Planner-supplied steps and enforces creation invariants. It rejects an empty plan and contains no planning or lifetime logic. Reusable models live in `app/echo/types/mission.ts`.

## Mission State

`app/echo/engine/MissionState.ts` performs immutable step transitions and derives progress, status, and `updatedAt`. It does not create, plan, or store missions.

## Mission Store

`app/echo/store/MissionStore.ts` is an in-memory lifetime manager backed by a `Map`. It adds, removes, finds, lists, and replaces complete Mission objects. Reads and writes use defensive copies so render snapshots cannot mutate stored state. It contains no UI, planning, or step-transition logic.

## Why Workspace Came First

Mission Workspace established and tested mission selection, lifetime, and continuation semantics before Mission Analyzer was introduced. Analyzer therefore consumes an existing Kernel contract without redefining storage or UI behavior. Any later capability must preserve that boundary.

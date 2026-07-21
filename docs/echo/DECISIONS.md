# Echo Architecture Decision Records

## ADR-001: Use the Next.js App Router

- **Status:** Accepted
- **Context:** Echo lives inside the existing DekoKraft Next.js application.
- **Decision:** Implement Echo as an App Router route under `app/echo`.
- **Consequences:** Echo follows the repository's routing conventions and can use server or client boundaries deliberately.

## ADR-002: Separate the Mission Engine from the UI

- **Status:** Accepted
- **Context:** Mission creation and step updates must remain reusable and testable outside the page.
- **Decision:** Keep mission creation and transitions in `app/echo/engine/` and presentation concerns in `app/echo/page.tsx`.
- **Consequences:** UI changes do not redefine domain behavior, and future modules can reuse the same operations.

## ADR-003: Separate Mission Types from Logic

- **Status:** Accepted
- **Context:** Mission models are shared by the current Kernel, Engine, State, Store, Planner, and UI layers.
- **Decision:** Define Mission domain types in `app/echo/types/mission.ts` and import them with type-only imports where appropriate.
- **Consequences:** There is one reusable type source, while the Mission Engine remains focused on behavior.

## ADR-004: Expose a Stable Domain Boundary

- **Status:** Superseded by ADR-005
- **Context:** Future Companion, Memory, and Knowledge modules should not depend on Echo's internal file layout.
- **Decision:** Re-export the supported Mission types and operations from `app/echo/domain/index.ts`.
- **Consequences:** Consumers use one stable import path, while engine and type files can evolve internally without creating parallel implementations.

## ADR-005: Introduce Echo Core

- **Status:** Superseded by ADR-007
- **Context:** A generic domain barrel does not express the orchestration role required by future Echo features.
- **Decision:** Use `app/echo/core/Echo.ts` as the single public entry point and keep Mission Engine as an internal implementation dependency.
- **Consequences:** UI and future features communicate with one minimal facade, progress remains calculated by Mission Engine, and internal modules can evolve without leaking into consumers.

## ADR-006: Separate Planning from Mission Behavior

- **Status:** Accepted
- **Context:** Mission Engine should enforce mission behavior without deciding the content of every plan.
- **Decision:** Put deterministic plan selection behind `app/echo/planner/Planner.ts`; Echo Kernel orchestrates Planner and Mission Engine.
- **Consequences:** Planning rules can evolve independently, Mission Engine remains reusable, and the UI depends only on Echo Kernel.

## ADR-007: Route Echo Requests Through a Kernel

- **Status:** Accepted
- **Context:** The Think, Plan, Execute, Reflect, and Learn stages need one orchestration path without expanding the UI or duplicating engine logic.
- **Decision:** Put the Think → Plan → Execute → Reflect → Learn pipeline and the public Echo API in `app/echo/kernel/EchoKernel.ts`.
- **Consequences:** Echo Kernel is the only public entry point and Mission Engine retains Mission behavior. Planner originally retained classification and planning rules; ADR-012 later transferred classification alone to Mission Analyzer while leaving planning with Planner.

## ADR-008: Generate Mission Steps Deterministically

- **Status:** Accepted
- **Context:** Fixed plan templates cannot provide sufficiently relevant actions for different mission titles and goals.
- **Decision:** Generate three to seven steps in `app/echo/planner/StepGenerator.ts`; Planner is its only production consumer, and Mission Engine rejects empty plans instead of generating steps.
- **Consequences:** Plans vary predictably without AI or external services, generation rules have one source, and Mission Engine contains no planning logic.

## ADR-009: Separate Mission Lifetime from Mission Behavior

- **Status:** Accepted
- **Context:** Echo must manage multiple missions without coupling persistence concerns to UI, planning, or creation.
- **Decision:** Use an in-memory `MissionStore` for lifetime operations, keep creation in Mission Engine, keep step transitions in Mission State, and expose all operations through Echo Kernel.
- **Consequences:** The UI renders an isolated React snapshot and selection, while Store remains independent from mission planning and behavior.

## ADR-010: Establish Mission Workspace Before Intelligence

- **Status:** Accepted
- **Context:** Analyzer and Echo Brain require a reliable way to create, select, continue, and remove multiple missions.
- **Decision:** Build the two-panel in-memory Mission Workspace before adding any analysis or learning capability.
- **Consequences:** User workflow and Kernel contracts are validated independently, while future intelligence remains unable to redefine MissionStore ownership or UI state management.

## ADR-011: Adopt a Formal Domain Protocol

- **Status:** Accepted
- **Context:** Echo's implemented domain rules were distributed across types, tests, architecture notes, and code.
- **Decision:** Make `docs/echo/PROTOCOL.md` the single source of truth for Mission terminology, invariants, lifecycle, and layer ownership.
- **Consequences:** Architecture and implementation must use the protocol language; changing a domain rule requires updating the protocol, types, behavior, and tests together.

## ADR-012: Transfer Mission Classification to Mission Analyzer

- **Status:** Accepted
- **Context:** Classification was implemented in StepGenerator, but the accepted Analyzer contract makes request interpretation a prerequisite to planning and requires one classification owner.
- **Decision:** Move deterministic Mission classification to `app/echo/analyzer/MissionAnalyzer.ts`. EchoKernel is its only application caller, Planner consumes its result, and StepGenerator accepts a supplied kind without classifying independently.
- **Consequences:** Invalid analysis stops before planning or storage; classification has one active owner; Planner remains the planning owner; StepGenerator remains the step-generation owner; no AI or external service is introduced.

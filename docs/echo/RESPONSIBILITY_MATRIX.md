# Echo Responsibility Transfer Matrix

Status: **Sprint 7 operational ownership**

This matrix records one authoritative owner for each Echo responsibility. It reflects the implemented foundation and the completed Sprint 7 transfer of Mission classification to Mission Analyzer.

## How to Read the Matrix

- **Owner** means the component that defines and controls a rule or state.
- Calling, coordinating, displaying, or enforcing an owner's result does not create shared ownership.
- **Current Owner** is authoritative now.
- **Future Owner** differs only when a transfer is explicitly planned. “Unchanged” means no transfer is authorized.
- A future owner does not become active until every transfer condition is satisfied.

## Responsibility Matrix

| Responsibility | Current Owner | Future Owner | Reason | Transfer Conditions | Dependencies | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Mission Creation | MissionEngine | Unchanged | MissionEngine materializes a valid Mission, identity, timestamps, initial progress, and initial status from an idea and supplied plan. | None planned. | Planner-supplied steps; Mission domain types. | EchoKernel invokes creation but does not own its rules. MissionStore receives the completed Mission afterward. |
| Mission Validation | MissionEngine | Unchanged | Creation invariants belong with Mission creation. | None planned. | Domain rules in `PROTOCOL.md`; Mission domain types. | This scope is creation-time validation: non-empty trimmed idea and non-empty planned steps. Transition validation belongs to Mission Updates. |
| Mission Classification | Mission Analyzer | Unchanged | Sprint 7 transferred the deterministic rules from StepGenerator to Analyzer so interpretation occurs before planning. | Transfer completed under ADR-012; future transfer requires a new protocol revision and ADR. | EchoKernel orchestration; Analyzer input/output contract; Planner consumption of analysis. | StepGenerator now requires a supplied Mission kind and contains no classification fallback. |
| Planning | Planner | Unchanged | Planner owns conversion of classified mission input into an ordered plan. | None planned. Analyzer provides analysis but does not own planning. | MissionAnalysis supplied through EchoKernel; StepGenerator output. | Planner alone creates the plan. It delegates step construction without surrendering plan ownership. |
| Step Generation | StepGenerator | Unchanged | StepGenerator owns deterministic construction of three to seven `MissionStep` values. | None planned. | Mission title, goal, and classification; MissionStep type. | Planner is the only production consumer. Analyzer must never create steps. |
| Progress Calculation | Mission State | Unchanged | Progress is derived from completed steps during immutable Mission transitions. | None planned. | Mission steps and completion flags. | MissionEngine initializes progress to zero; initialization is not ongoing calculation ownership. React may calculate a display-only percentage. |
| Mission Status | Mission State | Unchanged | Status is derived from progress and step count after transitions. | None planned. | Progress rule; valid statuses in `PROTOCOL.md`. | MissionEngine initializes `draft`; it does not own later status derivation. |
| Mission Updates | Mission State | Unchanged | Mission State validates a step target and returns the next immutable Mission snapshot, including progress, status, and `updatedAt`. | None planned. | Mission domain types; progress and status rules. | EchoKernel routes the request and MissionStore replaces the stored snapshot. Neither owns transition logic. |
| Mission Persistence | MissionStore | Unchanged for the current foundation | MissionStore manages Mission lifetime in memory. | Any durable persistence proposal requires its own sprint, protocol-compatible contract, and ADR. It must replace or sit behind the same single ownership boundary rather than create a second source of truth. | Mission snapshots; EchoKernel coordination. | “Persistence” currently means process-memory lifetime only. Database, localStorage, and backend persistence remain out of scope. |
| State Ownership | MissionStore | Unchanged | MissionStore is the single source of truth for current in-memory Mission state. | None planned. | Defensive cloning; Mission identity. | React holds isolated render snapshots and selected Mission ID, not authoritative Mission state. |
| UI Rendering | React UI | Unchanged | React converts snapshots into the Mission Workspace presentation. | None planned. | EchoKernel-returned snapshots; local selection and input state. | Formatting progress as a percentage is presentation, not domain calculation. |
| User Interaction | React UI | Unchanged | React captures input, selection, and button actions and sends application requests to EchoKernel. | None planned. | Browser events; EchoKernel public API. | React may select a Mission ID and manage focus. It must not mutate Missions or implement domain rules. |
| Error Reporting | EchoKernel | Unchanged | EchoKernel is the public application boundary and therefore owns the application-facing outcome of coordinated operations. | A structured error contract requires a focused specification and ADR before replacing current outcomes. | Validation outcomes from MissionEngine, Mission State, Planner, and MissionStore. | Current reporting is minimal: operations expose `null`, `boolean`, or propagated errors; React chooses how to display an exposed outcome. Originating components still own detection of violations in their scope. |
| Domain Validation | `PROTOCOL.md` | Unchanged | The protocol is the normative owner of valid domain concepts, invariants, and lifecycle rules. | A domain-rule change requires the protocol, types, implementation, and tests to change together. | Evidence from implemented behavior and accepted ADRs. | Runtime components enforce only their assigned slice. Enforcement does not give them authority to redefine the domain. |
| Workflow Coordination | EchoKernel | Unchanged | EchoKernel owns ordering and delegation across Think/Analyze → Plan → Execute → Reflect → Learn and Store operations. | None planned. Analyzer enters the workflow through Kernel delegation only. | Mission Analyzer, Planner, MissionEngine, Mission State, and MissionStore. | Kernel coordinates but never absorbs classification, planning, transition, storage, or UI rules. |

## Current Ownership Map

```text
React UI
  owns: rendering, user interaction
        ↓ requests
EchoKernel
  owns: workflow coordination, application-facing error outcomes
        ↓ delegates
Mission Analyzer owns: mission classification and planning readiness
StepGenerator  owns: step generation
Planner        owns: planning
MissionEngine  owns: Mission creation, creation-time Mission validation
Mission State  owns: Mission updates, progress calculation, Mission status
MissionStore   owns: in-memory persistence, authoritative Mission state

PROTOCOL.md
  owns: normative domain validation rules
```

The diagram shows invocation relationships, not shared ownership.

## Completed Ownership Changes

### Mission Classification

```text
Previous: StepGenerator
    ↓
Current: Mission Analyzer
    ↓
Completed when: Sprint 7 updated the protocol, architecture, ADR, integration
contract, and tests, then removed the old classification path.
```

After transfer:

- Mission Analyzer owns `MissionKind` and deterministic classification rules.
- EchoKernel invokes Analyzer and passes `MissionAnalysis` to Planner.
- Planner consumes classification without creating or redefining it.
- StepGenerator generates steps from supplied planning inputs without independently classifying the Mission.
- There must be no transition period in merged code where two active classifiers can disagree.

No further ownership transfer is approved by the current protocol or Analyzer contract.

## Transfer Checklist

Any future responsibility transfer is complete only when:

1. The need and destination owner are documented in the domain protocol or applicable specification.
2. An ADR accepts the ownership change.
3. The new owner has one explicit input/output contract.
4. The old owner stops defining the rule; delegation is allowed, duplication is not.
5. EchoKernel remains the orchestration boundary where cross-component sequencing is required.
6. Tests identify the single owner and cover the transferred rule.
7. Architecture documentation describes the implemented state, not the intended intermediate state.

Until every condition is met, the recorded current owner remains authoritative.

## Consistency Review

The matrix was checked against `PROJECT_PROTOCOL.md`, `PROTOCOL.md`, `ARCHITECTURE.md`, `DECISIONS.md`, and `MISSION_ANALYZER_SPEC.md`.

### Classification transfer

ADR-012 and Sprint 7 resolve the previously documented classification conflict. Mission Analyzer is the sole current owner; Planner consumes analysis, and StepGenerator constructs steps from the supplied kind without an independent classifier.

### Error reporting maturity

The foundation has no structured application error model. Current components signal outcomes through `null`, booleans, or exceptions. Assigning application-facing error reporting to EchoKernel clarifies the existing boundary; it does not introduce a new error system. A future structured contract must be specified separately.

The earlier v0.2 Analyzer prohibition and classification ownership conflict were resolved by the Sprint 7 protocol revision and ADR-012. No unresolved ownership contradiction remains.

## Sprint 7 Completion

Sprint 7 validation confirmed one classification owner, Planner remains the planning owner, StepGenerator remains the step-generation owner, and EchoKernel remains the sole workflow coordinator.

# Mission Analyzer Contract v1

Status: **Implemented and frozen — Sprint 7**

This document preserves the public contract implemented by Sprint 7. ADR-012 records the completed classification transfer; the contract itself remains frozen.

## Public Interface

The public entry point is conceptually:

```text
MissionAnalyzer.analyze(input) → MissionAnalysis
```

Contract rules:

- `analyze` is deterministic and side-effect free.
- EchoKernel is its only application caller.
- One input value produces one new analysis value.
- The input is never mutated or retained.
- The output contains analysis only; it contains no Mission or MissionStep.
- Calling `analyze` does not plan, create, update, or store a Mission.

This notation is documentation only. It does not prescribe a class, object, function declaration, filename, or construction mechanism beyond the stable conceptual entry point.

## Input Contract

Analyzer may receive exactly one immutable input containing exactly two fields:

| Input | Type | Source | Owner | Validation responsibility |
| --- | --- | --- | --- | --- |
| `title` | string | The proposed Mission title derived from the idea captured by React and passed through EchoKernel. | React owns captured input; MissionEngine remains the owner of final creation validation. Analyzer owns analysis-readiness checks only. | Analyzer detects empty or whitespace-only content as missing information. It must not trim, repair, or mutate the caller's value. |
| `goal` | string | The intended outcome already supported by the Mission domain and supplied through EchoKernel. | Mission domain defines its meaning; MissionEngine owns the final created value. Analyzer does not own it. | Analyzer detects empty or whitespace-only content as missing information. It must not invent a replacement goal. |

Analyzer may not receive:

- A Mission or MissionStep.
- Current Mission state, progress, status, or timestamps.
- React state, selected Mission ID, or UI callbacks.
- MissionStore, Planner, MissionEngine, or other service instances.
- User identity, history, memory, external knowledge, or generated steps.
- Any field not present in this contract.

There is no `description` input. The current Echo domain supports `title` and `goal` only.

## Output Contract

For a contract-valid input value, Analyzer returns one immutable `MissionAnalysis` containing exactly these fields:

| Output | Allowed value | Meaning | Owner | Consumer |
| --- | --- | --- | --- | --- |
| `kind` | `learning`, `building`, or `generic` | The supported deterministic category of the proposed Mission. | Mission Analyzer | Planner, through EchoKernel. |
| `missingInformation` | string array | Ordered, concise facts required for deterministic planning but absent from the input. An empty array means none are known to be missing. | Mission Analyzer | EchoKernel; Planner may consume it only if Kernel allows planning to continue. |
| `complexity` | `low`, `medium`, or `high` | A coarse planning-complexity classification. It is not time, cost, risk, confidence, or a guarantee. | Mission Analyzer | Planner, through EchoKernel. |
| `planningPossible` | boolean | Whether the supplied title and goal are sufficient for deterministic planning under the Analyzer rules. | Mission Analyzer | EchoKernel, which decides whether to invoke Planner. |
| `planningHints` | string array | Ordered, non-binding guidance derived only from the input. Hints are not steps or executable instructions. | Mission Analyzer | Planner, through EchoKernel. |

Output rules:

- The result and both arrays are newly produced values and expose no retained mutable state.
- The same normalized input must produce equivalent output.
- No output may contain identity, timestamps, Mission status, progress, steps, persistence metadata, confidence, recommendations, or user data.
- Analyzer owns the analysis values. EchoKernel owns their orchestration, and Planner owns any plan created from them.

## Error Contract

### Invalid mission

Analyzer never receives a Mission object, so it cannot declare a stored Mission valid or invalid.

For the proposed Mission input:

- Empty or whitespace-only `title` or `goal` is represented as normal analysis: the relevant fact appears in `missingInformation`, and `planningPossible` is `false`.
- Analyzer must not throw merely because required textual information is missing.
- A value that violates the structural contract—for example, a non-string field—is an integration error. The TypeScript boundary prevents supported callers from supplying it; EchoKernel owns application-facing handling and must not continue to Planner.

MissionEngine retains final Mission creation validation. Analyzer readiness does not replace or weaken it.

### Missing information

Missing information is an analysis result, not an exception.

- Mission Analyzer detects and reports it.
- EchoKernel reads `planningPossible` and prevents planning and Mission creation when it is `false`.
- React may display an outcome exposed by EchoKernel; Analyzer never updates React directly.
- Planner, MissionEngine, and MissionStore must not run for a blocked request.

The exact user-facing clarification behavior is outside this contract and must not be invented by Analyzer.

### Unsupported mission

Contract v1 has no separate unsupported-mission result. The existing deterministic planning domain supports `learning`, `building`, and the `generic` fallback; an otherwise valid idea that matches neither specialized category is `generic`, not an error.

- Mission Analyzer owns selection of the `generic` kind.
- EchoKernel may continue to Planner when `planningPossible` is `true`.
- Planner owns the generic plan.

If Echo later needs to reject genuinely unsupported Mission kinds, that requires a reviewed contract version, protocol update, and ADR. Sprint 7 must not invent an unsupported status, exception, or output field.

## Ownership

Mission Analyzer:

- Owns only Mission analysis values under the completed classification transfer.
- Never owns current or historical Mission state.
- Never stores, retrieves, selects, updates, or deletes Missions.
- Never creates, orders, completes, or modifies steps.
- Never calculates Mission progress or status.
- Never creates a Mission.
- Never updates or calls React.
- Never calls Planner, StepGenerator, MissionEngine, Mission State, or MissionStore.
- Never bypasses EchoKernel.

Current ownership is recorded in `RESPONSIBILITY_MATRIX.md`; Mission Analyzer owns analysis and classification only.

## Execution Sequence

The successful creation sequence is:

```text
React UI
    ↓ title and goal
EchoKernel
    ↓ analyze(input)
MissionAnalyzer
    ↑ MissionAnalysis
EchoKernel
    ↓ plan(input, analysis), only when planningPossible is true
Planner
    ↑ MissionStep[]
EchoKernel
    ↓ execute(input, steps)
MissionEngine
    ↑ Mission
EchoKernel
    ↓ add(mission)
MissionStore
```

The shortened architectural sequence is:

```text
React → EchoKernel → MissionAnalyzer → Planner → MissionEngine → MissionStore
```

Every transition between internal components is coordinated by EchoKernel. The shortened arrow from MissionAnalyzer to Planner represents data flow through Kernel, not a direct call.

When `planningPossible` is `false`, the sequence stops at EchoKernel after analysis. No plan, partial Mission, or Store write is allowed.

## Versioning and Stability

- Contract name: **Mission Analyzer Contract v1**.
- Stability: **Implemented and frozen by Sprint 7**.
- The implementation must continue to satisfy this contract or require a reviewed contract revision.
- A change to inputs, outputs, error semantics, ownership, or sequence requires a new reviewed contract version.
- Editorial clarification that does not change observable meaning may remain within v1.
- Implementation details are not frozen: file layout and construction style remain internal choices unless another accepted decision constrains them.

## Consistency Review

This contract was checked against `PROJECT_PROTOCOL.md`, `PROTOCOL.md`, `RESPONSIBILITY_MATRIX.md`, `MISSION_ANALYZER_SPEC.md`, `ARCHITECTURE.md`, and `DECISIONS.md`.

### Sprint 7 conflict resolution

1. `PROTOCOL.md` was revised to permit and define the operational Analyzer.
2. ADR-012 and `RESPONSIBILITY_MATRIX.md` transferred classification from StepGenerator to Mission Analyzer without duplication.
3. `ARCHITECTURE.md` now describes Analyzer in the implemented runtime pipeline.

### Clarifications that are not conflicts

- Planner remains the sole planning owner and StepGenerator remains the sole step-generation owner.
- MissionEngine remains the Mission creation and creation-validation owner.
- MissionStore remains the single source of truth.
- EchoKernel remains the sole workflow coordinator and public application boundary.
- The absence of an unsupported result is consistent with the existing `generic` planning fallback.

These closure notes record the completed Sprint 7 changes without altering the frozen interface.

## Sprint 7 Conformance Baseline

Sprint 7 remains conformant while:

1. The public analysis entry point accepts only `title` and `goal`.
2. It returns only the five documented analysis values.
3. Missing information is represented without creating a Mission or throwing a domain exception.
4. Generic missions remain supported.
5. EchoKernel is the only caller and coordinator.
6. Classification has exactly one active owner after transfer.
7. Analyzer remains deterministic, stateless, side-effect free, and isolated from UI, planning, creation, transitions, and storage.

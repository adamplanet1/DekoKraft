# Echo Roadmap

## Milestone

**Echo Prototype v0.1 — Foundation Complete**

## Sprint 1 — Prototype

- Create the Echo page and Mission Card.
- Add interactive steps and progress.
- Separate Mission Engine logic and mission types from the UI.

## Sprint 2 — Mission Domain

- Promote Mission into a complete domain model.
- Add validation and domain invariants.
- Establish the official Echo documentation.

## Sprint 3 — Planner and Kernel

- Add the first deterministic Planner.
- Route mission creation through the Echo Kernel pipeline.
- Keep UI consumers isolated from internal engines.

## Sprint 4 — Dynamic Mission Planner

- Generate deterministic steps from mission title and goal.
- Keep plans within three to seven logical actions.
- Preserve Planner, Kernel, and Mission Engine boundaries.

## Sprint 5 — Mission Store

- Manage multiple missions in memory.
- Add Mission lookup, listing, deletion, and replacement.
- Keep UI selection in React while all mission operations pass through Kernel.

## Sprint 6 — Mission Workspace

**Status:** Completed

- Present missions in a reactive two-panel workspace.
- Create, select, continue, switch, and delete in-memory missions.
- Stabilize the user workflow before introducing Analyzer or Echo Brain.

## Sprint 6.1 — Mission Workspace Polish

- Clear and refocus mission input after creation.
- Present selectable mission cards with status, progress, and step counts.
- Improve mission details, continuation focus, deletion fallback, empty states, spacing, and responsive alignment.

## Sprint 7 — Mission Analyzer v0.1

**Status:** Completed

- Analyze Mission title and goal deterministically before planning.
- Block planning and storage when required information is missing.
- Transfer Mission classification from StepGenerator to Mission Analyzer.
- Preserve Planner, MissionEngine, Mission State, MissionStore, and UI responsibilities.

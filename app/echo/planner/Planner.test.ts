import assert from "node:assert/strict";
import test from "node:test";

import type { MissionAnalysis, MissionKind } from "../analyzer/MissionAnalyzer.ts";
import { createPlan } from "./Planner.ts";

const goal = "Turn this idea into a clear, testable prototype.";

function plan(title: string, kind: MissionKind) {
  const analysis: MissionAnalysis = {
    kind,
    missingInformation: [],
    complexity: "low",
    planningPossible: true,
    planningHints: [],
  };
  return createPlan(title, goal, analysis);
}

test("planner selects deterministic plans by keyword", () => {
  const learning = plan("Study a new course", "learning");
  const building = plan("Build a website store", "building");
  const generic = plan("Organize a community event", "generic");

  assert.equal(learning[0].title, "Define the learning outcome");
  assert.equal(building[0].title, "Define requirements");
  assert.equal(generic[0].title, "Clarify the desired outcome");
  assert.deepEqual(plan("Study a new course", "learning"), learning);
  assert.ok([...learning, ...building, ...generic].every((step) => !step.completed));
});

test("learning keywords take priority when categories overlap", () => {
  const steps = plan("Learn to build an app", "learning");
  assert.equal(steps[0].title, "Define the learning outcome");
});

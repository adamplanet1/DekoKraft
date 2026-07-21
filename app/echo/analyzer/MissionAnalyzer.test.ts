import assert from "node:assert/strict";
import test from "node:test";

import { MissionAnalyzer } from "./MissionAnalyzer.ts";

const goal = "Turn this idea into a clear, testable prototype.";

test("analyzer normalizes valid input and returns deterministic analysis", () => {
  const input = { title: "  Learn Python  ", goal: `  ${goal}  ` };
  const first = MissionAnalyzer.analyze(input);
  const second = MissionAnalyzer.analyze(input);

  assert.equal(first.kind, "learning");
  assert.equal(first.planningPossible, true);
  assert.deepEqual(first.missingInformation, []);
  assert.deepEqual(second, first);
  assert.equal(input.title, "  Learn Python  ");
  assert.equal(input.goal, `  ${goal}  `);
});

test("analyzer reports missing and whitespace-only title or goal", () => {
  const missingTitle = MissionAnalyzer.analyze({ title: "", goal });
  const whitespaceTitle = MissionAnalyzer.analyze({ title: "   ", goal });
  const missingGoal = MissionAnalyzer.analyze({ title: "Build a website", goal: "" });
  const whitespaceGoal = MissionAnalyzer.analyze({ title: "Build a website", goal: "  " });

  for (const analysis of [missingTitle, whitespaceTitle, missingGoal, whitespaceGoal]) {
    assert.equal(analysis.planningPossible, false);
    assert.equal(analysis.missingInformation.length, 1);
  }
});

test("analyzer uses the supported generic classification", () => {
  const analysis = MissionAnalyzer.analyze({ title: "Organize a community event", goal });
  assert.equal(analysis.kind, "generic");
  assert.equal(analysis.planningPossible, true);
});

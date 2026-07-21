import assert from "node:assert/strict";
import test from "node:test";

import { generateSteps } from "./StepGenerator.ts";

test("step generator produces the website example deterministically", () => {
  const steps = generateSteps("Build a Website", "Create a useful website", "building");
  assert.deepEqual(steps.map((step) => step.title), [
    "Define requirements",
    "Design the structure",
    "Build the first version",
    "Test functionality",
    "Improve based on feedback",
  ]);
  assert.deepEqual(generateSteps("Build a Website", "Create a useful website", "building"), steps);
});

test("step generator produces the Python example within the step limits", () => {
  const steps = generateSteps("Learn Python", "Learn Python fundamentals", "learning");
  assert.deepEqual(steps.map((step) => step.title), [
    "Learn syntax",
    "Practice variables",
    "Learn functions",
    "Build a small project",
    "Review mistakes",
  ]);
  assert.ok(steps.length >= 3 && steps.length <= 7);
});

import assert from "node:assert/strict";
import test from "node:test";

import { EchoKernel } from "../kernel/EchoKernel.ts";

test("mission state follows step completion", () => {
  const created = EchoKernel.createMission("Ship the prototype");
  assert.equal(created.ok, true);
  if (!created.ok) return;
  const mission = created.mission;
  assert.equal(mission.status, "draft");
  assert.equal(mission.progress, 0);

  const active = EchoKernel.updateMission(mission.id, mission.steps[0].id);
  assert.ok(active);
  assert.equal(active.status, "active");
  assert.equal(active.progress, 1);
  assert.equal(mission.steps[0].completed, false);

  const completed = active.steps.slice(1).reduce(
    (mission, step) => {
      const updated = EchoKernel.updateMission(mission.id, step.id);
      assert.ok(updated);
      return updated;
    },
    active,
  );
  assert.equal(completed.status, "completed");
  assert.equal(completed.progress, completed.steps.length);

  const activeAgain = EchoKernel.updateMission(completed.id, completed.steps[0].id);
  assert.ok(activeAgain);
  assert.equal(activeAgain.status, "active");
  assert.equal(activeAgain.progress, activeAgain.steps.length - 1);

  const draftAgain = activeAgain.steps
    .filter((step) => step.completed)
    .reduce((mission, step) => {
      const updated = EchoKernel.updateMission(mission.id, step.id);
      assert.ok(updated);
      return updated;
    }, activeAgain);
  assert.equal(draftAgain.status, "draft");
  assert.equal(draftAgain.progress, 0);
  assert.deepEqual(EchoKernel.getMission(draftAgain.id), draftAgain);
});

import assert from "node:assert/strict";
import test from "node:test";

import { EchoKernel } from "./EchoKernel.ts";

test("kernel runs think, plan, execute, reflect, and learn stages", () => {
  const thought = EchoKernel.think("Learn to build an app");
  assert.equal(thought.analysis.kind, "learning");

  const steps = EchoKernel.plan(thought);
  assert.equal(steps[0].title, "Define the learning outcome");

  const mission = EchoKernel.execute(thought, steps);
  assert.ok(mission);
  assert.equal(EchoKernel.reflect(mission), mission);
  assert.equal(EchoKernel.learn(mission), mission);

  const result = EchoKernel.createMission("Build a website");
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.mission.steps[0].title, "Define requirements");
  assert.deepEqual(EchoKernel.getMission(result.mission.id), result.mission);
  assert.ok(EchoKernel.getAllMissions().some((mission) => mission.id === result.mission.id));
  assert.equal(EchoKernel.deleteMission(result.mission.id), true);
  assert.equal(EchoKernel.getMission(result.mission.id), null);
});

test("invalid analysis blocks planning and leaves stored missions unchanged", () => {
  const existing = EchoKernel.createMission("Organize a community event");
  assert.equal(existing.ok, true);
  if (!existing.ok) return;
  const before = EchoKernel.getAllMissions();

  const blocked = EchoKernel.createMission("   ");
  assert.equal(blocked.ok, false);
  if (blocked.ok) return;
  assert.equal(blocked.reason, "analysis_blocked");
  assert.equal(blocked.analysis.planningPossible, false);
  assert.deepEqual(EchoKernel.plan(EchoKernel.think("   ")), []);
  assert.deepEqual(EchoKernel.getAllMissions(), before);

  EchoKernel.deleteMission(existing.mission.id);
});

test("workspace preserves independent mission state while switching and deleting", () => {
  const first = EchoKernel.createMission("Learn Python");
  const second = EchoKernel.createMission("Build a Website");
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;

  const continuedFirst = EchoKernel.updateMission(first.mission.id, first.mission.steps[0].id);
  assert.ok(continuedFirst);
  assert.equal(continuedFirst.progress, 1);
  assert.equal(EchoKernel.getMission(second.mission.id)?.progress, 0);

  assert.equal(EchoKernel.getMission(first.mission.id)?.progress, 1);
  assert.equal(EchoKernel.deleteMission(first.mission.id), true);
  assert.equal(EchoKernel.getMission(first.mission.id), null);
  assert.deepEqual(EchoKernel.getMission(second.mission.id), second.mission);

  EchoKernel.deleteMission(second.mission.id);
  assert.deepEqual(EchoKernel.getAllMissions(), []);
});

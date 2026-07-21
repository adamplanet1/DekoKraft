import assert from "node:assert/strict";
import test from "node:test";

import { createMission } from "../engine/MissionEngine.ts";
import { MissionStore } from "./MissionStore.ts";

const steps = [{ id: "step-1", title: "Build it", completed: false }] as const;

test("mission store manages mission lifetime", () => {
  const store = new MissionStore();
  const mission = createMission(
    "Build a website",
    "Turn this idea into a clear, testable prototype.",
    steps,
  );
  assert.ok(mission);

  const added = store.add(mission);
  assert.notEqual(added, mission);
  assert.deepEqual(store.findById(mission.id), mission);
  assert.deepEqual(store.getAll(), [mission]);

  const updated = { ...mission, title: "Build the website" };
  assert.deepEqual(store.update(updated), updated);
  assert.equal(store.findById(mission.id)?.title, "Build the website");

  const snapshot = store.findById(mission.id);
  assert.ok(snapshot);
  Reflect.set(snapshot, "title", "Mutated snapshot");
  Reflect.set(snapshot.steps[0], "completed", true);
  assert.equal(store.findById(mission.id)?.title, "Build the website");
  assert.equal(store.findById(mission.id)?.steps[0].completed, false);

  const allSnapshot = store.getAll();
  allSnapshot.pop();
  assert.equal(store.getAll().length, 1);

  assert.equal(store.remove(mission.id), true);
  assert.equal(store.findById(mission.id), null);
  assert.deepEqual(store.getAll(), []);
});

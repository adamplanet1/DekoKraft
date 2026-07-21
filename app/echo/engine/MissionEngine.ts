import type { Mission, MissionStep } from "../types/mission";

function requireSteps(steps: readonly MissionStep[]): MissionStep[] {
  if (steps.length === 0) {
    throw new Error("A mission requires at least one planned step.");
  }
  return steps.map((step) => ({ ...step }));
}

/** Creates a mission, or returns null when its title or goal is empty. */
export function createMission(
  missionTitle: string,
  missionGoal: string,
  plannedSteps: readonly MissionStep[],
): Mission | null {
  const title = missionTitle.trim();
  const goal = missionGoal.trim();
  if (!title || !goal) return null;
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title,
    goal,
    status: "draft",
    progress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    steps: requireSteps(plannedSteps),
  };
}

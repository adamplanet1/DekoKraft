import type { Mission, MissionStatus, MissionStep } from "../types/mission.ts";

function calculateProgress(steps: readonly MissionStep[]): number {
  return steps.filter((step) => step.completed).length;
}

function calculateStatus(progress: number, stepCount: number): MissionStatus {
  if (progress === 0) return "draft";
  if (progress === stepCount) return "completed";
  return "active";
}

/** Toggles one step and derives the next mission state. */
export function toggleMissionStep(mission: Mission, stepId: string): Mission {
  if (!mission.steps.some((step) => step.id === stepId)) return mission;

  const steps = mission.steps.map((step) => (
    step.id === stepId ? { ...step, completed: !step.completed } : step
  ));
  const progress = calculateProgress(steps);

  return {
    ...mission,
    steps,
    progress,
    status: calculateStatus(progress, steps.length),
    updatedAt: new Date().toISOString(),
  };
}

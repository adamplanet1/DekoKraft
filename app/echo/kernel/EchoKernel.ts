import {
  createMission as executeMission,
} from "../engine/MissionEngine.ts";
import { toggleMissionStep } from "../engine/MissionState.ts";
import {
  MissionAnalyzer,
  type MissionAnalysis,
} from "../analyzer/MissionAnalyzer.ts";
import { createPlan } from "../planner/Planner.ts";
import type { Mission, MissionStep } from "../types/mission.ts";
import { MissionStore } from "../store/MissionStore.ts";

export type { Mission } from "../types/mission.ts";

type EchoThought = {
  title: string;
  goal: string;
  analysis: MissionAnalysis;
};

export type CreateMissionResult =
  | { readonly ok: true; readonly mission: Mission }
  | { readonly ok: false; readonly reason: "analysis_blocked"; readonly analysis: MissionAnalysis };

const missionStore = new MissionStore();
const missionGoal = "Turn this idea into a clear, testable prototype.";

function think(idea: string): EchoThought {
  const title = idea.trim();
  return {
    title,
    goal: missionGoal,
    analysis: MissionAnalyzer.analyze({ title, goal: missionGoal }),
  };
}

function plan(thought: EchoThought): MissionStep[] {
  if (!thought.analysis.planningPossible) return [];
  return createPlan(thought.title, thought.goal, thought.analysis);
}

function execute(thought: EchoThought, steps: MissionStep[]): Mission | null {
  if (!thought.analysis.planningPossible) return null;
  return executeMission(thought.title, thought.goal, steps);
}

function reflect(mission: Mission | null): Mission | null {
  return mission;
}

function learn(mission: Mission | null): Mission | null {
  return mission;
}

function createMission(idea: string): CreateMissionResult {
  const thought = think(idea);
  if (!thought.analysis.planningPossible) {
    return { ok: false, reason: "analysis_blocked", analysis: thought.analysis };
  }
  const steps = plan(thought);
  const mission = execute(thought, steps);
  const reflection = reflect(mission);
  const learnedMission = learn(reflection);
  if (!learnedMission) {
    return { ok: false, reason: "analysis_blocked", analysis: thought.analysis };
  }
  return { ok: true, mission: missionStore.add(learnedMission) };
}

function getMission(missionId: string): Mission | null {
  return missionStore.findById(missionId);
}

function getAllMissions(): Mission[] {
  return missionStore.getAll();
}

function deleteMission(missionId: string): boolean {
  return missionStore.remove(missionId);
}

function updateMission(missionId: string, stepId: string): Mission | null {
  const mission = missionStore.findById(missionId);
  if (!mission) return null;
  return missionStore.update(toggleMissionStep(mission, stepId));
}

export const EchoKernel = {
  think,
  plan,
  execute,
  reflect,
  learn,
  createMission,
  getMission,
  getAllMissions,
  deleteMission,
  updateMission,
};

import type { MissionAnalysis } from "../analyzer/MissionAnalyzer.ts";
import type { MissionStep } from "../types/mission.ts";
import { generateSteps } from "./StepGenerator.ts";

/** Creates a deterministic mission plan from an analysis supplied by EchoKernel. */
export function createPlan(
  title: string,
  goal: string,
  analysis: MissionAnalysis,
): MissionStep[] {
  return generateSteps(title, goal, analysis.kind);
}

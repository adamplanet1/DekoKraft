import type { MissionKind } from "../analyzer/MissionAnalyzer.ts";
import type { MissionStep } from "../types/mission.ts";

function wordsIn(value: string): Set<string> {
  return new Set(value.toLowerCase().match(/[a-z]+/g) ?? []);
}

function toSteps(titles: readonly string[]): MissionStep[] {
  return titles.slice(0, 7).map((title, index) => ({
    id: `step-${index + 1}`,
    title,
    completed: false,
  }));
}

/** Generates between three and seven deterministic steps for a mission. */
export function generateSteps(
  title: string,
  goal: string,
  kind: MissionKind,
): MissionStep[] {
  const words = wordsIn(`${title} ${goal}`);

  if (kind === "learning" && words.has("python")) {
    return toSteps([
      "Learn syntax",
      "Practice variables",
      "Learn functions",
      "Build a small project",
      "Review mistakes",
    ]);
  }

  if (kind === "learning") {
    return toSteps([
      "Define the learning outcome",
      "Gather reliable resources",
      "Study the fundamentals",
      "Practice the core skills",
      "Review and apply what you learned",
    ]);
  }

  if (kind === "building" && words.has("website")) {
    return toSteps([
      "Define requirements",
      "Design the structure",
      "Build the first version",
      "Test functionality",
      "Improve based on feedback",
    ]);
  }

  if (kind === "building") {
    return toSteps([
      "Define requirements",
      "Design the solution",
      "Prepare the project",
      "Build the first version",
      "Test and improve",
    ]);
  }

  return toSteps([
    "Clarify the desired outcome",
    "Break the mission into priorities",
    "Prepare the required resources",
    "Complete the first action",
    "Review the result and improve",
  ]);
}

export type MissionKind = "learning" | "building" | "generic";

export type MissionComplexity = "low" | "medium" | "high";

export type MissionAnalysisInput = {
  readonly title: string;
  readonly goal: string;
};

export type MissionAnalysis = {
  readonly kind: MissionKind;
  readonly missingInformation: readonly string[];
  readonly complexity: MissionComplexity;
  readonly planningPossible: boolean;
  readonly planningHints: readonly string[];
};

const learningKeywords = new Set(["learn", "study", "course"]);
const buildingKeywords = new Set(["build", "app", "website", "store"]);

function wordsIn(value: string): Set<string> {
  return new Set(value.toLowerCase().match(/[a-z]+/g) ?? []);
}

function includesAny(words: ReadonlySet<string>, keywords: ReadonlySet<string>): boolean {
  return [...keywords].some((keyword) => words.has(keyword));
}

function classify(words: ReadonlySet<string>): MissionKind {
  if (includesAny(words, learningKeywords)) return "learning";
  if (includesAny(words, buildingKeywords)) return "building";
  return "generic";
}

function estimateComplexity(wordCount: number): MissionComplexity {
  if (wordCount <= 3) return "low";
  if (wordCount <= 8) return "medium";
  return "high";
}

function hintsFor(kind: MissionKind): readonly string[] {
  if (kind === "learning") return ["Build understanding through study and practice."];
  if (kind === "building") return ["Move from requirements through implementation and testing."];
  return ["Clarify the outcome before executing the plan."];
}

/** Analyzes a proposed Mission without creating steps or changing state. */
function analyze(input: MissionAnalysisInput): MissionAnalysis {
  const title = input.title.trim();
  const goal = input.goal.trim();
  const missingInformation = [
    ...(!title ? ["Mission title is required."] : []),
    ...(!goal ? ["Mission goal is required."] : []),
  ];
  const words = wordsIn(`${title} ${goal}`);
  const kind = classify(words);

  return {
    kind,
    missingInformation,
    complexity: estimateComplexity(words.size),
    planningPossible: missingInformation.length === 0,
    planningHints: hintsFor(kind),
  };
}

export const MissionAnalyzer = { analyze };

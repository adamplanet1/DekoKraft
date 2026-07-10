export type DecisionStatus = "Waiting" | "Ready" | "Blocked";

export function getDecisionStatus(
  configurationComplete: boolean
): DecisionStatus {
  if (!configurationComplete) {
    return "Blocked";
  }

  return "Ready";
}

export function getDecisionSummary(configurationComplete: boolean): string {
  if (!configurationComplete) {
    return "Configuration is incomplete, so the creator decision is blocked.";
  }

  return "Configuration is complete and ready for the next creator step.";
}

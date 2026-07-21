export type DekoAccordionStoredState = {
  sections: Record<string, boolean>;
  singleOpen: boolean;
};

export const DEKOCLEAN_ACCORDION_STORAGE_KEY = "dekoclean:accordion:v1";

export function parseAccordionState(raw: string | null, allowedIds: readonly string[]): DekoAccordionStoredState | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as { sections?: unknown; singleOpen?: unknown };
    if (!candidate.sections || typeof candidate.sections !== "object" || Array.isArray(candidate.sections) || typeof candidate.singleOpen !== "boolean") return null;
    const sections: Record<string, boolean> = {};
    for (const id of allowedIds) {
      const value = (candidate.sections as Record<string, unknown>)[id];
      if (typeof value === "boolean") sections[id] = value;
    }
    return { sections, singleOpen: candidate.singleOpen };
  } catch {
    return null;
  }
}

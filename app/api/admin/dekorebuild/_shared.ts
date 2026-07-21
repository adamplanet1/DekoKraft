import { withDekoCleanAdmin } from "../dekoclean/_shared";

export const withDekoRebuildAdmin = withDekoCleanAdmin;

export function readRequiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim() || value.length > 500) throw new Error(`${name} is required.`);
  return value.trim();
}

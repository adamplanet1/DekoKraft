import fs from "node:fs";
import path from "node:path";

import { readLatestReport } from "./report.ts";
import type { DekoCleanPreview } from "./types.ts";

export function createPreview(projectRoot: string): DekoCleanPreview {
  const report = readLatestReport(projectRoot);
  const safe = report.candidates.filter((candidate) =>
    candidate.risk === "safe" && candidate.recommendation === "quarantine");
  const preview: DekoCleanPreview = {
    reportCreatedAt: report.createdAt,
    candidatePaths: safe.map((candidate) => candidate.path),
    estimatedBytes: safe.reduce((total, candidate) => total + candidate.sizeBytes, 0),
  };
  const directory = path.join(projectRoot, ".dekoclean", "reports");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "preview.json"), `${JSON.stringify(preview, null, 2)}\n`, "utf8");
  return preview;
}

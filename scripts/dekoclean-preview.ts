import { createPreview } from "../lib/dekoclean/preview.ts";
import { formatBytes } from "../lib/dekoclean/report.ts";

const preview = createPreview(process.cwd());
console.log("DekoClean quarantine preview (safe candidates only):");
for (const candidatePath of preview.candidatePaths) console.log(`- ${candidatePath}`);
console.log(`Estimated space: ${formatBytes(preview.estimatedBytes)}`);
console.log("No files were moved.");

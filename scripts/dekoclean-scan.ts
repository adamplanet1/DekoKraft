import { runDekoCleanScan } from "../lib/dekoclean/index.ts";
import { formatBytes } from "../lib/dekoclean/report.ts";

const report = runDekoCleanScan();
console.log(`DekoClean scan complete: ${report.scannedFiles} files`);
console.log(`Safe candidates: ${report.safeCandidates}`);
console.log(`Review candidates: ${report.reviewCandidates}`);
console.log(`Protected files: ${report.protectedFiles}`);
console.log(`Estimated recoverable space: ${formatBytes(report.estimatedRecoverableBytes)}`);
console.log("Reports: .dekoclean/reports/latest.json and latest.md");

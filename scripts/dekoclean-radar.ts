import { runDekoRadarScan } from "../lib/dekoradar/scanProject.ts";

const result = await runDekoRadarScan();
console.log(`DekoRadar scan complete: ${result.scannedFiles} files, ${result.findings.length} stored findings.`);
console.log("No files were executed, repaired, moved, or deleted.");

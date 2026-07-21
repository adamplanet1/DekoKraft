import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { checksumFile } from "../dekoclean/duplicateDetector.ts";
import { enrichFinding } from "../dekoclean/findingEngine.ts";
import type { DekoCleanConfig, DekoCleanFinding, ScannedFile } from "../dekoclean/types.ts";
import { findingId } from "./finding.ts";

type IntegrityBaseline = { createdAt: string; checksums: Record<string, string> };

function isWorkingTreeChange(projectRoot: string, filePath: string): boolean {
  try { return execFileSync("git", ["status", "--porcelain", "--", filePath], { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().length > 0; }
  catch { return false; }
}
export function classifyProtectedFileChange(input: { exists: boolean; readable: boolean; structurallyValid: boolean; currentHash?: string; previousHash?: string; approvedHash?: string; workingTreeChange: boolean }): "authorized-project-change" | "unverified-change" | "unexpected-change" | "integrity-failure" {
  if (!input.exists || !input.readable || !input.structurallyValid) return "integrity-failure";
  if (!input.previousHash && !input.approvedHash) return "unverified-change";
  if (input.approvedHash === input.currentHash || input.workingTreeChange) return "authorized-project-change";
  return "unexpected-change";
}

export function monitorProtectedIntegrity(files: ScannedFile[], config: DekoCleanConfig): DekoCleanFinding[] {
  const stateDirectory = path.join(config.projectRoot, ".dekoclean", "state");
  const baselinePath = path.join(stateDirectory, "protected-integrity.json");
  const protectedFiles = files.filter((file) => file.protected && !file.symbolicLink);
  const current = Object.fromEntries(protectedFiles.map((file) => [file.path, checksumFile(file.absolutePath)]));

  if (!fs.existsSync(baselinePath)) {
    fs.mkdirSync(stateDirectory, { recursive: true });
    fs.writeFileSync(baselinePath, `${JSON.stringify({ createdAt: new Date().toISOString(), checksums: current }, null, 2)}\n`, "utf8");
    return [];
  }

  let baseline: IntegrityBaseline;
  try { baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8")) as IntegrityBaseline; }
  catch { return []; }
  const findings: DekoCleanFinding[] = [];
  for (const [filePath, checksum] of Object.entries(current)) {
    if (!baseline.checksums[filePath] || baseline.checksums[filePath] === checksum) continue;
    const classification = classifyProtectedFileChange({ exists: true, readable: true, structurallyValid: true, currentHash: checksum, previousHash: baseline.checksums[filePath], workingTreeChange: isWorkingTreeChange(config.projectRoot, filePath) });
    const authorized = classification === "authorized-project-change";
    findings.push(enrichFinding({
      id: findingId("integrity-mismatch", [filePath], checksum), type: "integrity-mismatch", severity: authorized ? "info" : "high",
      title: authorized ? "تغيير مشروع معروف" : "تغيير غير متوقع", explanation: authorized ? "التغيير ظاهر ضمن شجرة العمل الحالية، ولم يفشل تحقق السلامة. يلزم اعتماد المدير قبل تحديث خط الأساس." : "اختلف SHA-256 عن خط أساس موثوق دون ارتباط مثبت بعملية تطوير حالية.",
      affectedPaths: [filePath], evidence: [`Previous SHA-256: ${baseline.checksums[filePath]}`, `Current SHA-256: ${checksum}`, `Classification: ${authorized ? "authorized-project-change" : "unexpected-change"}`], detectedBy: "integrity-check",
      detectedAt: new Date().toISOString(), recommendedActions: authorized ? ["validate", "ignore"] : ["validate", "restore", "ignore"],
      requiresAdminConfirmation: true, status: "new", fileHashSha256: checksum, previousFileHashSha256: baseline.checksums[filePath], protectedChangeClassification: classification, baselineApprovalStatus: "pending-baseline-approval",
    }));
  }
  return findings;
}

import fs from "node:fs";
import path from "node:path";
import { checksumFile } from "./duplicateDetector.ts";
import { readFindings, updateFindingLifecycle, writeFindings } from "./findingStore.ts";

export type ProtectedFileBaselineApproval = { filePath: string; previousHash?: string; approvedHash: string; approvedAt: string; approvedBy: "local-admin" | "system-maintenance"; scanId: string; findingId?: string; reason: string };
type Baseline = { createdAt: string; checksums: Record<string, string>; approvals?: ProtectedFileBaselineApproval[] };

export function acceptProtectedFileBaseline(input: { findingId: string; confirmed: boolean; approvedBy: ProtectedFileBaselineApproval["approvedBy"]; scanId: string; reason: string }, projectRoot = process.cwd()): ProtectedFileBaselineApproval {
  if (!input.confirmed) throw new Error("BASELINE_CONFIRMATION_REQUIRED");
  const finding = readFindings(projectRoot).find((entry) => entry.id === input.findingId);
  if (!finding || !["authorized-project-change", "unverified-change"].includes(finding.protectedChangeClassification ?? "")) throw new Error("BASELINE_APPROVAL_NOT_ELIGIBLE");
  const filePath = finding.affectedFiles[0];
  if (!filePath) throw new Error("BASELINE_TARGET_MISSING");
  const absolute = path.resolve(projectRoot, filePath);
  if (!absolute.startsWith(`${path.resolve(projectRoot)}${path.sep}`) || !fs.existsSync(absolute) || fs.lstatSync(absolute).isSymbolicLink()) throw new Error("BASELINE_TARGET_UNSAFE");
  const approvedHash = checksumFile(absolute);
  if (finding.fileHashSha256 && approvedHash !== finding.fileHashSha256) throw new Error("BASELINE_SOURCE_CHANGED");
  const target = path.join(projectRoot, ".dekoclean", "state", "protected-integrity.json");
  const baseline = JSON.parse(fs.readFileSync(target, "utf8")) as Baseline;
  const approval: ProtectedFileBaselineApproval = { filePath, previousHash: baseline.checksums[filePath], approvedHash, approvedAt: new Date().toISOString(), approvedBy: input.approvedBy, scanId: input.scanId, findingId: finding.id, reason: input.reason };
  baseline.checksums[filePath] = approvedHash;
  baseline.approvals = [...(baseline.approvals ?? []), approval].slice(-1000);
  const temporary = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(baseline, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporary, target);
  updateFindingLifecycle(finding.id, { status: "RESOLVED", action: "validate", success: true, message: "The approved hash now matches the trusted baseline." }, projectRoot);
  writeFindings(readFindings(projectRoot).map((entry) => entry.id === finding.id ? { ...entry, baselineApprovalStatus: "baseline-approved" } : entry), projectRoot);
  return approval;
}

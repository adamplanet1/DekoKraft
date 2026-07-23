import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readDekoCleanAudit } from "../lib/dekoclean/auditLog.ts";
import { calculateSecurityScore } from "../lib/dekoclean/findingSelectors.ts";
import { readFindings, writeFindings } from "../lib/dekoclean/findingStore.ts";
import { approveSecurityFinding, temporarilyIgnoreSecurityFinding, validateSecurityFinding } from "../lib/dekoclean/securityFindingActions.ts";
import type { DekoCleanFinding } from "../lib/dekoclean/types.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-security-actions-"));
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const write = (relative: string, value: string) => {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value, "utf8");
};
const git = (...args: string[]) => execFileSync("git", args, { cwd: root, stdio: "ignore" });

try {
  const oldContent = "export const safe = true;\n";
  const newContent = "export const safe = true;\nexport const feature = true;\n";
  write("next.config.ts", oldContent);
  git("init"); git("config", "user.email", "test@example.com"); git("config", "user.name", "DekoClean Test");
  git("add", "next.config.ts"); git("commit", "-m", "baseline");
  write("next.config.ts", newContent); git("add", "next.config.ts"); git("commit", "-m", "expected feature");
  write(".dekoclean/state/protected-integrity.json", JSON.stringify({ checksums: { "next.config.ts": digest(oldContent) } }));
  const finding: DekoCleanFinding = {
    id: "finding-test", findingId: "finding-test", type: "integrity-mismatch", category: "integrity-issues", severity: "high",
    title: "changed", description: "changed", explanation: "changed", affectedFiles: ["next.config.ts"], affectedPaths: ["next.config.ts"],
    count: 1, evidence: [], dependencies: [], relatedFindingIds: [], detectedBy: "integrity-check", source: "integrity-check",
    detectedAt: new Date().toISOString(), recommendedAction: "validate", recommendedActions: ["validate", "restore", "ignore"],
    repairAvailable: false, canRollback: true, canValidate: true, requiresAdminConfirmation: true, status: "new",
    lifecycle: { status: "OPEN", updatedAt: new Date().toISOString() }, fileHashSha256: digest(newContent),
    previousFileHashSha256: digest(oldContent), protectedChangeClassification: "unexpected-change", baselineApprovalStatus: "pending-baseline-approval",
  };
  writeFindings([finding], root);
  const inspection = validateSecurityFinding(finding.id, "test-admin", root);
  assert.equal(inspection.classification, "expected_project_change");
  assert.equal(inspection.canApprove, true);
  assert.equal(inspection.canRestore, true);
  approveSecurityFinding(finding.id, true, "Reviewed committed test change.", "test-admin", root);
  assert.equal(readFindings(root)[0].lifecycle?.status, "RESOLVED");
  assert.equal(calculateSecurityScore(readFindings(root)).finalScore, 100);
  assert.equal(readDekoCleanAudit(root).at(-1)?.metadata?.decision, "approved project change");

  const ignoredFinding = { ...finding, id: "finding-ignore", findingId: "finding-ignore", lifecycle: { status: "OPEN" as const, updatedAt: new Date().toISOString() }, status: "new" as const };
  writeFindings([ignoredFinding], root);
  temporarilyIgnoreSecurityFinding(ignoredFinding.id, new Date(Date.now() + 86_400_000).toISOString(), "Awaiting review.", "test-admin", root);
  assert.equal(readFindings(root)[0].lifecycle?.status, "OPEN");
  assert.equal(calculateSecurityScore(readFindings(root)).finalScore, 90);

  write("next.config.ts", newContent);
  const stale = validateSecurityFinding(ignoredFinding.id, "test-admin", root);
  assert.equal(stale.classification, "stale_finding");
  assert.equal(readFindings(root)[0].lifecycle?.status, "RESOLVED");

  const suspiciousContent = `${newContent}export const token = "unsafe-test-value";\n`;
  write("next.config.ts", suspiciousContent);
  writeFindings([{ ...ignoredFinding, id: "finding-suspicious", findingId: "finding-suspicious", fileHashSha256: digest(suspiciousContent), previousFileHashSha256: digest(newContent), lifecycle: { status: "OPEN", updatedAt: new Date().toISOString() } }], root);
  const suspicious = validateSecurityFinding("finding-suspicious", "test-admin", root);
  assert.equal(suspicious.classification, "suspicious_change");
  assert.equal(suspicious.canApprove, false);
  assert.ok(suspicious.dangerousLines.length > 0);
  console.log("DekoClean security finding action tests passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

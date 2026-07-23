import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { readDekoCleanAudit } from "../lib/dekoclean/auditLog.ts";
import { calculateSecurityScore } from "../lib/dekoclean/findingSelectors.ts";
import { createLocalCleanupPreview, executeLocalSimpleCleanup } from "../lib/dekoclean/localSimpleCleanup.ts";
import { analyzeSecurityFindingRootCause } from "../lib/dekoclean/rootCauseAnalysis.ts";
import { writeFindings } from "../lib/dekoclean/findingStore.ts";
import type { DekoCleanFinding } from "../lib/dekoclean/types.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-security-improvements-"));
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const write = (relative: string, value: string) => {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
};
const git = (...args: string[]) => execFileSync("git", args, { cwd: root, stdio: "ignore" });

try {
  const before = "export default { output: \"export\" };\n";
  const after = "export default { output: \"export\", trailingSlash: true };\n";
  write("next.config.ts", before);
  git("init"); git("config", "user.email", "test@example.com"); git("config", "user.name", "DekoClean Test");
  git("add", "next.config.ts"); git("commit", "-m", "baseline");
  write("next.config.ts", after);
  write(".dekoclean/state/protected-integrity.json", JSON.stringify({ checksums: { "next.config.ts": digest(before) } }));
  const finding: DekoCleanFinding = {
    id: "security-config", findingId: "security-config", type: "integrity-mismatch", category: "integrity-issues", severity: "high",
    title: "configuration", description: "configuration", explanation: "configuration",
    affectedFiles: ["next.config.ts"], affectedPaths: ["next.config.ts"], count: 1, evidence: [], dependencies: [], relatedFindingIds: [],
    detectedBy: "integrity-check", source: "integrity-check", detectedAt: new Date().toISOString(),
    recommendedAction: "validate", recommendedActions: ["validate"], repairAvailable: false, canRollback: false, canValidate: true,
    requiresAdminConfirmation: true, status: "new", lifecycle: { status: "OPEN", updatedAt: new Date().toISOString() },
    fileHashSha256: digest(after), previousFileHashSha256: digest(before),
  };
  writeFindings([finding], root);
  const fileBeforeAnalysis = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");
  const analysis = analyzeSecurityFindingRootCause(finding.id, root);
  assert.equal(analysis.classification, "configuration-change");
  assert.equal(fs.readFileSync(path.join(root, "next.config.ts"), "utf8"), fileBeforeAnalysis, "root-cause analysis must not mutate the source file");
  assert.equal(calculateSecurityScore([finding]).finalScore, 90, "analysis and cleanup must not bypass finding-driven score");

  write(".next/cache/compiler.tmp", "generated-cache");
  write(".dekoclean/tmp/stale.tmp", "diagnostic");
  write("app/protected.ts", "must remain");
  write("public/upload.png", "must remain");
  const preview = createLocalCleanupPreview(root);
  assert.deepEqual(preview.candidates.map((item) => item.relativePath).sort(), [".dekoclean/tmp", ".next/cache"]);
  assert.equal(preview.candidates.some((item) => item.relativePath.includes("..")), false);
  assert.throws(() => executeLocalSimpleCleanup({ previewId: "../../app", confirmed: true }, "test-admin", root), /PREVIEW_INVALID/);
  const cleaned = executeLocalSimpleCleanup({ previewId: preview.previewId, confirmed: true }, "test-admin", root);
  assert.equal(cleaned.deletedItems, 2);
  assert.equal(fs.existsSync(path.join(root, "app/protected.ts")), true);
  assert.equal(fs.existsSync(path.join(root, "public/upload.png")), true);
  assert.ok(readDekoCleanAudit(root).some((entry) => entry.metadata?.operation === "local-simple-cleanup"));

  const adminRoute = fs.readFileSync(path.join(process.cwd(), "app/api/admin/dekoclean/analyze-root-cause/route.ts"), "utf8");
  const participantCleanupRoute = fs.readFileSync(path.join(process.cwd(), "app/api/participant/security/cleanup/route.ts"), "utf8");
  const participantScanRoute = fs.readFileSync(path.join(process.cwd(), "app/api/participant/security/scan/route.ts"), "utf8");
  assert.match(adminRoute, /withDekoCleanAdmin/);
  assert.match(participantCleanupRoute, /withParticipantMaintenance/);
  assert.match(participantCleanupRoute, /rejectParticipantOverride/);
  assert.match(participantScanRoute, /profileId: "security"/);
  assert.doesNotMatch(participantScanRoute, /readFindings|protectedBaseline|auditLog|projectRoot/);
  console.log("DekoClean security improvements tests passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

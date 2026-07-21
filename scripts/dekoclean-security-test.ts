import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createActionPlan } from "../lib/dekoclean/actionPlans.ts";
import { readDekoCleanAudit } from "../lib/dekoclean/auditLog.ts";
import { assertDekoCleanAdminRole } from "../lib/dekoclean/authorization.ts";
import { createDekoCleanConfig, runDekoCleanScan } from "../lib/dekoclean/index.ts";
import { executeDekoCleanPlan } from "../lib/dekoclean/operations.ts";
import { calculateHealthScore, readHealthScoreHistory, recordHealthScore } from "../lib/dekoclean/healthScore.ts";
import { createDiagnosisCard, SEVERITY_EXPLANATIONS } from "../lib/dekoclean/diagnosis.ts";
import { quarantineFindingPaths } from "../lib/dekoclean/quarantine.ts";
import { applyConfirmedReferenceRepair, previewReferenceRepair } from "../lib/dekoclean/repair.ts";
import { restoreDekoCleanManifest } from "../lib/dekoclean/restore.ts";
import { recommendSecurityAction } from "../lib/dekoclean/securityAdvisor.ts";
import { readSecurityMemory, saveSecurityMemoryEntry } from "../lib/dekoclean/securityMemory.ts";
import { readMaintenanceTimeline } from "../lib/dekoclean/timeline.ts";
import type { DekoCleanFinding, SecurityMemoryEntry } from "../lib/dekoclean/types.ts";
import { createSafeSyntheticHash, runDekoRadarScan } from "../lib/dekoradar/scanProject.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-security-"));
function fixture(relativePath: string, content: string): void {
  const target = path.join(root, relativePath); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, content, "utf8");
}

try {
  fixture("package.json", '{"private":true}\n');
  fixture("app/page.tsx", 'import Missing from "../components/Missing"; export default function Page(){return <img src="/images/missing.png"/>}\n');
  fixture("app/healthy/page.tsx", "export default function Page(){return null}\n");
  fixture("components/card.tsx", 'export const image = "/images/old.png";\n');
  fixture("public/images/new.png", "safe-image");
  fixture("duplicate.tmp", "duplicate-safe"); fixture("duplicate-copy.tmp", "duplicate-safe");
  fixture("data/financial-ledger.json", '{"protected":true}\n');
  const syntheticHash = createSafeSyntheticHash("harmless synthetic security test record");
  fixture(".dekoclean/security-reports/mock.json", JSON.stringify([{
    source: "synthetic-test-connector", severity: "high", detectedAt: new Date().toISOString(),
    threatName: "Synthetic harmless test detection", category: "suspicious", filePath: "components/card.tsx",
    fileHashSha256: syntheticHash, detectionId: "synthetic-001",
  }]));

  const cleanReport = runDekoCleanScan(createDekoCleanConfig(root));
  assert.equal(cleanReport.candidates.find((candidate) => candidate.path === "data/financial-ledger.json")?.risk, "protected", "financial data stays protected");
  const radar = await runDekoRadarScan(root);
  assert.ok(radar.findings.some((finding) => finding.type === "broken-import"), "missing import detected");
  assert.ok(radar.findings.some((finding) => finding.type === "broken-asset-reference"), "broken image detected");
  assert.ok(radar.findings.some((finding) => finding.type === "security-alert" || finding.type === "suspicious-file"), "structured security report adapted");
  const protectedFinding = radar.findings.find((finding) => finding.affectedPaths.includes("data/financial-ledger.json"));
  assert.notEqual(protectedFinding?.recommendedActions.includes("recreate"), true, "protected financial data never recreated");

  const brokenAsset = radar.findings.find((finding) => finding.type === "broken-asset-reference");
  assert.ok(brokenAsset);
  const repairPlan = createActionPlan([brokenAsset], "repair", root);
  assert.equal(fs.readFileSync(path.join(root, "app/page.tsx"), "utf8").includes("missing.png"), true, "plan does not auto edit");
  assert.equal(repairPlan.snapshotRequired, true);
  const preview = previewReferenceRepair(root, "components/card.tsx", "/images/old.png", "/images/new.png");
  assert.equal(applyConfirmedReferenceRepair(root, preview, false), null, "repair needs confirmation");
  assert.ok(applyConfirmedReferenceRepair(root, preview, true), "confirmed deterministic repair works");
  assert.equal(fs.readFileSync(path.join(root, "components/card.tsx"), "utf8").includes("/images/new.png"), true);

  const memoryEntry: SecurityMemoryEntry = {
    id: "memory-1", threatName: "Synthetic harmless test detection", category: "suspicious", fileHashSha256: syntheticHash,
    sourceConnector: "synthetic-test-connector", detectionId: "synthetic-001", confirmedTreatment: "manual-security-review",
    treatmentRecipe: { description: "Synthetic safe review recipe", allowedActions: ["validate"], validationCommands: ["npm run lint"], protectedPathsChecked: ["data"] },
    result: "successful", confirmedByAdmin: true, confirmedAt: new Date().toISOString(), validationPassed: true, enabled: true, createdAt: new Date().toISOString(),
  };
  saveSecurityMemoryEntry(memoryEntry, root);
  assert.equal(readSecurityMemory(root).length, 1, "confirmed validated memory saved");
  assert.throws(() => saveSecurityMemoryEntry({ ...memoryEntry, id: "failed", result: "failed" }, root), /Failed or unvalidated/);
  const changedHashFinding: DekoCleanFinding = { ...radar.findings.find((finding) => finding.detectedBy === "security-connector")!, fileHashSha256: createSafeSyntheticHash("different") };
  assert.equal(recommendSecurityAction(changedHashFinding, root).securityMemoryMatch?.sameHash, false, "different hash requires review");

  const manifest = quarantineFindingPaths({ projectRoot: root, confirmed: true, paths: ["duplicate.tmp"], findingId: "synthetic-001", adminReference: "test-admin", validate: false });
  assert.ok(manifest);
  assert.equal(fs.existsSync(path.join(root, "duplicate.tmp")), false, "quarantined");
  assert.equal(manifest.entries[0].quarantinePath.startsWith(".dekoclean/"), true, "quarantine cannot be served from public");
  restoreDekoCleanManifest(root, manifest.id);
  assert.equal(fs.existsSync(path.join(root, "duplicate.tmp")), true, "restore works");
  assert.throws(() => quarantineFindingPaths({ projectRoot: root, confirmed: true, paths: ["data/financial-ledger.json"], findingId: "protected", adminReference: "test-admin", validate: false }), /Protected path refused/);

  assert.throws(() => assertDekoCleanAdminRole("participant"), /restricted/); assert.doesNotThrow(() => assertDekoCleanAdminRole("admin"));
  const dashboardSource = fs.readFileSync(path.join(process.cwd(), "app/config/dashboardMenu.ts"), "utf8");
  assert.equal((dashboardSource.match(/id: "dekoclean"/g) ?? []).length, 1, "dashboard card appears once");
  assert.match(dashboardSource, /id: "dekoclean"[^\n]+roles: \["admin"\]/, "participant menu excludes DekoClean");

  const unsupported = radar.findings.find((finding) => finding.type === "broken-import")!;
  const healthBefore = recordHealthScore(root);
  assert.ok(healthBefore.value < 100, "real findings reduce the health score");
  assert.equal(createDiagnosisCard(unsupported).cause, unsupported.evidence[0], "diagnosis uses actual evidence");
  assert.match(SEVERITY_EXPLANATIONS.critical.explanation, /استقرار المشروع/, "severity has a human explanation");
  const unsupportedPlan = createActionPlan([unsupported], "repair", root);
  await assert.rejects(() => executeDekoCleanPlan({ planId: unsupportedPlan.id, confirmed: true, adminReference: "test-admin", projectRoot: root }), /deterministic reviewed recipe/);
  const audit = readDekoCleanAudit(root).at(-1);
  assert.equal(audit?.status, "failed"); assert.equal(audit?.rollbackStatus, "recommended");
  assert.ok(readMaintenanceTimeline(root).some((entry) => entry.operation === "repair" && entry.result === "failed"), "failed operation enters timeline");
  assert.ok(readHealthScoreHistory(root).length >= 1, "health history is chart ready");
  assert.equal(calculateHealthScore(root).value, healthBefore.value, "failed repair does not invent a health improvement");

  console.log("DekoClean Security & Repair fixture tests passed.");
} finally { fs.rmSync(root, { recursive: true, force: true }); }

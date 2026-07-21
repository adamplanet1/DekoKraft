import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createParticipantCleanPreview, executeParticipantQuickClean, getParticipantCleaningOverview, registerParticipantTemporaryFile, sanitizeParticipantCleanPreview } from "../lib/dekoclean/participant/cleaning.ts";
import { intakeParticipantUpload, requestParticipantQuarantineReview } from "../lib/dekoclean/participant/intake.ts";
import { executeParticipantScanRun, getParticipantMaintenanceOverview, startParticipantScan } from "../lib/dekoclean/participant/orchestrator.ts";
import { PARTICIPANT_CLEAN_PROFILES, PARTICIPANT_SCAN_PROFILES } from "../lib/dekoclean/participant/profiles.ts";
import { clearParticipantMaintenanceRateLimits } from "../lib/dekoclean/participant/rateLimit.ts";
import { collectParticipantResources } from "../lib/dekoclean/participant/scope.ts";
import { readAdminEscalations, readParticipantMaintenanceState } from "../lib/dekoclean/participant/store.ts";
import { readDekoCleanAudit } from "../lib/dekoclean/auditLog.ts";

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "dekokraft-participant-maintenance-"));
const participantId = "seller-001";
const otherParticipantId = "seller-002";

async function runScan(profileId: "quick" | "full" | "security" | "assets" | "performance") {
  const started = startParticipantScan({ participantId, profileId, projectRoot: fixtureRoot, defer: false });
  return executeParticipantScanRun(started.scanId, participantId, fixtureRoot);
}

try {
  clearParticipantMaintenanceRateLimits();

  const dashboardMenu = fs.readFileSync(path.join(process.cwd(), "app/config/dashboardMenu.ts"), "utf8");
  const routesSource = fs.readFileSync(path.join(process.cwd(), "app/config/routes.ts"), "utf8");
  assert.match(dashboardMenu, /id: "maintenance"[^\n]+roles: \["participant"\]/);
  assert.match(dashboardMenu, /hrefByRole: \{ participant: routes\.participant\.maintenance \}/);
  assert.match(routesSource, /maintenance: "\/participant\/maintenance"/);
  assert.equal(PARTICIPANT_SCAN_PROFILES.length, 5);
  assert.deepEqual(PARTICIPANT_SCAN_PROFILES.map((profile) => profile.id), ["quick", "full", "security", "assets", "performance"]);
  assert.deepEqual(PARTICIPANT_CLEAN_PROFILES.map((profile) => profile.id), ["quick-clean", "deep-clean"]);

  const resources = collectParticipantResources(participantId, fixtureRoot);
  assert.ok(resources.length > 0, "fixture participant must expose owned resources");
  assert.ok(resources.every((resource) => resource.participantId === participantId));
  assert.equal(resources.some((resource) => resource.resourceId.includes("box-001")), false, "another participant product must never enter scope");

  const full = await runScan("full");
  assert.equal(full.status, "completed");
  assert.ok(full.scannedResources > 0);
  const quick = await runScan("quick");
  assert.equal(quick.scannedResources, 0, "unchanged resources should be skipped by the cached hash scan");

  const performance = await runScan("performance");
  assert.equal(performance.status, "completed");
  const performanceFinding = readParticipantMaintenanceState(participantId, fixtureRoot).findings.find((item) => item.scanId === performance.scanId && item.title.includes("غير متاحة"));
  assert.ok(performanceFinding, "unavailable performance data must be explicit instead of fabricated");

  const intake = await intakeParticipantUpload({ participantId, filename: "invoice.pdf.exe", mimeType: "application/octet-stream", content: Buffer.from("never execute this fixture"), projectRoot: fixtureRoot });
  assert.equal(intake.quarantine.status, "blocked");
  assert.equal(intake.quarantine.severity, "critical");
  assert.equal("storageReference" in intake.quarantine, false);
  assert.equal("checksum" in intake.quarantine, false);
  const afterIntake = readParticipantMaintenanceState(participantId, fixtureRoot);
  const blocked = afterIntake.quarantine.find((item) => item.id === intake.quarantine.id);
  assert.ok(blocked);
  assert.equal(blocked?.status, "blocked");
  assert.ok(blocked?.storageReference.startsWith("intake/"));
  assert.equal(path.resolve(fixtureRoot, ".dekoclean", "participant-maintenance", "participants").startsWith(path.join(fixtureRoot, "public")), false);
  assert.equal(afterIntake.containment.active, true);
  assert.equal(readParticipantMaintenanceState(otherParticipantId, fixtureRoot).containment.active, false);
  assert.ok(readAdminEscalations(fixtureRoot).some((alert) => alert.participantId === participantId && alert.containmentActive));

  assert.throws(() => requestParticipantQuarantineReview({ participantId: otherParticipantId, quarantineId: intake.quarantine.id, projectRoot: fixtureRoot }), /العثور/);
  const reviewed = requestParticipantQuarantineReview({ participantId, quarantineId: intake.quarantine.id, projectRoot: fixtureRoot });
  assert.equal(reviewed.status, "blocked", "participant review must never release a blocked upload");
  assert.equal("storageReference" in reviewed, false);

  registerParticipantTemporaryFile(participantId, "preview.tmp", Buffer.from("regenerable participant preview"), fixtureRoot);
  const deepPreview = createParticipantCleanPreview({ participantId, profileId: "deep-clean", projectRoot: fixtureRoot });
  assert.equal(deepPreview.executable, false);
  assert.ok(readParticipantMaintenanceState(participantId, fixtureRoot).recoveryManifests.some((manifest) => manifest.operationId.includes(deepPreview.previewId)), "deep preview must create a participant recovery manifest");
  assert.throws(() => executeParticipantQuickClean({ participantId, previewId: deepPreview.previewId, confirmed: true, candidateIds: deepPreview.candidates.map((item) => item.id), projectRoot: fixtureRoot }), /غير صالحة/);

  const quickPreview = createParticipantCleanPreview({ participantId, profileId: "quick-clean", projectRoot: fixtureRoot });
  assert.ok(quickPreview.candidates.length > 0);
  assert.ok(quickPreview.candidates.every((item) => item.risk === "low" && !item.protected));
  const browserPreview = sanitizeParticipantCleanPreview(quickPreview);
  assert.equal(JSON.stringify(browserPreview).includes("storageReference"), false);
  assert.throws(() => executeParticipantQuickClean({ participantId: otherParticipantId, previewId: quickPreview.previewId, confirmed: true, candidateIds: quickPreview.candidates.map((item) => item.id), projectRoot: fixtureRoot }), /غير صالحة/);
  const cleaned = executeParticipantQuickClean({ participantId, previewId: quickPreview.previewId, confirmed: true, candidateIds: quickPreview.candidates.map((item) => item.id), projectRoot: fixtureRoot });
  assert.ok(cleaned.reclaimedBytes > 0);
  assert.ok(cleaned.manifest.entries.every((entry) => entry.ownership === participantId));
  assert.equal(getParticipantCleaningOverview(participantId, fixtureRoot).latestPreview && JSON.stringify(getParticipantCleaningOverview(participantId, fixtureRoot).latestPreview).includes("storageReference"), false);

  const overview = getParticipantMaintenanceOverview(participantId, fixtureRoot);
  assert.equal(JSON.stringify(overview).includes("storageReference"), false);
  assert.equal(JSON.stringify(overview).includes(fixtureRoot), false);
  const audit = readDekoCleanAudit(fixtureRoot);
  assert.ok(audit.some((entry) => entry.operationId === full.scanId));
  assert.ok(audit.some((entry) => entry.operationId === cleaned.operation.operationId));

  const sharedRoute = fs.readFileSync(path.join(process.cwd(), "app/api/participant/maintenance/_shared.ts"), "utf8");
  assert.match(sharedRoute, /requireParticipantSession/);
  assert.match(sharedRoute, /"participantId" in body/);
  assert.match(sharedRoute, /"sellerId" in body/);
  const participantPage = fs.readFileSync(path.join(process.cwd(), "app/participant/maintenance/page.tsx"), "utf8");
  assert.match(participantPage, /requireParticipantSession/);
  assert.match(participantPage, /<ParticipantMaintenanceCenter/);
  assert.equal(participantPage.includes("searchParams"), false);
  const maintenanceCenter = fs.readFileSync(path.join(process.cwd(), "app/participant/components/ParticipantMaintenanceCenter.tsx"), "utf8");
  assert.match(maintenanceCenter, /DekoClean Security &amp; Repair Center/);
  assert.match(maintenanceCenter, /الفحص الذكي/);
  assert.match(maintenanceCenter, /التنظيف/);
  assert.match(maintenanceCenter, /لم يُنفذ بعد/);
  assert.match(maintenanceCenter, /لم تُحسب بعد/);
  assert.equal(maintenanceCenter.includes("ParticipantStudioDashboard"), false);
  const dashboardSource = fs.readFileSync(path.join(process.cwd(), "app/participant/components/ParticipantStudioDashboard.tsx"), "utf8");
  assert.match(dashboardSource, /item\.key === "maintenance"/);
  assert.match(dashboardSource, /\/admin\/participants\/\$\{participantId\}\/maintenance/);
  const adminMaintenancePage = fs.readFileSync(path.join(process.cwd(), "app/admin/participants/[participantId]/maintenance/page.tsx"), "utf8");
  assert.match(adminMaintenancePage, /requireAdminSession/);
  assert.match(adminMaintenancePage, /<ParticipantMaintenanceCenter/);
  assert.equal(adminMaintenancePage.includes("ParticipantStudioDashboard"), false);

  console.log("Participant Maintenance Center tests passed.");
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

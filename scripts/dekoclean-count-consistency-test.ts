import assert from "node:assert/strict";
import { detectEmptyNavigationDestination } from "../lib/dekoclean/detectors/navigationIntegrityDetector.ts";
import { selectNeedsReviewFindings, selectSecurityFindings } from "../lib/dekoclean/findingSelectors.ts";
import { enrichFinding } from "../lib/dekoclean/findingEngine.ts";

const base = (id: string, type: "unused-file" | "integrity-mismatch", status: "new" | "resolved" = "new") => enrichFinding({ id, type, severity: type === "integrity-mismatch" ? "high" : "info", title: id, explanation: id, affectedPaths: [`${id}.ts`], evidence: [id], detectedBy: type === "integrity-mismatch" ? "integrity-check" : "dekoclean", detectedAt: "2026-01-01T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: false, status });
const active = base("active", "unused-file");
const duplicate = { ...active, id: "duplicate", findingId: "duplicate" };
const recurring = { ...base("security", "integrity-mismatch"), occurrenceCount: 12 };
const resolved = base("resolved", "unused-file", "resolved");
const selected = selectNeedsReviewFindings([active, duplicate, recurring, resolved]);
assert.equal(selected.findings.length, 1);
assert.equal(selected.breakdown.duplicateRecordsExcluded, 0);
assert.equal(selected.breakdown.resolvedRecordsExcluded, 1);
assert.equal(selected.breakdown.informationalRecordsExcluded, 2);
assert.equal(selectSecurityFindings([active, duplicate, recurring, resolved]).length, 1);
assert.equal(detectEmptyNavigationDestination({ sourceId: "security", target: "radar", expectedCount: 1, renderedRecordCount: 1, renderedIdentifiableRecordCount: 0, loading: false, securitySensitive: true })[0]?.severity, "high");
assert.equal(detectEmptyNavigationDestination({ sourceId: "security", target: "radar", expectedCount: 1, renderedRecordCount: 0, renderedIdentifiableRecordCount: 0, loading: true }).length, 0);
console.log("DekoClean count consistency tests passed.");

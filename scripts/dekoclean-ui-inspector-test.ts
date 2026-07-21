import assert from "node:assert/strict";
import { detectUIInspectorFindings } from "../lib/dekoclean/detectors/uiInspectorDetector.ts";
import { getUnconnectedUIRecords, inspectUIRegistry, summarizeUIInspection, uiInspectorFindingId } from "../lib/dekoclean/uiInspector.ts";
import type { UIInspectorRecord } from "../lib/dekoclean/uiInspectorTypes.ts";

const base = (overrides: Partial<UIInspectorRecord> = {}): UIInspectorRecord => ({ id: "working", label: "زر", kind: "button", status: "working", expectedAction: "refresh", connected: true, lastCheckedAt: "fixture-v1", ...overrides });
assert.equal(getUnconnectedUIRecords([base()]).length, 0);
assert.equal(getUnconnectedUIRecords([base({ status: "informational", expectedAction: "none", connected: false })]).length, 0);
assert.equal(getUnconnectedUIRecords([base({ status: "disabled", connected: false })]).length, 0);
const dead = base({ id: "dead", connected: false });
assert.equal(getUnconnectedUIRecords([dead]).length, 1);
assert.equal(inspectUIRegistry([dead, dead]).length, 1);
assert.equal(getUnconnectedUIRecords([base({ id: "nav", expectedAction: "navigate", target: "", connected: true })]).length, 1);
assert.equal(getUnconnectedUIRecords([base({ id: "details", expectedAction: "open-details", target: "details", connected: true })]).length, 0);
assert.equal(detectUIInspectorFindings([base({ id: "security-repair", expectedAction: "repair", connected: false })])[0]?.severity, "high");
const summary = summarizeUIInspection([base(), dead, base({ id: "info", status: "informational", expectedAction: "none", connected: false })]);
assert.equal(summary.total, summary.working + summary.unconnected + summary.disabled + summary.informational + summary.unknown);
assert.equal(uiInspectorFindingId(dead), uiInspectorFindingId({ ...dead, lastCheckedAt: "later" }));
console.log("DekoClean UI Inspector tests passed.");

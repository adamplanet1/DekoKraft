import assert from "node:assert/strict";
import { classifyProtectedFileChange } from "../lib/dekoradar/integrityMonitor.ts";
import { calculateSecurityScore } from "../lib/dekoclean/findingSelectors.ts";
import { enrichFinding } from "../lib/dekoclean/findingEngine.ts";

const classify = (overrides: Partial<Parameters<typeof classifyProtectedFileChange>[0]> = {}) => classifyProtectedFileChange({ exists: true, readable: true, structurallyValid: true, currentHash: "current", previousHash: "previous", workingTreeChange: false, ...overrides });
assert.equal(classify({ workingTreeChange: true }), "authorized-project-change");
assert.equal(classify({ previousHash: undefined }), "unverified-change");
assert.equal(classify(), "unexpected-change");
assert.equal(classify({ readable: false }), "integrity-failure");
const finding = (id: string, severity: "info" | "medium" | "high" | "critical") => enrichFinding({ id, type: "integrity-mismatch", severity, title: id, explanation: id, affectedPaths: [`${id}.ts`], evidence: [id], detectedBy: "integrity-check", detectedAt: "2026-01-01T00:00:00.000Z", recommendedActions: ["validate"], requiresAdminConfirmation: true, status: "new" });
assert.deepEqual(calculateSecurityScore([finding("info", "info"), finding("medium", "medium"), finding("high", "high"), finding("critical", "critical")]), { baseScore: 100, criticalPenalty: 20, highPenalty: 10, mediumPenalty: 5, lowPenalty: 0, finalScore: 65 });
assert.equal(calculateSecurityScore(["a", "b", "c", "d", "e"].map((id) => finding(id, "critical"))).finalScore, 0);
assert.equal(calculateSecurityScore([{ ...finding("ignored", "high"), status: "ignored" }]).finalScore, 90, "ignored findings remain deducted");
assert.equal(calculateSecurityScore([{ ...finding("resolved", "critical"), status: "resolved" }]).finalScore, 100, "resolved findings do not reduce the score");
console.log("DekoClean security lifecycle tests passed.");

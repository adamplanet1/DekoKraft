import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { calculateMemoryIntegrity, regenerateMemoryIntegrityBaseline } from "../lib/dekoclean/memoryIntegrity.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-memory-"));
fs.mkdirSync(path.join(root, "app", "api"), { recursive: true });
fs.mkdirSync(path.join(root, ".dekoclean", "state"), { recursive: true });
fs.writeFileSync(path.join(root, "app", "api", "route.ts"), "export const value = 1;\n");
fs.writeFileSync(path.join(root, ".dekoclean", "state", "findings.json"), "[]\n");
execFileSync("git", ["init", "-q"], { cwd: root });
execFileSync("git", ["config", "user.email", "integrity@example.test"], { cwd: root });
execFileSync("git", ["config", "user.name", "Integrity Test"], { cwd: root });
execFileSync("git", ["add", "app/api/route.ts"], { cwd: root });
execFileSync("git", ["commit", "-qm", "baseline"], { cwd: root });
fs.writeFileSync(path.join(root, ".dekoclean", "state", "protected-integrity.json"), JSON.stringify({ createdAt: new Date(0).toISOString(), checksums: {} }));

const initial = calculateMemoryIntegrity(root);
assert.equal(initial.scannedSourceFiles, 1);
assert.equal(initial.changedExpectedFiles, 1);
assert.equal(initial.unexpectedChangedFiles, 0);
assert.equal(initial.score, 100);

const refreshed = regenerateMemoryIntegrityBaseline("test refresh", root);
assert.equal(refreshed.healthyFiles, 1);
assert.equal(refreshed.changedExpectedFiles, 0);
assert.equal(refreshed.score, 100);
const secondScan = calculateMemoryIntegrity(root);
assert.deepEqual(
  { ...secondScan, calculatedAt: refreshed.calculatedAt },
  refreshed,
);

fs.writeFileSync(path.join(root, "app", "api", "route.ts"), "export const value = 2;\n");
const unexpected = calculateMemoryIntegrity(root);
assert.equal(unexpected.unexpectedChangedFiles, 1);
assert.equal(unexpected.score, 0);
assert.throws(() => regenerateMemoryIntegrityBaseline("unsafe refresh", root), /MEMORY_INTEGRITY_BASELINE_UNSAFE/);

console.log("DekoClean memory integrity test passed.");

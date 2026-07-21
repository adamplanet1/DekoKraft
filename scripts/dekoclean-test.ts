import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createDekoCleanConfig, runDekoCleanScan } from "../lib/dekoclean/index.ts";
import { enrichFinding, organizeFindings } from "../lib/dekoclean/findingEngine.ts";
import { applyDekoClean } from "../lib/dekoclean/quarantine.ts";
import { restoreDekoCleanManifest } from "../lib/dekoclean/restore.ts";
import { runDekoRadarScan } from "../lib/dekoradar/scanProject.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-fixture-"));

function fixture(relativePath: string, content: string): void {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content, "utf8");
}

try {
  fixture("package.json", "{\"private\":true}\n");
  fixture("app/page.tsx", 'import { Referenced } from "../src/referenced"; export default function Page(){ return Referenced(); }\n');
  fixture("app/demo/page.tsx", "export default function Demo(){ return null; }\n");
  fixture("src/referenced.ts", 'export function Referenced(){ return "kept"; }\n');
  fixture("src/referenced-copy.ts", 'export function Referenced(){ return "kept"; }\n');
  fixture("src/unreferenced.ts", "export const unused = true;\n");
  fixture("src/dynamic-loader.ts", "export const load = (name: string) => import(`./plugins/${name}`);\n");
  fixture("data/protected.json", '{"participantId":"protected"}\n');
  fixture("public/images/item.webp", "fixture-image");
  fixture("content/product.json", '{"image":"/images/item.webp"}\n');
  fixture("scratch.tmp", "temporary\n");
  fixture("scratch-old.txt", "safe backup\n");
  fixture(".next/server/generated.js", "generated\n");
  fixture("nested/dist/generated.js", "generated\n");
  fixture("debug.log", "generated log\n");
  fixture("bundle.js.map", "{}\n");

  const config = createDekoCleanConfig(root, {
    protectedPaths: ["data"],
    protectedNamePatterns: [],
    buildDirectories: [],
    cacheDirectories: [],
    dependencyDirectories: [],
    ignoredDirectories: [".dekoclean"],
  });
  const report = runDekoCleanScan(config);
  const byPath = new Map(report.candidates.map((candidate) => [candidate.path, candidate]));

  assert.equal(byPath.get("data/protected.json")?.risk, "protected", "protected data must stay protected");
  assert.equal(byPath.has("src/referenced.ts"), false, "referenced component must be kept");
  assert.equal(byPath.get("src/referenced-copy.ts")?.reasons.includes("duplicate-content"), true, "exact duplicate must be detected");
  assert.equal(byPath.has("scratch.tmp"), false, "generated temp file must be ignored completely");
  assert.equal(report.largestFiles.some((file) => file.path.startsWith(".next/") || file.path.includes("/dist/")), false, "generated directories must be excluded from scan results");
  assert.equal(report.largestFiles.some((file) => file.path.endsWith(".log") || file.path.endsWith(".map")), false, "generated files must be excluded from scan results");
  assert.equal(byPath.get("scratch-old.txt")?.risk, "safe", "explicit backup copy remains a reviewable cleanup candidate");
  assert.equal(byPath.get("src/unreferenced.ts")?.risk, "review", "unreferenced source must require review");
  assert.equal(byPath.has("app/demo/page.tsx"), false, "Next route must not be marked unused");
  assert.equal(byPath.has("public/images/item.webp"), false, "JSON-referenced public image must be kept");
  assert.equal(byPath.get("src/dynamic-loader.ts")?.reasons.includes("dynamic-reference-risk"), true, "dynamic load must require review");

  const duplicatedFindings = ["app/a.tsx", "app/b.tsx", "app/c.tsx"].map((filePath, index) => enrichFinding({
    id: `raw-${index}`,
    type: "broken-import",
    severity: index === 2 ? "high" : "medium",
    title: "Missing base reference",
    explanation: "The same missing reference is used by multiple files.",
    affectedPaths: [filePath],
    evidence: ["Import: @/missing/base"],
    detectedBy: "dekoradar",
    detectedAt: new Date(1_700_000_000_000 + index).toISOString(),
    recommendedActions: ["repair", "validate"],
    requiresAdminConfirmation: true,
    status: "new",
  }));
  const grouped = organizeFindings(duplicatedFindings);
  assert.equal(grouped.length, 1, "identical root causes must merge into one finding");
  assert.equal(grouped[0]?.count, 3, "grouped finding count must represent affected files");
  assert.deepEqual(grouped[0]?.affectedFiles, ["app/a.tsx", "app/b.tsx", "app/c.tsx"]);
  assert.equal(grouped[0]?.severity, "high", "grouped finding keeps the strongest severity");
  assert.equal(grouped[0]?.repairAvailable, true);

  const firstRadarScan = await runDekoRadarScan(root, false);
  const secondRadarScan = await runDekoRadarScan(root, false);
  assert.equal(firstRadarScan.cacheHit, false, "first smart scan must calculate results");
  assert.equal(secondRadarScan.cacheHit, true, "unchanged project must reuse the smart scan cache");

  const refused = applyDekoClean({ projectRoot: root, confirmed: false, validate: false });
  assert.equal(refused, null, "apply without confirmation must do nothing");
  assert.equal(fs.existsSync(path.join(root, "scratch-old.txt")), true);

  const manifest = applyDekoClean({ projectRoot: root, confirmed: true, validate: false });
  assert.ok(manifest);
  assert.equal(fs.existsSync(path.join(root, "data/protected.json")), true, "protected file must never move");
  assert.equal(fs.existsSync(path.join(root, "scratch-old.txt")), false, "confirmed safe file should be quarantined");

  restoreDekoCleanManifest(root, manifest.id);
  assert.equal(fs.existsSync(path.join(root, "scratch-old.txt")), true, "restore must return quarantined files");
  assert.equal(fs.readFileSync(path.join(root, "scratch-old.txt"), "utf8"), "safe backup\n");

  console.log("DekoClean fixture tests passed (generated exclusions and safe rollback verified).");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

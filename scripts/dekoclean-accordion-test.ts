import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { DEKOCLEAN_ACCORDION_STORAGE_KEY, parseAccordionState } from "../app/admin/dekoclean/accordionState.ts";

const root = process.cwd();
const center = fs.readFileSync(path.join(root, "app/admin/dekoclean/DekoCleanCenter.tsx"), "utf8");
const scan = fs.readFileSync(path.join(root, "app/admin/dekoclean/SmartScanCenter.tsx"), "utf8");
const section = fs.readFileSync(path.join(root, "app/admin/dekoclean/DekoAccordionSection.tsx"), "utf8");
const css = fs.readFileSync(path.join(root, "app/admin/dekoclean/dekoclean.css"), "utf8");
const ids = ["project-health", "smart-scan", "overview", "scan-results", "findings", "repair", "dekorebuild", "operations", "maintenance", "recovery-points"];

assert.equal(DEKOCLEAN_ACCORDION_STORAGE_KEY, "dekoclean:accordion:v1");
assert.equal(parseAccordionState("not-json", ids), null);
assert.equal(parseAccordionState(JSON.stringify({ sections: [], singleOpen: false }), ids), null);
assert.deepEqual(parseAccordionState(JSON.stringify({ sections: { overview: false, unknown: true, findings: "yes" }, singleOpen: true }), ids), { sections: { overview: false }, singleOpen: true });

assert.match(section, /type="button"/);
assert.match(section, /aria-expanded=\{isOpen\}/);
assert.match(section, /aria-controls=\{contentId\}/);
assert.equal(scan.includes("dkSmartScanOverlay"), false, "Smart Scan Center must not render the old page overlay");
assert.equal(scan.includes("window.confirm"), false, "long scans must use the accessible confirmation dialog");
assert.match(scan, /dkSmartScanConfirmDialog/);
assert.equal((center.match(/dkCleanOverviewGroup/g) ?? []).length, 1, "Overview KPI cards must render once");
assert.equal((center.match(/<SmartScanCenter/g) ?? []).length, 1, "Smart Scan Center must render once");
assert.equal((center.match(/<DekoRebuildPanel/g) ?? []).length, 1, "DekoRebuild must render once");
for (const id of ids) assert.match(center, new RegExp(`id="${id}"`));
assert.match(css, /\.dkSmartScanProfiles\{display:grid;grid-template-columns:repeat\(4/);
assert.match(css, /@media\(max-width:980px\)\{\.dkSmartScanProfiles\{grid-template-columns:repeat\(2/);
assert.match(css, /@media\(max-width:620px\)[^{]*\{[^}]*|\.dkSmartScanProfiles\{grid-template-columns:1fr\}/);
assert.match(css, /\.dkAccordionContent\{[^}]*grid-template-rows:0fr/);

console.log("DekoClean accordion workspace tests passed.");

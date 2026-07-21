import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { enrichFinding } from "../lib/dekoclean/findingEngine.ts";
import { createRepairPreview } from "../lib/dekoclean/repairPreview.ts";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "dekoclean-repair-preview-"));
const fixture = (relativePath: string, content: string) => {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
};

try {
  fixture("package.json", '{"private":true}\n');
  fixture("app/page.tsx", 'import Card from "../ui/Card"; export default function Page(){return <Card/>}\n');
  fixture("components/Card.tsx", "export default function Card(){return null}\n");
  const finding = enrichFinding({
    id: "broken-card-import", type: "broken-import", severity: "high", title: "Broken import", explanation: "fixture",
    affectedPaths: ["app/page.tsx"], evidence: ["Import: ../ui/Card"], detectedBy: "dekoradar",
    detectedAt: new Date().toISOString(), recommendedActions: ["repair", "restore"], requiresAdminConfirmation: true, status: "new",
  });
  const before = fs.readFileSync(path.join(root, "app/page.tsx"), "utf8");
  const recipe = createRepairPreview(finding, root);
  assert.equal(recipe.readOnly, true);
  assert.equal(recipe.changes.length, 1);
  assert.equal(recipe.changes[0].after, "../components/Card");
  assert.notEqual(recipe.changes[0].expectedBeforeChecksum, recipe.changes[0].expectedAfterChecksum);
  assert.equal(recipe.backupPlan.recoveryPointType, "before-repair");
  assert.equal(fs.readFileSync(path.join(root, "app/page.tsx"), "utf8"), before, "preview must not modify the affected file");

  fixture("other/Card.tsx", "export default function Card(){return null}\n");
  assert.throws(() => createRepairPreview(finding, root), /unambiguous import target/);
  console.log("DekoClean deterministic Repair Preview tests passed.");
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

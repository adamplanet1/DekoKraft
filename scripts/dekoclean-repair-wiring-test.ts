import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const center = fs.readFileSync(path.join(root, "app/admin/dekoclean/DekoCleanCenter.tsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "app/admin/dekoclean/dekoclean.css"), "utf8");

assert.match(center, /onClick=\{\(\) => void previewRepair\(\)\}/, "Repair button invokes the preview handler");
assert.match(center, /disabled=\{Boolean\(busy\) \|\| !selected\?\.recommendedActions\.includes\("repair"\)\}/, "Repair button is disabled when backend does not support repair");
assert.match(center, /Repair is not available for this finding type\./, "unsupported repair tooltip is rendered");
assert.match(center, /previewRepair[\s\S]+?\/api\/admin\/dekoclean\/repair-preview/, "preview handler calls the preview API");
assert.match(center, /acceptRepairPreview[\s\S]+?\/api\/admin\/dekoclean\/repair\/accept/, "acceptance handler calls the acceptance API");
assert.match(center, /executeAcceptedRepair[\s\S]+?\/api\/admin\/dekoclean\/repair\/execute/, "execution handler calls the execution API");
assert.match(center, /JSON\.stringify\(\{ recipeId: repairRecipe\.id \}\)/, "execution sends the persisted recipe identifier");
assert.match(center, /setRepairExecution\(result\)/, "execution response updates UI state");
assert.match(center, /busy === "repair-preview"/, "preview loading state is rendered");
assert.match(center, /busy === "repair-execute"/, "execution loading state is rendered");
assert.match(center, /status-\$\{repairExecution\.status\}/, "server result status selects the rendered execution state");
for (const status of ["completed", "rolled-back", "failed", "rejected"]) assert.ok(styles.includes(`status-${status}`), `styles include ${status} result state`);
for (const route of ["repair-preview/route.ts", "repair/accept/route.ts", "repair/execute/route.ts"]) {
  const routePath = path.join(root, "app/api/admin/dekoclean", route);
  assert.ok(fs.existsSync(routePath), `${route} is registered as a Next.js route handler`);
  assert.match(fs.readFileSync(routePath, "utf8"), /exposeDomainErrors: true/, `${route} returns safe domain validation errors to the UI`);
}

console.log("DekoClean Repair UI/API wiring tests passed.");

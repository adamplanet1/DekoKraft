import assert from "node:assert/strict";
import { verifyStudioLayoutGeometry, type LayoutRect } from "../app/studio/lib/verifyStudioLayout.ts";

const rect = (left: number, top: number, width: number, height: number): LayoutRect => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

const valid = verifyStudioLayoutGeometry({
  viewport: rect(0, 0, 1200, 900),
  studio: rect(12, 12, 1176, 876),
  toolbar: rect(270, 70, 620, 42),
  canvas: rect(270, 120, 620, 620),
  panels: [rect(42, 110, 280, 420), rect(790, 110, 360, 560)],
});
assert.deepEqual(valid, [], "valid production Studio geometry must pass");

const invalid = verifyStudioLayoutGeometry({
  viewport: rect(0, 0, 1200, 900),
  studio: rect(-5, 0, 1210, 920),
  toolbar: rect(-20, 10, 1220, 50),
  canvas: rect(200, 100, 640, 520),
  panels: [rect(1000, 100, 300, 500)],
});
assert.deepEqual(invalid, [
  "studio-outside-viewport",
  "toolbar-outside-studio",
  "toolbar-canvas-width-mismatch",
  "toolbar-canvas-inline-mismatch",
  "canvas-not-square",
  "panel-0-outside-studio",
]);

console.log("Studio production layout geometry verification passed.");

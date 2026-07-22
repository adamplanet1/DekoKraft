export type LayoutRect = Pick<DOMRect, "top" | "right" | "bottom" | "left" | "width" | "height">;

type StudioLayoutGeometry = {
  viewport: LayoutRect;
  studio: LayoutRect;
  toolbar: LayoutRect;
  canvas: LayoutRect;
  panels: LayoutRect[];
};

const isInside = (inner: LayoutRect, outer: LayoutRect, tolerance = 1) => (
  inner.left >= outer.left - tolerance
  && inner.top >= outer.top - tolerance
  && inner.right <= outer.right + tolerance
  && inner.bottom <= outer.bottom + tolerance
);

export function verifyStudioLayoutGeometry({ viewport, studio, toolbar, canvas, panels }: StudioLayoutGeometry): string[] {
  const issues: string[] = [];
  if (!isInside(studio, viewport)) issues.push("studio-outside-viewport");
  if (!isInside(toolbar, studio)) issues.push("toolbar-outside-studio");
  if (!canvas.width || !canvas.height || Math.abs(canvas.width / canvas.height - 1) > 0.02) issues.push("canvas-not-square");
  if (!isInside(canvas, studio)) issues.push("canvas-outside-studio");
  panels.forEach((panel, index) => {
    if (!isInside(panel, studio)) issues.push(`panel-${index}-outside-studio`);
  });
  return issues;
}

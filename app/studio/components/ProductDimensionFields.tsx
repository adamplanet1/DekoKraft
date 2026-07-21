import type { ProductDimensions } from "./SmartEditLearningStore";

export default function ProductDimensionFields({ value, labels, onChange }: {
  value: ProductDimensions;
  labels: { length: string; width: string; height: string; unit: string };
  onChange: (value: ProductDimensions) => void;
}) {
  const dimensionInput = (key: "length" | "width" | "height", short: string) => <label className="smartEditDimensionField"><span>{short} — {labels[key]}</span><input type="number" min="0" step="any" inputMode="decimal" value={value[key] ?? ""} onChange={(event) => onChange({ ...value, [key]: event.currentTarget.value === "" ? null : Number(event.currentTarget.value), source: "manual", confirmed: false })} /></label>;
  return <div className="smartEditDimensions">
    {dimensionInput("length", "L")}{dimensionInput("width", "B")}{dimensionInput("height", "H")}
    <label className="smartEditDimensionField"><span>{labels.unit}</span><select value={value.unit} onChange={(event) => onChange({ ...value, unit: event.currentTarget.value as ProductDimensions["unit"], source: "manual", confirmed: false })}><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option></select></label>
  </div>;
}

"use client";

type ThreeDImageFilterControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  note?: string;
  onChange: (value: number) => void;
};

export default function ThreeDImageFilterControl({ id, label, value, min, max, unit = "%", note, onChange }: ThreeDImageFilterControlProps) {
  return (
    <label className="echoThreeDImageControl" htmlFor={id}>
      <span className="echoThreeDImageControl__heading"><span>{label}</span><output htmlFor={id}>{value}{unit}</output></span>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      {note && <small>{note}</small>}
    </label>
  );
}

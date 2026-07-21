"use client";

type EmbroideryFilterControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  note?: string;
  onChange: (value: number) => void;
};

export default function EmbroideryFilterControl({ id, label, value, min, max, unit = "%", note, onChange }: EmbroideryFilterControlProps) {
  return (
    <label className="echoEmbroideryControl" htmlFor={id}>
      <span className="echoEmbroideryControl__heading"><span>{label}</span><output htmlFor={id}>{value}{unit}</output></span>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      {note && <small>{note}</small>}
    </label>
  );
}

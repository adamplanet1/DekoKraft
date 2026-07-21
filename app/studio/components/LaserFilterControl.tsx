"use client";

type LaserFilterControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  note?: string;
  onChange: (value: number) => void;
};

export default function LaserFilterControl({ id, label, value, min, max, unit = "%", note, onChange }: LaserFilterControlProps) {
  return (
    <label className="echoLaserControl" htmlFor={id}>
      <span className="echoLaserControl__heading"><span>{label}</span><output htmlFor={id}>{value}{unit}</output></span>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      {note && <small>{note}</small>}
    </label>
  );
}

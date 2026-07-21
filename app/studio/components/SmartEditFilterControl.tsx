"use client";

type SmartEditFilterControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  note?: string;
  onChange: (value: number) => void;
};

export default function SmartEditFilterControl({ id, label, value, min, max, unit = "%", note, onChange }: SmartEditFilterControlProps) {
  return (
    <label className="echoSmartEditControl" htmlFor={id}>
      <span className="echoSmartEditControl__heading"><span>{label}</span><output htmlFor={id}>{value}{unit}</output></span>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      {note && <small>{note}</small>}
    </label>
  );
}

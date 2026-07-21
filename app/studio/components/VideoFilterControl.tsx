type VideoFilterControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  note?: string;
  onChange: (value: number) => void;
};

export default function VideoFilterControl({
  id,
  label,
  value,
  min,
  max,
  unit = "%",
  note,
  onChange,
}: VideoFilterControlProps) {
  return (
    <label className="echoVideoControl" htmlFor={id}>
      <span className="echoVideoControl__heading">
        <strong>{label}</strong>
        <output htmlFor={id}>{value}{unit}</output>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {note && <small>{note}</small>}
    </label>
  );
}

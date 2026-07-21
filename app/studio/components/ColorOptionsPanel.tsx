import type { ColorMode } from "../../../lib/echo/echoGuide";

const ids: ColorMode[] = ["preserve", "enhance", "warm", "cool", "monochrome", "custom"];

export default function ColorOptionsPanel({ value, labels, customColor, onChange, onCustomColor }: {
  value?: { mode: ColorMode; customColor?: string }; labels: Record<ColorMode, string>; customColor: string;
  onChange: (value: { mode: ColorMode; customColor?: string }) => void; onCustomColor: (value: string) => void;
}) {
  return <aside className="smartEditOptionPanel smartEditColorOptions">
    {ids.map((id) => <button key={id} type="button" aria-pressed={value?.mode === id} data-active={value?.mode === id} onClick={() => onChange({ mode: id, ...(id === "custom" ? { customColor } : {}) })}><span className={`smartEditOptionPreview smartEditColorPreview--${id}`} style={id === "custom" ? { background: customColor } : undefined} /><span>{labels[id]}</span></button>)}
    {value?.mode === "custom" && <div className="smartEditColorInput"><input type="color" value={customColor} onChange={(event) => onCustomColor(event.currentTarget.value)} /><input type="text" value={customColor} pattern="#[0-9a-fA-F]{6}" onChange={(event) => onCustomColor(event.currentTarget.value)} /></div>}
  </aside>;
}

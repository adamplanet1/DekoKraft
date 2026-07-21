import type { BackgroundMode } from "../../../lib/echo/echoGuide";

const ids: BackgroundMode[] = ["transparent", "blurred", "glass", "white", "black", "original", "custom"];
const previews: Record<BackgroundMode, string> = { transparent: "checker", blurred: "blur", glass: "glass", white: "white", black: "black", original: "original", custom: "custom" };

export default function BackgroundOptionsPanel({ value, labels, customColor, onChange, onCustomColor }: {
  value?: { mode: BackgroundMode; customColor?: string }; labels: Record<BackgroundMode, string>; customColor: string;
  onChange: (value: { mode: BackgroundMode; customColor?: string }) => void; onCustomColor: (value: string) => void;
}) {
  return <aside className="smartEditOptionPanel smartEditBackgroundOptions">
    {ids.map((id) => <button key={id} type="button" aria-pressed={value?.mode === id} data-active={value?.mode === id} onClick={() => onChange({ mode: id, ...(id === "custom" ? { customColor } : {}) })}><span className={`smartEditOptionPreview smartEditOptionPreview--${previews[id]}`} style={id === "custom" ? { background: customColor } : undefined} /><span>{labels[id]}</span></button>)}
    {value?.mode === "custom" && <div className="smartEditColorInput"><input type="color" value={customColor} onChange={(event) => onCustomColor(event.currentTarget.value)} /><input type="text" value={customColor} pattern="#[0-9a-fA-F]{6}" onChange={(event) => onCustomColor(event.currentTarget.value)} /></div>}
  </aside>;
}

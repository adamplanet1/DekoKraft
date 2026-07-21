import { Circle, Droplets, Lightbulb, Palette, ShieldCheck, Sparkles } from "lucide-react";

export default function SmartEditOptionButtons({ labels, active, preserveShape, improveQuality, lightingActive, shadowsActive, onToggle, onTogglePreserveShape, onToggleQuality, onToggleLighting, onToggleShadows }: {
  labels: { background: string; colors: string; lighting: string; shadows: string; preserveShape: string; quality: string };
  active: "background" | "colors" | null;
  onToggle: (panel: "background" | "colors") => void;
  preserveShape: boolean; improveQuality: boolean; lightingActive: boolean; shadowsActive: boolean;
  onTogglePreserveShape: () => void; onToggleQuality: () => void; onToggleLighting: () => void; onToggleShadows: () => void;
}) {
  return <div className="smartEditOptionButtons">
    <button type="button" aria-pressed={active === "background"} data-active={active === "background"} onClick={() => onToggle("background")}><Droplets size={17} />{labels.background}</button>
    <button type="button" aria-pressed={active === "colors"} data-active={active === "colors"} onClick={() => onToggle("colors")}><Palette size={17} />{labels.colors}</button>
    <button type="button" aria-pressed={lightingActive} data-active={lightingActive} onClick={onToggleLighting}><Lightbulb size={17} />{labels.lighting}</button>
    <button type="button" aria-pressed={shadowsActive} data-active={shadowsActive} onClick={onToggleShadows}><Circle size={17} />{labels.shadows}</button>
    <button type="button" aria-pressed={preserveShape} data-active={preserveShape} onClick={onTogglePreserveShape}><ShieldCheck size={17} />{labels.preserveShape}</button>
    <button type="button" aria-pressed={improveQuality} data-active={improveQuality} onClick={onToggleQuality}><Sparkles size={17} />{labels.quality}</button>
  </div>;
}

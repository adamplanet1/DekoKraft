import type { CSSProperties } from "react";
import type { StudioWorkshop } from "./studioWorkshops";

type StudioWorkshopCardProps = {
  workshop: StudioWorkshop;
  title: string;
  description: string;
  status: string;
  isSelected: boolean;
  onSelect: () => void;
};

type WorkshopStyle = CSSProperties & {
  "--creative-workshop-accent": string;
  "--creative-workshop-soft": string;
  "--creative-workshop-border": string;
  "--creative-workshop-glow": string;
};

export default function StudioWorkshopCard({
  workshop,
  title,
  description,
  status,
  isSelected,
  onSelect,
}: StudioWorkshopCardProps) {
  const Icon = workshop.icon;
  const style: WorkshopStyle = {
    "--creative-workshop-accent": workshop.accent,
    "--creative-workshop-soft": workshop.accentSoft,
    "--creative-workshop-border": workshop.accentBorder,
    "--creative-workshop-glow": workshop.accentGlow,
  };

  return (
    <button
      type="button"
      className="creativeStudiosWorkshop"
      data-workshop={workshop.id}
      aria-pressed={isSelected}
      aria-label={`${title}. ${status}`}
      style={style}
      onClick={onSelect}
    >
      <span className="creativeStudiosWorkshop__icon" aria-hidden="true">
        <Icon size={25} />
      </span>
      <span className="creativeStudiosWorkshop__heading">
        <strong>{title}</strong>
        <span className="creativeStudiosWorkshop__dot" aria-hidden="true" />
      </span>
      <span className="creativeStudiosWorkshop__description">{description}</span>
      <span className="creativeStudiosWorkshop__status">{status}</span>
    </button>
  );
}

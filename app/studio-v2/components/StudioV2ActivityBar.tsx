"use client";

import { studioV2Activities, type StudioV2ActivityId } from "./studioV2Activities";

type StudioV2ActivityBarProps = {
  activeActivity: StudioV2ActivityId;
  onActivityChange: (activity: StudioV2ActivityId) => void;
};

export default function StudioV2ActivityBar({
  activeActivity,
  onActivityChange,
}: StudioV2ActivityBarProps) {
  return (
    <nav className="studioV2ActivityBar" aria-label="أنشطة Echo Studio v2">
      {studioV2Activities.map(({ id, label, accent, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`studioV2ActivityButton studioV2Accent--${accent}${activeActivity === id ? " is-active" : ""}`}
          aria-label={label}
          aria-pressed={activeActivity === id}
          data-tooltip={label}
          onClick={() => onActivityChange(id)}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

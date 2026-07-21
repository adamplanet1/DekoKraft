"use client";

import type { ReactNode } from "react";

type StudioToolCardProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export default function StudioToolCard({
  icon,
  label,
  description,
  selected = false,
  disabled = false,
  onClick,
}: StudioToolCardProps) {
  const className = `smartStudioToolCard${selected ? " smartStudioToolCard--selected" : ""}`;
  const content = (
    <>
      <span className="smartStudioToolCard__icon" aria-hidden="true">{icon}</span>
      <span className="smartStudioToolCard__label">{label}</span>
      {description && <span className="smartStudioToolCard__description">{description}</span>}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return <article className={className}>{content}</article>;
}

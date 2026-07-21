"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface DekoAccordionSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  lockedOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export default function DekoAccordionSection({ id, title, subtitle, icon, badge, isOpen, onToggle, lockedOpen = false, children, className = "" }: DekoAccordionSectionProps) {
  const contentId = `${id}-content`;
  return <section className={`dkAccordionSection ${isOpen ? "is-open" : ""} ${className}`.trim()} data-accordion-id={id}>
    <button
      type="button"
      className="dkAccordionHeader"
      aria-expanded={isOpen}
      aria-controls={contentId}
      aria-disabled={lockedOpen || undefined}
      onClick={() => { if (!lockedOpen) onToggle(id); }}
    >
      <span className="dkAccordionHeading">{icon}<span><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span></span>
      {badge && <span className="dkAccordionBadge">{badge}</span>}
      <ChevronDown className="dkAccordionChevron" aria-hidden="true" />
    </button>
    <div className="dkAccordionContent" id={contentId} aria-hidden={!isOpen} inert={!isOpen}>
      <div className="dkAccordionContentInner">{children}</div>
    </div>
  </section>;
}

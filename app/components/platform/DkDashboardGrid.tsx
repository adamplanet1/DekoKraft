import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { DkButton, DkGlassPanel } from "../ui";
import { classNames } from "../ui/classNames";

export type DkDashboardGridItem = {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  indicators?: ReactNode;
};

export default function DkDashboardGrid({
  items,
  className,
  label,
}: {
  items: DkDashboardGridItem[];
  className?: string;
  label: string;
}) {
  return (
    <section className={classNames("dk-dashboard-grid", className)} aria-label={label}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <DkGlassPanel as="article" strength="normal" className="dk-dashboard-grid__card" key={item.id}>
            <DkButton href={item.href} icon={<Icon />} variant="transparent" size="lg">
              {item.description ? (
                <span className="dk-dashboard-grid__content">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                  {item.indicators}
                </span>
              ) : item.label}
            </DkButton>
          </DkGlassPanel>
        );
      })}
    </section>
  );
}

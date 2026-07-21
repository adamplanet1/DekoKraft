import type { HTMLAttributes, ReactNode } from "react";

export type DkPageHeroProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  align?: "start" | "center";
  size?: "compact" | "default" | "large";
};

export default function DkPageHero({
  title,
  description,
  eyebrow,
  metadata,
  actions,
  align = "center",
  size = "default",
  className,
  ...props
}: DkPageHeroProps) {
  const classes = [
    "dk-page-hero",
    `dk-page-hero--${align}`,
    `dk-page-hero--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes} {...props}>
      {eyebrow && <span className="dk-page-hero__eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {metadata && <div className="dk-page-hero__metadata">{metadata}</div>}
      {description && <div className="dk-page-hero__description">{description}</div>}
      {actions && <div className="dk-page-hero__actions">{actions}</div>}
    </header>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

export type DkContentSectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  align?: "start" | "center";
};

export default function DkContentSection({
  title,
  description,
  eyebrow,
  actions,
  align = "center",
  className,
  children,
  ...props
}: DkContentSectionProps) {
  const classes = ["dk-content-section", `dk-content-section--${align}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {(title || description || eyebrow || actions) && (
        <header className="dk-content-section__header">
          <div>
            {eyebrow && <span className="dk-content-section__eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {description && <div className="dk-content-section__description">{description}</div>}
          </div>
          {actions && <div className="dk-content-section__actions">{actions}</div>}
        </header>
      )}
      <div className="dk-content-section__body">{children}</div>
    </section>
  );
}

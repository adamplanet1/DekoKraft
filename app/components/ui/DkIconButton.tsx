import type { ReactNode } from "react";
import DkButton, { type DkButtonProps } from "./DkButton";

export type DkIconButtonProps = Omit<DkButtonProps, "children" | "icon" | "iconPosition" | "aria-label"> & {
  icon: ReactNode;
  label: string;
  children?: ReactNode;
  "aria-label"?: string;
};

export default function DkIconButton({
  icon,
  label,
  children,
  className,
  "aria-label": ariaLabel,
  title,
  ...props
}: DkIconButtonProps) {
  return (
    <DkButton
      className={`dk-icon-button${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel ?? label}
      {...props}
      title={title ?? label}
    >
      <span className="dk-icon-button__icon" aria-hidden="true">{icon}</span>
      {children}
    </DkButton>
  );
}

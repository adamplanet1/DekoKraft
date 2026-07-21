import type { MouseEventHandler, ReactNode } from "react";
import DkButton from "./DkButton";

export type DkCreatorButtonProps = {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  "aria-label"?: string;
  description?: string;
};

export default function DkCreatorButton({
  label,
  icon,
  description,
  className,
  ...props
}: DkCreatorButtonProps) {
  return (
    <DkButton className={`dk-creator-button${className ? ` ${className}` : ""}`} icon={icon} {...props}>
      <span className="dk-creator-button__label">{label}</span>
      {description && <span className="dk-creator-button__description">{description}</span>}
    </DkButton>
  );
}

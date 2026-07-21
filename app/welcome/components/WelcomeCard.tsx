import type { MouseEventHandler, ReactNode } from "react";
import { DkButton } from "../../components/ui";

type WelcomeCardProps = {
  title: string;
  icon: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "dialog";
};

export default function WelcomeCard({
  title,
  icon,
  href,
  onClick,
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  "aria-haspopup": ariaHasPopup,
}: WelcomeCardProps) {
  return (
    <DkButton
      className="welcomeCard"
      href={href}
      onClick={onClick}
      icon={<span className="welcomeCardIcon">{icon}</span>}
      size="lg"
      variant="transparent"
      aria-label={title}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
    >
      <span className="welcomeCardTitle">{title}</span>
    </DkButton>
  );
}

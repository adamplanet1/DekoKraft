import type { ReactNode } from "react";
import { classNames } from "./classNames";

export type DkToolbarGroupProps = {
  children: ReactNode;
  position: "start" | "end";
  className?: string;
};

export default function DkToolbarGroup({ children, position, className }: DkToolbarGroupProps) {
  return (
    <div className={classNames("dk-toolbar__group", `dk-toolbar__group--${position}`, className)}>
      {children}
    </div>
  );
}

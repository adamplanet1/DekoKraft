import type { CSSProperties, ReactNode } from "react";
import { classNames } from "./classNames";

export type DkMediaFrameProps = {
  children: ReactNode;
  ratio?: CSSProperties["aspectRatio"];
  rounded?: boolean;
  className?: string;
  overflow?: "hidden" | "visible";
};

export default function DkMediaFrame({
  children,
  ratio,
  rounded = true,
  className,
  overflow = "hidden",
}: DkMediaFrameProps) {
  return (
    <div
      className={classNames(
        "dk-media-frame",
        rounded && "dk-media-frame--rounded",
        `dk-media-frame--overflow-${overflow}`,
        className,
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {children}
    </div>
  );
}

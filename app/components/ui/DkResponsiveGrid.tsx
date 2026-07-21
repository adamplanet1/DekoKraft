import type { CSSProperties, HTMLAttributes } from "react";

type GridStyle = CSSProperties & {
  "--dk-grid-desktop": number;
  "--dk-grid-tablet": number;
  "--dk-grid-mobile": number;
  "--dk-grid-min-card": string;
};

export type DkResponsiveGridProps = HTMLAttributes<HTMLDivElement> & {
  desktop?: number;
  tablet?: number;
  mobile?: number;
  minCardWidth?: string;
};

export default function DkResponsiveGrid({
  desktop = 4,
  tablet = 2,
  mobile = 1,
  minCardWidth = "0px",
  className,
  style,
  ...props
}: DkResponsiveGridProps) {
  const gridStyle: GridStyle = {
    "--dk-grid-desktop": desktop,
    "--dk-grid-tablet": tablet,
    "--dk-grid-mobile": mobile,
    "--dk-grid-min-card": minCardWidth,
    ...style,
  };

  return (
    <div
      className={className ? `dk-responsive-grid ${className}` : "dk-responsive-grid"}
      style={gridStyle}
      {...props}
    />
  );
}

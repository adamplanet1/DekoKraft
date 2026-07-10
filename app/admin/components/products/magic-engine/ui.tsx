import { type CSSProperties, type ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
};

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="dkProductAnalysisHeader">
      <h3>{title}</h3>
    </div>
  );
}

type CardGridProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function CardGrid({ children, style }: CardGridProps) {
  return (
    <div className="dkProductCardPreviewGrid" style={style}>
      {children}
    </div>
  );
}

type CardItemProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function CardItem({ children, style }: CardItemProps) {
  return (
    <div className="dkProductCardPreviewItem" style={style}>
      {children}
    </div>
  );
}

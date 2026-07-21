import type { ImageProps } from "next/image";
import type { ReactNode } from "react";
import DkPublicCard from "./DkPublicCard";

export type DkProductCardProps = {
  title: ReactNode;
  description?: ReactNode;
  image: ImageProps["src"];
  imageAlt: string;
  href?: string;
  category?: ReactNode;
  price?: ReactNode;
  mediaFit?: "cover" | "contain";
  featured?: boolean;
};

export default function DkProductCard({
  title,
  description,
  image,
  imageAlt,
  href,
  category,
  price,
  mediaFit,
  featured = false,
}: DkProductCardProps) {
  return (
    <DkPublicCard
      className="dk-product-card"
      variant={featured ? "feature" : "default"}
      title={title}
      description={description}
      image={image}
      imageAlt={imageAlt}
      href={href}
      eyebrow={category}
      footer={price && <strong className="dk-product-card__price">{price}</strong>}
      mediaFit={mediaFit ?? (featured ? "contain" : "cover")}
    />
  );
}

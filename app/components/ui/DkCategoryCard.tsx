import type { ImageProps } from "next/image";
import type { ReactNode } from "react";
import DkPublicCard from "./DkPublicCard";

export type DkCategoryCardProps = {
  title: ReactNode;
  description?: ReactNode;
  image: ImageProps["src"];
  imageAlt: string;
  href: string;
  featured?: boolean;
};

export default function DkCategoryCard({
  title,
  description,
  image,
  imageAlt,
  href,
  featured = false,
}: DkCategoryCardProps) {
  return (
    <DkPublicCard
      className="dk-category-card"
      variant={featured ? "feature" : "default"}
      title={title}
      description={description}
      image={image}
      imageAlt={imageAlt}
      href={href}
      mediaFit={featured ? "contain" : "cover"}
    />
  );
}

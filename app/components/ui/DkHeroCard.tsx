import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { classNames } from "./classNames";

export type DkHeroCardProps = {
  title: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
  priority?: boolean;
  className?: string;
  overlay?: boolean;
  children?: ReactNode;
  aspectRatio?: CSSProperties["aspectRatio"];
  objectPosition?: CSSProperties["objectPosition"];
};

export default function DkHeroCard({
  title,
  imageSrc,
  imageAlt,
  href,
  priority = false,
  className,
  overlay = false,
  children,
  aspectRatio,
  objectPosition = "center",
}: DkHeroCardProps) {
  return (
    <Link href={href} className={classNames("dk-hero-card", className)} aria-label={title}>
      <article>
        <div className="dk-hero-card__media dkAdminToolImage" style={aspectRatio ? { aspectRatio } : undefined}>
          <Image
            className="dk-hero-card__image"
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 699px) 100vw, (max-width: 1099px) 50vw, 25vw"
            style={{ objectFit: "cover", objectPosition }}
            priority={priority}
          />
          {children}
          {overlay && (
            <>
              <span className="dk-hero-card__overlay dkAdminToolGradient" />
              <div className="dk-hero-card__text dkAdminToolTextOverlay">
                <h3 className="dk-hero-card__title dkAdminToolTitleOverlay dk-feature-title">{title}</h3>
                <span className="dkAdminToolSubtitle" aria-hidden="true" />
              </div>
            </>
          )}
        </div>
        {!overlay && (
          <div className="dk-hero-card__body dkAdminToolBody">
            <h3 className="dk-hero-card__title">{title}</h3>
          </div>
        )}
      </article>
    </Link>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { classNames } from "./classNames";

export type DkBrandProps = {
  name: string;
  subtitle?: string;
  mediaSrc: string;
  mediaType: "image" | "video";
  href?: string;
  className?: string;
  mediaAlt?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  fallbackImageSrc?: string;
};

export default function DkBrand({
  name,
  subtitle,
  mediaSrc,
  mediaType,
  href,
  className,
  mediaAlt = "",
  autoplay = true,
  loop = true,
  muted = true,
  playsInline = true,
  fallbackImageSrc,
}: DkBrandProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const useImage = mediaType === "image" || videoFailed;
  const imageSrc = videoFailed && fallbackImageSrc ? fallbackImageSrc : mediaSrc;
  const media = useImage ? (
    <Image
      className="dk-brand__media dk-brand__image admin-brand-logo dk-brand-media"
      src={imageSrc}
      alt={mediaAlt}
      width={64}
      height={64}
    />
  ) : (
    <video
      className="dk-brand__media dk-brand__video dkBrandLogoVideo dk-brand-media"
      autoPlay={autoplay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload="metadata"
      aria-hidden={mediaAlt ? undefined : true}
      aria-label={mediaAlt || undefined}
      onError={() => setVideoFailed(true)}
    >
      <source src={mediaSrc} type="video/mp4" />
    </video>
  );
  const row = (
    <div className="dk-brand__row admin-brand-title dkBrandHeading dk-brand-row" dir="ltr">
      {media}
      <div className="dk-brand__text">
        <h1 className="dk-brand__name dk-brand-name">{name}</h1>
      </div>
    </div>
  );

  return (
    <div className={classNames("dk-brand", className)}>
      {href ? <Link href={href}>{row}</Link> : row}
      {subtitle && <p className="dk-brand__subtitle dk-brand-subtitle">{subtitle}</p>}
    </div>
  );
}

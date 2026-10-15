import type { CSSProperties } from "react";
import type { EditorialImage } from "@/lib/content/model";
export function imageBackground(image?: EditorialImage): CSSProperties {
  return {
    "--editorial-image": image
      ? `url("${image.url.replaceAll('"', "%22")}")`
      : "none",
    "--editorial-mobile-image": image
      ? `url("${(image.mobileUrl || image.url).replaceAll('"', "%22")}")`
      : "none",
    backgroundImage: "var(--editorial-image)",
    backgroundPosition: image?.position,
  } as CSSProperties;
}
export function EditorialMedia({
  image,
  className,
}: {
  image?: EditorialImage;
  className?: string;
}) {
  if (!image) return null;
  return (
    <picture className="editorial-picture">
      {image.mobileUrl && (
        <source media="(max-width:767px)" srcSet={image.mobileUrl} />
      )}
      <img
        className={className}
        src={image.url}
        alt={image.alt}
        style={{ objectPosition: image.position }}
      />
    </picture>
  );
}

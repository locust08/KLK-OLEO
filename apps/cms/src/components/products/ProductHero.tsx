import { imageBackground } from "@/components/ui/EditorialMedia";
import type { EditorialImage } from "@/lib/content/model";
import { Fragment } from "react";

export function ProductHero({
  title,
  eyebrow,
  imageUrl,
  image,
}: {
  title: string;
  eyebrow?: string;
  imageUrl?: string;
  image?: EditorialImage;
}) {
  const titleParts = title.split("/");
  return (
    <section
      className="catalog-hero"
      style={imageBackground(
        image ?? (imageUrl ? { url: imageUrl, alt: "" } : undefined),
      )}
    >
      <div className="catalog-hero__shade" />
      <div className="catalog-hero__content">
        {eyebrow && <p>{eyebrow}</p>}
        <h1>
          {titleParts.map((part, index) => (
            <Fragment key={index}>
              {index > 0 && <wbr />}
              {part}
              {index < titleParts.length - 1 && "/"}
            </Fragment>
          ))}
        </h1>
      </div>
    </section>
  );
}

import styles from "./PageHero.module.css";
import { imageBackground } from "./EditorialMedia";
import type { EditorialImage } from "@/lib/content/model";
type PageHeroProps = {
  title: string;
  kind?: "about" | "resources" | "standard";
  imageUrl?: string;
  image?: EditorialImage;
};

export function PageHero({
  title,
  kind = "standard",
  imageUrl,
  image,
}: PageHeroProps) {
  return (
    <section
      className={`page-hero page-hero--${kind}`}
      style={
        image?.tabletUrl
          ? undefined
          : imageBackground(
              image ?? (imageUrl ? { url: imageUrl, alt: "" } : undefined),
            )
      }
    >
      {image?.tabletUrl && (
        <picture className={styles.picture}>
          <source
            media="(max-width:767px)"
            srcSet={image.mobileUrl || image.tabletUrl}
          />
          <source media="(max-width:1199px)" srcSet={image.tabletUrl} />
          <img
            src={image.url}
            alt={image.alt}
            style={{ objectPosition: image.position }}
            fetchPriority="high"
          />
        </picture>
      )}
      <h1>{title}</h1>
    </section>
  );
}

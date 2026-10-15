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
      style={imageBackground(
        image ?? (imageUrl ? { url: imageUrl, alt: "" } : undefined),
      )}
    >
      <h1>{title}</h1>
    </section>
  );
}

import { siteAssets } from "@/data/site-assets";
type PageHeroProps = {
  title: string;
  kind?: "about" | "resources" | "standard";
  imageUrl?: string;
};

export function PageHero({ title, kind = "standard", imageUrl }: PageHeroProps) {
  const image = imageUrl || (kind === "about"
    ? siteAssets.aboutHero
    : kind === "resources"
      ? siteAssets.resourcesHero
      : siteAssets.homeHero);

  return (
    <section className={`page-hero page-hero--${kind}`} style={{ backgroundImage: `url(${image})` }}>
      <h1>{title}</h1>
    </section>
  );
}

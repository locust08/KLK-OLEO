import { siteAssets } from "@/data/site-assets";
import styles from "./PageHero.module.css";
type PageHeroProps = {
  title: string;
  kind?: "about" | "resources" | "standard";
  imageUrl?: string;
  responsiveImages?: { tablet: string; mobile: string };
};

export function PageHero({ title, kind = "standard", imageUrl, responsiveImages }: PageHeroProps) {
  const image = imageUrl || (kind === "about"
    ? siteAssets.aboutHero
    : kind === "resources"
      ? siteAssets.resourcesHero
      : siteAssets.homeHero);

  return (
    <section className={`page-hero page-hero--${kind}`} style={responsiveImages ? undefined : { backgroundImage: `url(${image})` }}>
      {responsiveImages && <picture className={styles.picture}>
        <source media="(max-width: 767px)" srcSet={responsiveImages.mobile} />
        <source media="(max-width: 1199px)" srcSet={responsiveImages.tablet} />
        <img src={image} alt="" fetchPriority="high" />
      </picture>}
      <h1>{title}</h1>
    </section>
  );
}

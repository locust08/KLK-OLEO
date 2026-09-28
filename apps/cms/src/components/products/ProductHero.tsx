import { siteAssets } from "@/data/site-assets";

export function ProductHero({ title, eyebrow, imageUrl }: { title: string; eyebrow?: string; imageUrl?: string }) {
  return (
    <section
      className="catalog-hero"
      style={{ backgroundImage: `url(${imageUrl || siteAssets.productsHero})` }}
    >
      <div className="catalog-hero__shade" />
      <div className="catalog-hero__content">
        {eyebrow && <p>{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
    </section>
  );
}

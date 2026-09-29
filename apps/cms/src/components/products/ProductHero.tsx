import { siteAssets } from "@/data/site-assets";
import { Fragment } from "react";

export function ProductHero({ title, eyebrow, imageUrl }: { title: string; eyebrow?: string; imageUrl?: string }) {
  const titleParts = title.split("/");
  return (
    <section
      className="catalog-hero"
      style={{ backgroundImage: `url(${imageUrl || siteAssets.productsHero})` }}
    >
      <div className="catalog-hero__shade" />
      <div className="catalog-hero__content">
        {eyebrow && <p>{eyebrow}</p>}
        <h1>
          {titleParts.map((part, index) => (
            <Fragment key={index}>
              {index > 0 && <wbr />}
              {part}{index < titleParts.length - 1 && "/"}
            </Fragment>
          ))}
        </h1>
      </div>
    </section>
  );
}

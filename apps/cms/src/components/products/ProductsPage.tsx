import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProductHero } from "@/components/products/ProductHero";
import { ProductListing } from "@/components/products/ProductListing";
import type {
  PageContentViewModel,
  ProductCategoryGroups,
  ProductViewModel,
} from "@/lib/cms/view-models";

export function ProductsPage({
  groups,
  products,
  page,
}: {
  groups: ProductCategoryGroups;
  products: ProductViewModel[];
  page: PageContentViewModel | null;
}) {
  if (!page) return null;
  const intro = page.content.introduction;
  return (
    <>
      <SiteHeader />
      <main>
        <ProductHero
          title={page.heroHeading || page.title}
          eyebrow={page?.heroEyebrow || undefined}
          image={page.heroImage}
        />
        <section className="catalog-intro">
          <h2>{intro?.heading}</h2>
          <p>{intro?.body}</p>
        </section>
        <Suspense fallback={null}>
          <ProductListing groups={groups} products={products} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

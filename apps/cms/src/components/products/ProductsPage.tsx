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
  return (
    <>
      <SiteHeader />
      <main>
        <ProductHero title={page?.heroHeading || page?.title || "Products"} eyebrow={page?.heroEyebrow || undefined} imageUrl={page?.heroImageUrl} />
        <section className="catalog-intro">
          <p className="eyebrow">Product portfolio</p>
          <h2>{page?.sections[0]?.heading || "Formulation solutions built for performance"}</h2>
          <p>
            {page?.sections[0]?.body || "Explore our agrochemical portfolio by functionality, formulation type, or regulatory label."}
          </p>
        </section>
        <Suspense fallback={null}>
          <ProductListing groups={groups} products={products} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

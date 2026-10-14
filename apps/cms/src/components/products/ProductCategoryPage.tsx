import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProductHero } from "@/components/products/ProductHero";
import { ProductListing } from "@/components/products/ProductListing";
import {
  type ProductCategoryGroups,
  type ProductCategoryKey,
  type ProductViewModel,
} from "@/lib/cms/view-models";

export function ProductCategoryPage({
  category,
  groups,
  products,
}: {
  category: ProductCategoryKey;
  groups: ProductCategoryGroups;
  products: ProductViewModel[];
}) {
  const group = groups[category];

  return (
    <>
      <SiteHeader />
      <main>
        <ProductHero title={group.label} eyebrow="Products" />
        <Suspense fallback={null}>
          <ProductListing category={category} groups={groups} products={products} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

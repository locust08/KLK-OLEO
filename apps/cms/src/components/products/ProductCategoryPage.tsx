import Link from "next/link";
import { Suspense } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProductHero } from "@/components/products/ProductHero";
import { ProductListing } from "@/components/products/ProductListing";
import {
  productCategoryKeys,
  type ProductCategoryGroups,
  type ProductCategoryKey,
  type ProductViewModel,
  type PageContentViewModel,
} from "@/lib/cms/view-models";

export function ProductCategoryPage({
  category,
  groups,
  products,
  page,
}: {
  page: PageContentViewModel | null;
  category: ProductCategoryKey;
  groups: ProductCategoryGroups;
  products: ProductViewModel[];
}) {
  const group = groups[category];

  return (
    <>
      <SiteHeader />
      <main>
        <ProductHero
          title={group.label}
          eyebrow={page?.title}
          image={page?.heroImage}
        />
        <section className="catalog-category-intro">
          <nav aria-label="Product category pages">
            {productCategoryKeys.map((key) => (
              <Link
                key={key}
                className={key === category ? "is-active" : undefined}
                href={`/products/category/${key}`}
              >
                {groups[key].label}
              </Link>
            ))}
          </nav>
          {group.showDescription && group.description && (
            <p>{group.description}</p>
          )}
        </section>
        <Suspense fallback={null}>
          <ProductListing
            category={category}
            groups={groups}
            products={products}
          />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

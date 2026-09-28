import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ProductHero } from "@/components/products/ProductHero";
import { ProductListing } from "@/components/products/ProductListing";
import {
  productCategoryKeys,
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
        <section className="catalog-category-intro">
          <div>
            <p className="eyebrow">Browse by category</p>
            <h2>{group.label}</h2>
          </div>
          <p>{group.description}</p>
          <nav aria-label="Product category pages">
            {productCategoryKeys.map((key) => (
              <Link key={key} className={key === category ? "is-active" : undefined} href={`/products/category/${key}`}>
                {groups[key].label}
              </Link>
            ))}
          </nav>
        </section>
        <ProductListing category={category} groups={groups} products={products} />
      </main>
      <SiteFooter />
    </>
  );
}

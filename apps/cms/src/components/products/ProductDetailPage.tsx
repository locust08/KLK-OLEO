import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { ProductViewModel, ProductCategoryKey } from "@/lib/cms/view-models";
import { productFilterParam } from "@/lib/product-filtering";

function AttributeValues({ values, slugs, category }: { values: string[]; slugs: string[]; category: ProductCategoryKey }) {
  return <ul>{values.map((value, index) => <li key={value}>
    {slugs[index]
      ? <Link href={`/products/category/${category}?${new URLSearchParams({ [productFilterParam[category]]: slugs[index] })}`}>{value}</Link>
      : value}
  </li>)}</ul>;
}

function UnspecifiedAttribute() {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="visually-hidden">Not specified</span>
    </>
  );
}

export function ProductDetailPage({ product }: { product: ProductViewModel }) {
  const requestProductHref = product.id > 0
    ? `/contact?productId=${product.id}&product=${encodeURIComponent(product.name)}`
    : `/contact?product=${encodeURIComponent(product.name)}`;
  return (
    <>
      <SiteHeader />
      <main>
        <article className="product-detail">
          <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/products">Products</Link>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </nav>

          {product.imageUrl && (
            <div className="product-detail__visual">
              <img src={product.imageUrl} alt="" />
            </div>
          )}

          <header className="product-detail__header">
            <h1>{product.name}</h1>
            <h2>{product.type}</h2>
            <p>{product.summary}</p>
          </header>

          <section className="product-spec-panel" aria-label="Product application profile">
            <div>
              <h2>Functionalities</h2>
              {product.functionalities.length > 0
                ? <AttributeValues values={product.functionalities} slugs={product.functionalitySlugs} category="functionalities" />
                : <p className="product-attribute-empty"><UnspecifiedAttribute /></p>}
            </div>
            <div>
              <h2>Formulation Type</h2>
              {product.formulations.length > 0
                ? <AttributeValues values={product.formulations} slugs={product.formulationSlugs} category="formulation-type" />
                : <p className="product-attribute-empty"><UnspecifiedAttribute /></p>}
            </div>
            <div>
              <h2>Regulatory/Labels</h2>
              {product.labels.length > 0
                ? <AttributeValues values={product.labels} slugs={product.labelSlugs} category="regulatory-labels" />
                : <p className="product-attribute-empty"><UnspecifiedAttribute /></p>}
            </div>
          </section>

          <div className="product-detail__actions">
            <Link href={requestProductHref} className="product-action">
              Request Product
            </Link>
            <Link href="/resources" className="product-action product-action--outline">
              Request Brochure
            </Link>
          </div>

          <section className="product-meta-table" aria-labelledby="product-information-title">
            <h2 id="product-information-title">Product Information</h2>
            <dl>
              <div><dt>Manufacturing Site</dt><dd>{product.manufacturingSite}</dd></div>
              <div><dt>CAS Number</dt><dd>{product.casNumber}</dd></div>
            </dl>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import { FaArrowRightLong, FaDownload } from "react-icons/fa6";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { ProductViewModel } from "@/lib/cms/view-models";

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
                ? <ul>{product.functionalities.map((item) => <li key={item}>{item}</li>)}</ul>
                : <p className="product-attribute-empty"><UnspecifiedAttribute /></p>}
            </div>
            <div>
              <h2>Formulation Type</h2>
              {product.formulations.length > 0
                ? <ul>{product.formulations.map((item) => <li key={item}>{item}</li>)}</ul>
                : <p className="product-attribute-empty"><UnspecifiedAttribute /></p>}
            </div>
            <div>
              <h2>Regulatory/Labels</h2>
              {product.labels.length > 0
                ? <ul>{product.labels.map((item) => <li key={item}>{item}</li>)}</ul>
                : <p className="product-attribute-empty"><UnspecifiedAttribute /></p>}
            </div>
          </section>

          <div className="product-detail__actions">
            <Link href={requestProductHref} className="product-action">
              Request Product <FaArrowRightLong aria-hidden="true" />
            </Link>
            <Link href="/resources" className="product-action product-action--outline">
              Request Brochure <FaDownload aria-hidden="true" />
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

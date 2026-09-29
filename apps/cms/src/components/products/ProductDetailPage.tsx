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

          <header className="product-detail__header">
            <p className="eyebrow">Agrochemical formulation solution</p>
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
          </section>

          <div className="product-detail__actions">
            <Link href={`/contact?productId=${product.id}&product=${encodeURIComponent(product.name)}`} className="product-action">
              Request Product <FaArrowRightLong aria-hidden="true" />
            </Link>
            <Link href="/resources" className="product-action product-action--outline">
              Request Brochure <FaDownload aria-hidden="true" />
            </Link>
          </div>

          <section className="product-meta-grid" aria-label="Product details">
            <div><h2>Manufacturing Site</h2><p>{product.manufacturingSite}</p></div>
            <div><h2>Regulatory/Labels</h2><p>{product.labels.length > 0 ? product.labels.join(", ") : <UnspecifiedAttribute />}</p></div>
            <div><h2>CAS Number</h2><p>{product.casNumber}</p></div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

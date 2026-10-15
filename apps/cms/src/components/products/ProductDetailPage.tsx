import type { InterfaceCopy } from "@/lib/content/presentation";
import { BrochureButton } from "./BrochureButton";
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

export function ProductDetailPage({
  product,
  copy,
}: {
  product: ProductViewModel;
  copy: InterfaceCopy;
}) {
  const requestProductHref =
    product.id > 0
      ? `/contact?productId=${product.id}&product=${encodeURIComponent(product.name)}`
      : `/contact?product=${encodeURIComponent(product.name)}`;
  return (
    <>
      <SiteHeader />
      <main>
        <article className="product-detail">
          <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/products">{copy.products}</Link>
            <span aria-hidden="true">/</span>
            <span>{product.name}</span>
          </nav>

          {product.imageUrl && (
            <div className="product-detail__visual">
              <img
                src={product.imageUrl}
                alt={product.imageAlt ?? product.name}
              />
            </div>
          )}

          <header className="product-detail__header">
            <h1>{product.name}</h1>
            <h2>{product.type}</h2>
            <p>{product.summary}</p>
          </header>

          <section
            className="product-spec-panel"
            aria-label="Product application profile"
          >
            <div>
              <h2>{copy.detailFunction}</h2>
              {product.functionalities.length > 0 ? (
                <ul>
                  {product.functionalities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="product-attribute-empty">
                  <UnspecifiedAttribute />
                </p>
              )}
            </div>
            <div>
              <h2>{copy.detailFormulation}</h2>
              {product.formulations.length > 0 ? (
                <ul>
                  {product.formulations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="product-attribute-empty">
                  <UnspecifiedAttribute />
                </p>
              )}
            </div>
            <div>
              <h2>{copy.detailRegulation}</h2>
              {product.labels.length > 0 ? (
                <ul>
                  {product.labels.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="product-attribute-empty">
                  <UnspecifiedAttribute />
                </p>
              )}
            </div>
          </section>

          <div className="product-detail__actions">
            <Link href={requestProductHref} className="product-action">
              {copy.requestProduct} <FaArrowRightLong aria-hidden="true" />
            </Link>
            {product.brochureEnabled !== false && (
              <BrochureButton slug={product.slug} />
            )}
          </div>

          <section
            className="product-meta-table"
            aria-labelledby="product-information-title"
          >
            <h2 id="product-information-title">{copy.productInformation}</h2>
            <dl>
              <div>
                <dt>{copy.manufacturingSite}</dt>
                <dd>{product.manufacturingSite}</dd>
              </div>
              <div>
                <dt>{copy.casNumber}</dt>
                <dd>{product.casNumber}</dd>
              </div>
            </dl>
          </section>
          {!!product.resources?.length && (
            <section>
              <h2>{copy.relatedResources}</h2>
              <ul>
                {product.resources.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/resources?resource=${encodeURIComponent(r.slug)}`}
                    >
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

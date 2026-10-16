import type { InterfaceCopy } from "@/lib/content/presentation";
import type { EditorialSection } from "@/lib/content/model";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type {
  ProductViewModel,
  ProductCategoryKey,
} from "@/lib/cms/view-models";
import { productFilterParam } from "@/lib/product-filtering";
import { ProductBrochureButton } from "./ProductBrochureButton";
import { ContactBannerContent } from "@/components/layout/ContactBannerContent";

function AttributeValues({
  values,
  slugs,
  category,
}: {
  values: string[];
  slugs: string[];
  category: ProductCategoryKey;
}) {
  return (
    <ul>
      {values.map((value, index) => (
        <li key={value}>
          {slugs[index] ? (
            <Link
              href={`/products/category/${category}?${new URLSearchParams({ [productFilterParam[category]]: slugs[index] })}`}
            >
              {value}
            </Link>
          ) : (
            value
          )}
        </li>
      ))}
    </ul>
  );
}

function UnspecifiedAttribute() {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="visually-hidden">Not specified</span>
    </>
  );
}

function ProductApplicationTable({
  product,
  copy,
}: {
  product: ProductViewModel;
  copy: InterfaceCopy;
}) {
  const rows: Array<{
    label: string;
    values: string[];
    slugs: string[];
    category: ProductCategoryKey;
  }> = [
    {
      label: copy.detailFunction ?? "",
      values: product.functionalities,
      slugs: product.functionalitySlugs,
      category: "functionalities",
    },
    {
      label: copy.detailFormulation ?? "",
      values: product.formulations,
      slugs: product.formulationSlugs,
      category: "formulation-type",
    },
    {
      label: copy.detailRegulation ?? "",
      values: product.labels,
      slugs: product.labelSlugs,
      category: "regulatory-labels",
    },
  ];
  return (
    <table
      className="product-pdf-attributes"
      aria-label="Product application profile"
    >
      <tbody>
        {rows.map(({ label, values, slugs, category }) => (
          <tr key={category}>
            <th scope="row">{label}</th>
            <td>
              {values.length ? (
                <AttributeValues
                  values={values}
                  slugs={slugs}
                  category={category}
                />
              ) : (
                <UnspecifiedAttribute />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ProductDetailPage({
  product,
  copy = {},
  contactBanner,
  version,
  draft = false,
  printOnly = false,
}: {
  product: ProductViewModel;
  copy?: InterfaceCopy;
  contactBanner?: EditorialSection;
  version?: string;
  draft?: boolean;
  printOnly?: boolean;
}) {
  const showManufacturing = Boolean(
    product.manufacturingSite &&
    (!printOnly || product.manufacturingSite !== "Not specified"),
  );
  const showCas = Boolean(
    product.casNumber && (!printOnly || product.casNumber !== "Not specified"),
  );
  const requestProductHref =
    product.id > 0
      ? `/contact?productId=${product.id}&product=${encodeURIComponent(product.name)}`
      : `/contact?product=${encodeURIComponent(product.name)}`;
  return (
    <>
      {!printOnly && <SiteHeader />}
      <main>
        <article className="product-detail">
          {!printOnly && (
            <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
              <Link href="/products">{copy.products}</Link>
              <span aria-hidden="true">/</span>
              <span>{product.name}</span>
            </nav>
          )}

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

          {printOnly ? (
            <ProductApplicationTable product={product} copy={copy} />
          ) : (
            <section
              className="product-spec-panel"
              aria-label="Product application profile"
            >
              <div>
                <h2>{copy.detailFunction}</h2>
                {product.functionalities.length > 0 ? (
                  <AttributeValues
                    values={product.functionalities}
                    slugs={product.functionalitySlugs}
                    category="functionalities"
                  />
                ) : (
                  <p className="product-attribute-empty">
                    <UnspecifiedAttribute />
                  </p>
                )}
              </div>
              <div>
                <h2>{copy.detailFormulation}</h2>
                {product.formulations.length > 0 ? (
                  <AttributeValues
                    values={product.formulations}
                    slugs={product.formulationSlugs}
                    category="formulation-type"
                  />
                ) : (
                  <p className="product-attribute-empty">
                    <UnspecifiedAttribute />
                  </p>
                )}
              </div>
              <div>
                <h2>{copy.detailRegulation}</h2>
                {product.labels.length > 0 ? (
                  <AttributeValues
                    values={product.labels}
                    slugs={product.labelSlugs}
                    category="regulatory-labels"
                  />
                ) : (
                  <p className="product-attribute-empty">
                    <UnspecifiedAttribute />
                  </p>
                )}
              </div>
            </section>
          )}

          {!printOnly && (
            <div className="product-detail__actions">
              <Link href={requestProductHref} className="product-action">
                {copy.requestProduct}
              </Link>
              {product.brochureEnabled !== false && (
                <ProductBrochureButton slug={product.slug} />
              )}
            </div>
          )}

          {(showManufacturing || showCas) && (
            <section
              className="product-meta-table"
              aria-labelledby="product-information-title"
            >
              <h2 id="product-information-title">{copy.productInformation}</h2>
              <dl>
                {showManufacturing && (
                  <div>
                    <dt>{copy.manufacturingSite}</dt>
                    <dd>{product.manufacturingSite}</dd>
                  </div>
                )}
                {showCas && (
                  <div>
                    <dt>{copy.casNumber}</dt>
                    <dd>{product.casNumber}</dd>
                  </div>
                )}
              </dl>
            </section>
          )}
          {!printOnly && Boolean(product.resources?.length) && (
            <section className="product-related-resources">
              <h2>{copy.relatedResources}</h2>
              {product.resources?.map((r) => (
                <Link key={r.id} href={`/resource/${r.slug}`}>
                  {r.title}
                </Link>
              ))}
            </section>
          )}
          {printOnly && (
            <p className="product-pdf-revision">
              {draft ? "DRAFT — NOT FOR DISTRIBUTION · " : ""}Generated:{" "}
              {new Date().toISOString().slice(0, 10)} · Revision:{" "}
              {version?.slice(0, 16)}
            </p>
          )}
          {printOnly && (
            <ContactBannerContent
              section={contactBanner}
              pdf
              preserveProductCta
              contactHref={new URL(
                "/contact",
                process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:4173",
              ).toString()}
            />
          )}
        </article>
      </main>
      {!printOnly && <SiteFooter />}
    </>
  );
}

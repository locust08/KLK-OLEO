import { getPayload, type Where } from "payload";
import config from "@payload-config";
import Link from "next/link";
export const dynamic = "force-dynamic";
type Params = {
  q?: string;
  function?: string;
  formulation?: string;
  page?: string;
};
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const payload = await getPayload({ config });
  const sites = await payload.find({
    collection: "sites",
    where: { slug: { equals: "agrochemical" } },
    overrideAccess: false,
    depth: 0,
  });
  const site = sites.docs[0];
  if (!site)
    return (
      <main>
        <h1>Initialise the CMS before viewing products.</h1>
      </main>
    );
  const functions = await payload.find({
    collection: "product-functions",
    where: { site: { equals: site.id } },
    overrideAccess: false,
    limit: 100,
  });
  const formulations = await payload.find({
    collection: "formulation-types",
    where: { site: { equals: site.id } },
    overrideAccess: false,
    limit: 100,
  });
  const conditions: Where[] = [{ site: { equals: site.id } }];
  if (params.q)
    conditions.push({
      or: [
        { name: { like: params.q } },
        { chemicalDescription: { like: params.q } },
      ],
    });
  if (params.function)
    conditions.push({ functions: { in: [params.function] } });
  if (params.formulation)
    conditions.push({ formulationTypes: { in: [params.formulation] } });
  const products = await payload.find({
    collection: "products",
    where: { and: conditions },
    overrideAccess: false,
    depth: 1,
    sort: "name",
    page: Math.max(1, Number(params.page) || 1),
    limit: 24,
  });
  return (
    <>
      <header>
        <Link className="brand" href="/">
          KLK OLEO <span>Agrochemicals</span>
        </Link>
        <Link href="/admin">CMS login</Link>
      </header>
      <main>
        <p className="eyebrow">PRODUCT FINDER</p>
        <h1>Find your formulation partner.</h1>
        <form className="filters" method="get">
          <input
            name="q"
            placeholder="Product or chemistry"
            defaultValue={params.q}
          />
          <select name="function" defaultValue={params.function || ""}>
            <option value="">All functions</option>
            {functions.docs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <select name="formulation" defaultValue={params.formulation || ""}>
            <option value="">All formulations</option>
            {formulations.docs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button>Search</button>
        </form>
        <p>{products.totalDocs} published products</p>
        <div className="grid">
          {products.docs.map((product) => (
            <article key={product.id}>
              <span className="badge">{product.manufacturingRegion}</span>
              <h2>{product.name}</h2>
              <h3>{product.chemicalDescription}</h3>
              <p>{product.description}</p>
              <p>CAS: {product.casNumber || "Not specified"}</p>
            </article>
          ))}
        </div>
        {!products.totalDocs && (
          <p>
            Product information is being reviewed. Please contact the
            agrochemical team for assistance.
          </p>
        )}
        {products.hasNextPage && (
          <Link
            href={`?${new URLSearchParams({ ...params, page: String(products.nextPage) })}`}
          >
            Next page
          </Link>
        )}
      </main>
      <footer>
        <a href="https://www.klkoleo.com">Part of KLK OLEO</a>
      </footer>
    </>
  );
}

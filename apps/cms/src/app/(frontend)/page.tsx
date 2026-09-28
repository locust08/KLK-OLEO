import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
export const dynamic = "force-dynamic";
export default async function Home() {
  const payload = await getPayload({ config });
  const sites = await payload.find({
    collection: "sites",
    where: { slug: { equals: "agrochemical" } },
    overrideAccess: false,
    depth: 1,
  });
  const site = sites.docs[0];
  if (!site)
    return (
      <main>
        <h1>KLK OLEO CMS</h1>
        <p>Run the seed command to initialise the agrochemical minisite.</p>
        <Link href="/admin">Open CMS</Link>
      </main>
    );
  const resources = await payload.find({
    collection: "resources",
    where: { site: { equals: site.id } },
    overrideAccess: false,
    depth: 0,
  });
  const parent = typeof site.parentSite === "object" ? site.parentSite : null;
  return (
    <>
      <header>
        <Link className="brand" href="/">
          KLK OLEO <span>Agrochemicals</span>
        </Link>
        <nav>
          <Link href="/products">Products</Link>
          <a href="#resources">Resources</a>
          <Link href="/admin">CMS login</Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <p className="eyebrow">AIDIGRO · AGROCHEMICAL SOLUTIONS</p>
          <h1>Your trusted global partner in agrochemicals.</h1>
          <p>
            This preview connects to the shared KLK OLEO CMS. Publish reviewed
            product records to make them available in the catalogue.
          </p>
          <Link className="button" href="/products">
            Explore products
          </Link>
        </section>
        <section id="resources">
          <p className="eyebrow">RESOURCE LIBRARY</p>
          <h2>Materials for your formulations</h2>
          <div className="grid">
            {resources.docs.map((resource) => (
              <article key={resource.id}>
                <span className="badge">
                  {resource.placeholderLabel || "Coming soon"}
                </span>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <a href={parent?.domain || "https://www.klkoleo.com"}>
          {site.parentLinkLabel}
        </a>
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
      </footer>
    </>
  );
}

import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";
import { mapProduct, AGROCHEMICAL_SITE_SLUG } from "../cms/queries";
import { contentHash, PDF_TEMPLATE_VERSION, type PdfSnapshot } from "./version";

// Deliberately never use the development catalogue fallback or an authenticated preview.
export async function publishedPdfSource(slug: string): Promise<PdfSnapshot | null> {
  const payload = await getPayload({ config });
  const site = await payload.find({ collection: "sites", where: { and: [
    { slug: { equals: AGROCHEMICAL_SITE_SLUG } }, { active: { equals: true } },
  ] }, limit: 1, depth: 0, overrideAccess: false });
  if (!site.docs[0]) return null;
  const found = await payload.find({ collection: "products", where: { and: [
    { site: { equals: site.docs[0].id } }, { slug: { equals: slug } }, { _status: { equals: "published" } },
  ] }, limit: 1, depth: 1, draft: false, overrideAccess: false });
  const doc = found.docs[0];
  if (!doc) return null;
  const product = mapProduct(doc);
  if (product.imageUrl && doc.image && typeof doc.image === "object") {
    product.imageUrl += `${product.imageUrl.includes("?") ? "&" : "?"}pdfRevision=${encodeURIComponent(doc.image.updatedAt)}`;
  }
  const related = [...(doc.functions ?? []), ...(doc.formulationTypes ?? []), ...(doc.regulatoryLabels ?? []), doc.image];
  const revisions = [doc.updatedAt, ...related.flatMap((value) => value && typeof value === "object" ? [value.updatedAt] : [])];
  const revision = revisions.sort().at(-1)!;
  const version = await contentHash({ product, revisions, template: PDF_TEMPLATE_VERSION });
  return { productId: doc.id, slug: doc.slug, revision, version, templateVersion: PDF_TEMPLATE_VERSION, product };
}

export async function publishedPdfSlugs(page: number) {
  const payload = await getPayload({ config });
  const sites = await payload.find({ collection: "sites", where: { and: [
    { slug: { equals: AGROCHEMICAL_SITE_SLUG } }, { active: { equals: true } },
  ] }, limit: 1, depth: 0, overrideAccess: false });
  if (!sites.docs[0]) return { slugs: [], nextPage: null };
  const result = await payload.find({ collection: "products", where: { and: [
    { site: { equals: sites.docs[0].id } }, { _status: { equals: "published" } },
  ] }, limit: 100, page, depth: 0, draft: false, overrideAccess: false, sort: "id" });
  return { slugs: result.docs.map((product) => product.slug), nextPage: result.nextPage };
}

import type { CollectionAfterChangeHook } from "payload";
import { shouldSchedulePdf } from "./version";

async function pdfPlatform() {
  if (process.env.CMS_CLOUDFLARE !== "1") return null;
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  return (await getCloudflareContext({ async: true })).env;
}

export function createProductPdfPublishHook(platform = pdfPlatform): CollectionAfterChangeHook {
  return async ({ doc, req }) => {
  if (!shouldSchedulePdf(doc, req.query?.draft)) return doc;
  try {
    const env = await platform();
    if (!env) return doc;
    await env.D1.prepare(`UPDATE product_pdf_cache SET status='outdated', lease_token=NULL, lease_until=0,
      queued_until=0, updated_at=? WHERE product_id=?`).bind(Date.now(), doc.id).run();
    // Allow the publish transaction to commit before the consumer reads its public snapshot.
    await env.PRODUCT_PDF_QUEUE.send({ slug: doc.slug, revision: doc.updatedAt }, { delaySeconds: 5 });
  } catch (error) {
    req.payload.logger.error({ msg: "product_pdf_publish_schedule_failed; hourly reconciliation will retry", productId: doc.id, err: error });
  }
  return doc;
  };
}
export const schedulePublishedProductPdf = createProductPdfPublishHook();

// Taxonomy labels and media replacements can change the PDF without editing the product itself.
export const scheduleRelatedProductPdfs: CollectionAfterChangeHook = async ({ doc, req, collection }) => {
  if (process.env.CMS_CLOUDFLARE !== "1") return doc;
  if (collection.slug !== "media" && !shouldSchedulePdf(doc, req.query?.draft)) return doc;
  const fields: Record<string, string> = { "product-functions": "functions", "formulation-types": "formulationTypes", "regulatory-labels": "regulatoryLabels", media: "image" };
  const field = fields[collection.slug];
  if (!field) return doc;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    // Send compact paging jobs; the hourly sweep also repairs failures or related unpublishes/deletions.
    let page = 1;
    for (;;) {
      const products = await req.payload.find({ collection: "products", req, draft: false, overrideAccess: true,
        where: { and: [{ [field]: { equals: doc.id } }, { _status: { equals: "published" } }] }, depth: 0, limit: 100, page });
      if (products.docs.length) await env.PRODUCT_PDF_QUEUE.sendBatch(products.docs.map((product) => ({ body: { slug: product.slug }, delaySeconds: 5 })));
      if (!products.nextPage) break;
      page = products.nextPage;
    }
  } catch (error) {
    req.payload.logger.error({ msg: "product_pdf_related_schedule_failed", err: error });
  }
  return doc;
};

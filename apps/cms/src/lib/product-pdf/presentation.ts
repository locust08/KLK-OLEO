import "server-only";
import { getSiteChrome } from "../cms/queries";
import type { PdfSnapshot } from "./version";
export async function pdfPresentation(publishedOnly: boolean) {
  const site = await getSiteChrome({ publishedOnly });
  if (!site) throw Error("Site presentation unavailable");
  return { copy: site.copy, contactBanner: site.contactBanner };
}
export async function draftPdfSource(
  slug: string,
): Promise<PdfSnapshot | null> {
  const { editorialReadContext } = await import("../cms/preview");
  const context = await editorialReadContext();
  if (!context.draft || !context.user) return null;
  const { getProductBySlug } = await import("../cms/queries");
  const product = await getProductBySlug(slug);
  if (!product || product.brochureEnabled === false) return null;
  const presentation = await pdfPresentation(false);
  const { contentHash, PDF_TEMPLATE_VERSION } = await import("./version");
  const version = await contentHash({
    product,
    ...presentation,
    template: PDF_TEMPLATE_VERSION,
  });
  return {
    productId: product.id,
    slug,
    product,
    ...presentation,
    draft: true,
    revision: version,
    version,
    templateVersion: PDF_TEMPLATE_VERSION,
  };
}

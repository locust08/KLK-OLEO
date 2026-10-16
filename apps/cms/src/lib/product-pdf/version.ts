import type { ProductViewModel } from "../cms/view-models";

// Build script fingerprints the shared component, page styles and fonts.
export const PDF_TEMPLATE_VERSION =
  process.env.NEXT_PUBLIC_PRODUCT_PDF_TEMPLATE_VERSION || "product-a4-v1";
export type PdfSnapshot = {
  productId: number;
  slug: string;
  revision: string;
  version: string;
  templateVersion: string;
  product: ProductViewModel;
  copy?: import("../content/presentation").InterfaceCopy;
  contactBanner?: import("../content/model").EditorialSection;
  draft?: boolean;
};

export async function contentHash(value: unknown) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(value)),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function pdfFilename(slug: string) {
  return `${slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 140) || "product"}.pdf`;
}

export function shouldSchedulePdf(doc: { _status?: string }, draft: unknown) {
  return doc._status === "published" && draft !== true && draft !== "true";
}

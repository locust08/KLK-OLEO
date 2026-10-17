import { getProductBySlug, getSiteChrome } from "@/lib/cms/queries";
import { editorialReadContext } from "@/lib/cms/preview";
import { generateProductPdf } from "@/lib/content/product-brochure";
async function asset(path: string, request: Request): Promise<Uint8Array> {
  const url = new URL(path, request.url);
  if (url.origin !== new URL(request.url).origin)
    throw Error("Unsupported asset origin");
  if (process.env.CMS_CLOUDFLARE === "1") {
    if (url.pathname.startsWith("/fonts/")) {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const { env } = await getCloudflareContext({ async: true });
      if (!env.ASSETS) throw Error("Static assets unavailable");
      const response = await env.ASSETS.fetch(url);
      if (!response.ok) throw Error("Font unavailable");
      return new Uint8Array(await response.arrayBuffer());
    }
  } else if (url.pathname.startsWith("/fonts/")) {
    const { readFile } = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    return new Uint8Array(
      await readFile(resolve("public", url.pathname.slice(1))),
    );
  }
  if (!url.pathname.startsWith("/api/media/file/"))
    throw Error("Unsupported brochure asset");
  const response = await fetch(url, {
    headers: {
      origin: url.origin,
      cookie: request.headers.get("cookie") || "",
      ...(request.headers.get("authorization")
        ? { authorization: request.headers.get("authorization")! }
        : {}),
    },
    redirect: "manual",
    cache: "no-store",
  });
  if (!response.ok) throw Error("Image unavailable");
  const size = Number(response.headers.get("content-length"));
  if (size > 8 * 1024 * 1024) throw Error("Image too large");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 8 * 1024 * 1024) throw Error("Image too large");
  return bytes;
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product || product.brochureEnabled === false)
      return new Response("Brochure unavailable", { status: 404 });
    if(process.env.CMS_CLOUDFLARE==="1"){
      const {getCloudflareContext}=await import('@opennextjs/cloudflare');const {env}=await getCloudflareContext({async:true});const {draft,user}=await editorialReadContext();const {downloadProductPdf,renderProductPdf}=await import('@/lib/product-pdf/worker');
      if(!draft||!user)return downloadProductPdf(request,env,slug);
      const {draftPdfSource}=await import('@/lib/product-pdf/presentation');const snapshot=await draftPdfSource(slug);if(!snapshot)return new Response('Brochure unavailable',{status:404});
      const bytes=await renderProductPdf(env,snapshot,{cookie:request.headers.get('cookie')||'',origin:new URL(request.url).origin,...(request.headers.get('authorization')?{authorization:request.headers.get('authorization')!}:{})});
      const filename=product.name.replace(/[^a-zA-Z0-9_-]+/g,'-');return new Response(bytes as Uint8Array<ArrayBuffer>,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="DRAFT-${filename}.pdf"`,'Cache-Control':'private, no-store'}});
    }
    const site = await getSiteChrome();
    if (!site) return new Response("Brochure unavailable", { status: 503 });
    if (product.imageUrl && !product.pdfImageUrl)
      return new Response(
        "The brochure image is being prepared. Please try again later.",
        { status: 503 },
      );
    const [regularFont, boldFont, imageBytes] = await Promise.all([
      asset("/fonts/poppins-400.ttf", request),
      asset("/fonts/poppins-600.ttf", request),
      product.pdfImageUrl ? asset(product.pdfImageUrl, request) : undefined,
    ]);
    const { draft } = await editorialReadContext();
    const bytes = await generateProductPdf(product, {
      regularFont,
      boldFont,
      imageBytes,
      draft,
      labels: site.copy,
    });
    const filename =
      product.name.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 100) || "product";
    return new Response(bytes as Uint8Array<ArrayBuffer>, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${draft ? "DRAFT-" : ""}${filename}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Product brochure generation failed", error);
    return new Response(
      "We could not generate the brochure. Please try again.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

import { publishedPdfSlugs } from "@/lib/product-pdf/published";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const page = Math.max(1, Number.parseInt(new URL(request.url).searchParams.get("page") || "1", 10) || 1);
  try {
    return Response.json(await publishedPdfSlugs(page), { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
  } catch {
    return Response.json({ error: "Products temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

import { publishedPdfSource } from "@/lib/product-pdf/published";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };
  try {
    const snapshot = await publishedPdfSource((await params).slug);
    return Response.json(snapshot, { status: snapshot ? 200 : 404, headers });
  } catch {
    return Response.json({ error: "Product temporarily unavailable." }, { status: 503, headers });
  }
}

// Production requests are intercepted by cloudflare-worker.ts. Plain `next dev`
// has no Browser/D1/Queue bindings and must never fabricate a brochure from fixture data.
export async function GET() {
  return Response.json({ message: "Brochure downloads are temporarily unavailable in this environment." }, {
    status: 503, headers: { "Cache-Control": "private, no-store" },
  });
}

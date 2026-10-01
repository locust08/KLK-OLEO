import { notFound, permanentRedirect } from "next/navigation";

const legacyResources: Record<string, string> = {
  "agrochemicals-brochure": "Agrochemicals Brochure",
  "abim-2025-leaflet": "ABIM 2025 Leaflet",
  "abim-2025-poster": "ABIM 2025 Poster",
  "aidigro-pn123-leaflet": "Aidigro PN123 Leaflet",
  "aidigro-sv-leaflet": "Aidigro SV Leaflet",
};

export default async function LegacyResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = legacyResources[slug];
  if (!title) notFound();

  permanentRedirect(`/contact?resource=${encodeURIComponent(title)}#contact-form`);
}

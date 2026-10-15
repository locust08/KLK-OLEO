import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";
import { publishedPdfSource } from "@/lib/product-pdf/published";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function PrintPage({ params }: { params: Promise<{ product: string }> }) {
  const snapshot = await publishedPdfSource((await params).product);
  if (!snapshot) notFound();
  return <div data-pdf-version={snapshot.version}><ProductDetailPage product={snapshot.product} printOnly /></div>;
}

import { contentMetadata } from "@/lib/content/seo";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";
import {
  getProductBySlug,
  getSiteChrome,
  getRedirectProduct,
} from "@/lib/cms/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    const destination = await getRedirectProduct(slug);
    if (destination) permanentRedirect(`/products/product/${destination}`);
    notFound();
  }
  const site = await getSiteChrome();
  return <ProductDetailPage product={product} copy={site?.copy ?? {}} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product } = await params;
  return contentMetadata(
    await getProductBySlug(product),
    `/products/product/${product}`,
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  );
}

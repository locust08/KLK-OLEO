import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";
import { getProductBySlug } from "@/lib/cms/queries";

export default async function Page({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  const { product: slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailPage product={product} />;
}

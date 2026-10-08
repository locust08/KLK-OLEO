import { notFound } from "next/navigation";
import { getProductCategory } from "@/lib/product-catalog";
import { ProductsPrototypeDetail } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductsPrototype";

export function generateStaticParams() {
  return getProductCategory("fatty-acids")!.products.filter(product => product.slug !== "palmera").map(product => ({ product: product.slug }));
}

export default async function FattyAcidFamilyPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  if (!getProductCategory("fatty-acids")?.products.some(item => item.slug === product)) notFound();
  return <ProductsPrototypeDetail productSlug={product} />;
}

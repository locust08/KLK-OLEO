import { notFound } from "next/navigation";
import { getProductCategory, productCategories } from "@/lib/product-catalog";
import { ProductsPrototypeDetail } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductsPrototype";

export function generateStaticParams() {
  return productCategories.filter(category => category.slug !== "fatty-acids").flatMap(category => category.products.map(product => ({ category: category.slug, product: product.slug })));
}

export default async function ProductFamilyPage({ params }: { params: Promise<{ category: string; product: string }> }) {
  const { category, product } = await params;
  if (!getProductCategory(category)?.products.some(item => item.slug === product)) notFound();
  return <ProductsPrototypeDetail categorySlug={category} productSlug={product} />;
}

import { notFound } from "next/navigation";
import { getProductCategory, productCategories } from "@/lib/product-catalog";
import { ProductsPrototypeListing } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductsPrototype";

export function generateStaticParams() {
  return productCategories.filter(category => category.slug !== "fatty-acids").map(category => ({ category: category.slug }));
}

export default async function ProductCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!getProductCategory(category)) notFound();
  return <ProductsPrototypeListing categorySlug={category} />;
}

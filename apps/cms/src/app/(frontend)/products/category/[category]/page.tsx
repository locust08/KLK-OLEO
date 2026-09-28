import { notFound } from "next/navigation";
import { ProductCategoryPage } from "@/components/products/ProductCategoryPage";
import { getProductCatalog } from "@/lib/cms/queries";
import { isProductCategoryKey } from "@/lib/cms/view-models";

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isProductCategoryKey(category)) notFound();
  const catalog = await getProductCatalog();
  return <ProductCategoryPage category={category} {...catalog} />;
}

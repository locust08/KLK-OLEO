import { notFound } from "next/navigation";
import { ProductCategoryPage } from "@/components/products/ProductCategoryPage";
import { getProductCatalog, getPageContent } from "@/lib/cms/queries";
import { isProductCategoryKey } from "@/lib/cms/view-models";

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isProductCategoryKey(category)) notFound();
  const catalog = await getProductCatalog();
  return (
    <ProductCategoryPage
      category={category}
      {...catalog}
      page={await getPageContent("products")}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const catalog = await getProductCatalog();
  if (!isProductCategoryKey(category)) return {};
  return {
    title: catalog.groups[category].label,
    description: catalog.groups[category].description,
  };
}

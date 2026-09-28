import { ProductsPage } from "@/components/products/ProductsPage";
import { getPageContent, getProductCatalog } from "@/lib/cms/queries";

export default async function Page() {
  const [catalog, page] = await Promise.all([
    getProductCatalog(),
    getPageContent("products"),
  ]);
  return <ProductsPage {...catalog} page={page} />;
}

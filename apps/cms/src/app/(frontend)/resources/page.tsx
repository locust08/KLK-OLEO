import { ResourcesPage } from "@/components/resources/ResourcesPage";
import { getPageContent, getResources } from "@/lib/cms/queries";

export default async function Page() {
  const [page, resources] = await Promise.all([
    getPageContent("resources"),
    getResources(),
  ]);
  return <ResourcesPage page={page} resources={resources} />;
}

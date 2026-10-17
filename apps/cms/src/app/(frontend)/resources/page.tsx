import { pageMetadata } from "@/lib/cms/metadata";
import { ResourcesPage } from "@/components/resources/ResourcesPage";
import {
  getContactForm,
  getPageContent,
  getResources,
} from "@/lib/cms/queries";
import { agrochemicalResourceDelivery } from "@/lib/resource-delivery";

export default async function Page() {
  const [page, resources, form] = await Promise.all([
    getPageContent("resources"),
    getResources(),
    getContactForm(agrochemicalResourceDelivery.formSlug, false),
  ]);
  return <ResourcesPage page={page} resources={resources} form={form} />;
}

export async function generateMetadata() {
  return pageMetadata("resources", "/resources");
}

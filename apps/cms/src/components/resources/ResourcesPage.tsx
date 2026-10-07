import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { ResourceListing } from "./ResourceListing";
import type { ContactFormViewModel, PageContentViewModel, ResourceViewModel } from "@/lib/cms/view-models";

// TEMPORARY AI-generated introduction; replace in Resources Page > Sections in CMS.
const placeholderIntroduction = {
  heading: "Knowledge to support your formulations",
  body: "Explore technical insights and product resources for agrochemical formulation. Request the materials you need, and our team will help you find the right information for your application.",
};

export function ResourcesPage({ page, resources, form }: {
  page: PageContentViewModel | null; resources: ResourceViewModel[];
  form: ContactFormViewModel | null;
}) {
  const introduction = page?.sections[0];
  return <>
    <SiteHeader />
    <main>
      {/* Banner replacement: CMS Pages > Resources > Hero image, with existing asset fallback. */}
      <PageHero title={page?.heroHeading || page?.title || "Resources"} kind="resources" imageUrl={page?.heroImageUrl} />
      <section className="catalog-intro" aria-label="Resources introduction" data-content-status={introduction?.body ? "cms" : "temporary-placeholder"}>
        <h2>{introduction?.heading || placeholderIntroduction.heading}</h2>
        <p>{introduction?.body || placeholderIntroduction.body}</p>
      </section>
      <ResourceListing resources={resources} form={form} />
    </main>
    <SiteFooter />
  </>;
}

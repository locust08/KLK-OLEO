import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import { ResourceListing } from "./ResourceListing";
import type {
  ContactFormViewModel,
  PageContentViewModel,
  ResourceViewModel,
} from "@/lib/cms/view-models";

export function ResourcesPage({
  page,
  resources,
  form,
}: {
  page: PageContentViewModel | null;
  resources: ResourceViewModel[];
  form: ContactFormViewModel | null;
}) {
  if (!page) return null;
  const introduction = page.content.introduction;
  return (
    <>
      <SiteHeader />
      <main>
        {/* Banner replacement: CMS Pages > Resources > Hero image, with existing asset fallback. */}
        <PageHero
          title={page.heroHeading || page.title}
          kind="resources"
          image={page.heroImage}
        />
        <section className="catalog-intro" aria-label="Resources introduction">
          <h2>{introduction?.heading}</h2>
          <p>{introduction?.body}</p>
        </section>
        <ResourceListing resources={resources} form={form} />
      </main>
      <SiteFooter />
    </>
  );
}

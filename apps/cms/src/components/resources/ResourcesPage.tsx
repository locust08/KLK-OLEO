import Image from "next/image";
import Link from "next/link";
import { FaAnglesRight } from "react-icons/fa6";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import type { PageContentViewModel, ResourceViewModel } from "@/lib/cms/view-models";

const fallbackImages = [
  "/images/about/sustainable-formulation-solutions.webp",
  "/images/home/aidigro-introduction.webp",
  "/images/about/agriculture-solutions.png",
  "/images/home/comprehensive-portfolio.png",
] as const;

export function ResourcesPage({
  page,
  resources,
}: {
  page: PageContentViewModel | null;
  resources: ResourceViewModel[];
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero title={page?.heroHeading || page?.title || "Resources"} kind="resources" imageUrl={page?.heroImageUrl} />
        <section className="resource-section" aria-label="Available resources">
          <div className="resource-grid">
            {resources.map((resource, index) => (
              <article className="resource-card" key={resource.title}>
                <div className="resource-card__preview">
                  <Image
                    src={resource.imageUrl || fallbackImages[index % fallbackImages.length]}
                    fill
                    sizes="(max-width: 767px) 100vw, 46vw"
                    alt={`${resource.title} document preview`}
                  />
                </div>
                <div className="resource-card__body">
                  <h2>{resource.title}</h2>
                  {resource.fileUrl ? (
                    <a className="resource-card__action" href={resource.fileUrl} target="_blank" rel="noreferrer">
                      <span>Download</span><FaAnglesRight aria-hidden="true" />
                    </a>
                  ) : resource.availability === "placeholder" ? (
                    <span className="resource-card__action resource-card__action--disabled">
                      <span>{resource.placeholderLabel}</span>
                    </span>
                  ) : (
                    <Link
                      href={`/contact?resource=${encodeURIComponent(resource.title)}#contact-form`}
                      className="resource-card__action"
                      aria-label={`Request ${resource.title}`}
                    >
                      <span>{resource.placeholderLabel || "Request"}</span>
                      <FaAnglesRight aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </article>
            ))}
            {!resources.length && (
              <div className="catalog-empty">
                <h2>Resources are being prepared.</h2>
                <p>Please contact our team for the latest approved materials.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { FaAnglesRight, FaFilePdf } from "react-icons/fa6";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageHero } from "@/components/ui/PageHero";
import type { PageContentViewModel, ResourceViewModel } from "@/lib/cms/view-models";

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
            {resources.map((resource) => (
              <article className="resource-card" key={resource.id}>
                <div className="resource-card__preview">
                  {resource.imageUrl ? <Image
                    src={resource.imageUrl}
                    fill
                    unoptimized
                    sizes="(max-width: 767px) 100vw, (max-width: 900px) 50vw, (max-width: 1199px) 33vw, 25vw"
                    alt={resource.imageAlt || `${resource.title} document cover`}
                  /> : <div className="resource-card__no-preview">
                    <FaFilePdf aria-hidden="true" />
                    <span>Document preview unavailable</span>
                  </div>}
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

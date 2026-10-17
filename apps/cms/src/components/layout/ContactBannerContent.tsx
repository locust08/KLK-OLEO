import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextCta } from "@/components/ui/TextCta";
import { imageBackground } from "@/components/ui/EditorialMedia";
import type { EditorialSection } from "@/lib/content/model";
export function ContactBannerContent({
  section,
  preserveProductCta,
  pdf = false,
  contactHref,
}: {
  section?: EditorialSection;
  preserveProductCta: boolean;
  pdf?: boolean;
  contactHref?: string;
}) {
  if (!section?.enabled) return null;
  return (
    <section
      className={`contact-cta contact-cta--image${pdf ? " product-pdf-contact" : ""}`}
      aria-labelledby="contact-banner-title"
      style={imageBackground(section.image)}
    >
      <div className="contact-cta__content" data-reveal="up">
        <p className="eyebrow">{section.eyebrow}</p>
        <h2 id="contact-banner-title">{section.heading}</h2>
        <p className="contact-cta__message">{section.body}</p>
        {section.ctaPath &&
          (preserveProductCta ? (
            <PrimaryButton href={contactHref || section.ctaPath}>
              {section.ctaLabel}
            </PrimaryButton>
          ) : (
            <TextCta href={contactHref || section.ctaPath}>
              {section.ctaLabel}
            </TextCta>
          ))}
      </div>
    </section>
  );
}

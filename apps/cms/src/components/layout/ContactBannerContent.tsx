import { FaAnglesRight } from "react-icons/fa6";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextCta } from "@/components/ui/TextCta";
import { siteAssets } from "@/data/site-assets";

// Shared markup for the website banner and its PDF presentation.
export function ContactBannerContent({ preserveProductCta, pdf = false, contactHref = "/contact" }: {
  preserveProductCta: boolean; pdf?: boolean; contactHref?: string;
}) {
  return <section className={`contact-cta contact-cta--image${pdf ? " product-pdf-contact" : ""}`} aria-labelledby="contact-banner-title" style={{ backgroundImage: `url(${siteAssets.contactBackground})` }}>
    <div className="contact-cta__content" data-reveal="up">
      <p className="eyebrow">Contact Us</p>
      <h2 id="contact-banner-title">Still Can&apos;t Find What You&apos;re Looking For?</h2>
      <p className="contact-cta__message">Contact our team and we’ll help you identify the right solution.</p>
      {preserveProductCta
        ? <PrimaryButton href={contactHref}>Contact Us <FaAnglesRight aria-hidden="true" /></PrimaryButton>
        : <TextCta href={contactHref}>Contact Us</TextCta>}
    </div>
  </section>;
}

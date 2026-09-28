"use client";

import { FormEvent, useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useSite } from "@/components/layout/SiteContext";
import { PageHero } from "@/components/ui/PageHero";
import type {
  ContactFormViewModel,
  PageContentViewModel,
} from "@/lib/cms/view-models";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export function ContactPage({
  page,
  form,
}: {
  page: PageContentViewModel | null;
  form: ContactFormViewModel | null;
}) {
  const site = useSite();
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SubmissionState>("idle");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("resource") || params.get("product");
    if (!requested) return;
    const frame = window.requestAnimationFrame(() => {
      setMessage(`I would like to enquire about ${requested}.`);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || state === "submitting") return;

    const element = event.currentTarget;
    const values = new FormData(element);
    const productId = new URLSearchParams(window.location.search).get("productId") || undefined;
    setState("submitting");
    setFeedback("");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSlug: "agrochemical",
          formSlug: form.slug,
          firstName: String(values.get("firstName") || ""),
          lastName: String(values.get("lastName") || ""),
          company: String(values.get("company") || ""),
          country: String(values.get("country") || ""),
          email: String(values.get("email") || ""),
          message: String(values.get("message") || ""),
          productId,
          consent: values.get("consent") === "on",
          idempotencyKey: crypto.randomUUID(),
          website: String(values.get("website") || ""),
        }),
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;
      if (!response.ok) {
        throw new Error(result?.error || "We could not submit your enquiry.");
      }
      setFeedback(result?.message || form.successMessage);
      setState("success");
      element.reset();
      setMessage("");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "We could not submit your enquiry. Please try again.",
      );
      setState("error");
    }
  }

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero title={page?.heroHeading || page?.title || "Contact Us"} imageUrl={page?.heroImageUrl} />
        <section className="contact-section" id="contact-form">
          <div className="contact-copy">
            <h2>Get in Touch with Our Team</h2>
            <p>{page?.heroBody || "If you wish to enquire about KLK OLEO Agrochemicals products, please complete the short form provided. Our team will be in contact with you shortly."}</p>
            <a className="contact-email" href={`mailto:${site.contactEmail}`}>
              <span className="contact-email__icon"><MdEmail aria-hidden="true" /></span>
              <span>{site.contactEmail}</span>
            </a>
          </div>
          {!form ? (
            <div className="contact-form-success" role="status">
              <h2>Online enquiries are being prepared.</h2>
              <p>Please email our team while the enquiry form is awaiting publication.</p>
            </div>
          ) : state === "success" ? (
            <div className="contact-form-success" role="status">
              <h2>Thank you for your request.</h2>
              <p>{feedback}</p>
              <button type="button" onClick={() => setState("idle")}>Send another enquiry</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>First Name <span aria-hidden="true">*</span><input name="firstName" autoComplete="given-name" required /></label>
              <label>Last Name<input name="lastName" autoComplete="family-name" /></label>
              <label>Company Name<input name="company" autoComplete="organization" /></label>
              <label>Email <span aria-hidden="true">*</span><input type="email" name="email" autoComplete="email" required /></label>
              <label className="contact-form__full">Country<select name="country" defaultValue=""><option value="">Select Country</option><option>Afghanistan</option><option>Malaysia</option><option>Singapore</option></select></label>
              <label className="contact-form__full">Message <span aria-hidden="true">*</span><textarea name="message" value={message} onChange={(event) => setMessage(event.target.value)} required /></label>
              <label className="contact-form__full contact-consent"><input type="checkbox" name="consent" required /><span>{form.consentLabel}</span></label>
              <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              {state === "error" && <p className="contact-form__full form-error" role="alert">{feedback}</p>}
              <button type="submit" disabled={state === "submitting"}>{state === "submitting" ? "Submitting…" : "Submit"}</button>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

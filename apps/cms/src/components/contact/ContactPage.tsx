"use client";

import { FormEvent, useEffect, useState } from "react";
import { MdEmail } from "react-icons/md";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useSite } from "@/components/layout/SiteContext";
import { PageHero } from "@/components/ui/PageHero";
import { countries } from "@/data/countries";
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
  const copy = site.copy;
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

  useEffect(() => {
    const panel = document.querySelector<HTMLElement>(".contact-form-reveal");
    if (!panel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        panel.classList.add("is-visible");
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, [state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || state === "submitting") return;

    const element = event.currentTarget;
    const values = new FormData(element);
    const productId =
      new URLSearchParams(window.location.search).get("productId") || undefined;
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
          jobPosition: String(values.get("jobPosition") || ""),
          companyWebsite: String(values.get("companyWebsite") || ""),
          country: String(values.get("country") || ""),
          email: String(values.get("email") || ""),
          message: String(values.get("message") || ""),
          productId,
          consent: values.get("consent") === "on",
          idempotencyKey: crypto.randomUUID(),
          website: String(values.get("website") || ""),
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
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
        <PageHero
          title={page?.heroHeading || page?.title || ""}
          image={page?.heroImage}
        />
        <section className="contact-section" id="contact-form">
          <div className="contact-copy">
            <h2>{page?.content.introduction?.heading}</h2>
            <p>
              {form
                ? page?.content.introduction?.body
                : copy.contactUnavailableBody}
            </p>
            <a className="contact-email" href={`mailto:${site.contactEmail}`}>
              <span className="contact-email__icon">
                <MdEmail aria-hidden="true" />
              </span>
              <span>{site.contactEmail}</span>
            </a>
          </div>
          {!form ? (
            <div
              className="contact-form-success contact-form-reveal"
              role="status"
            >
              <h2>{copy.contactUnavailableHeading}</h2>
              <p>{copy.contactUnavailableBody}</p>
            </div>
          ) : state === "success" ? (
            <div
              className="contact-form-success contact-form-reveal"
              role="status"
            >
              <h2>{copy.contactSuccessHeading}</h2>
              <p>{feedback}</p>
              <button type="button" onClick={() => setState("idle")}>
                {copy.anotherEnquiry}
              </button>
            </div>
          ) : (
            <form
              className="contact-form contact-form-reveal"
              onSubmit={handleSubmit}
            >
              <label>
                {copy.firstName} <span aria-hidden="true">*</span>
                <input name="firstName" autoComplete="given-name" required />
              </label>
              <label>
                {copy.lastName}
                <input name="lastName" autoComplete="family-name" />
              </label>
              <label>
                {copy.company}
                <input name="company" autoComplete="organization" />
              </label>
              <label>
                {copy.jobPosition} <span aria-hidden="true">*</span>
                <input
                  name="jobPosition"
                  autoComplete="organization-title"
                  required
                />
              </label>
              <label className="contact-form__full">
                {copy.country} <span aria-hidden="true">*</span>
                <select name="country" defaultValue="" required>
                  <option value="">{copy.selectCountry}</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {copy.email} <span aria-hidden="true">*</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                {copy.companyWebsite}
                <input
                  name="companyWebsite"
                  type="url"
                  autoComplete="url"
                  placeholder="https://"
                />
              </label>
              <label className="contact-form__full">
                {copy.message} <span aria-hidden="true">*</span>
                <textarea
                  name="message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                />
              </label>
              <label className="contact-form__full contact-consent">
                <input type="checkbox" name="consent" required />
                <span>{form.consentLabel}</span>
              </label>
              <label className="contact-honeypot" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              {state === "error" && (
                <p className="contact-form__full form-error" role="alert">
                  {feedback}
                </p>
              )}
              <button type="submit" disabled={state === "submitting"}>
                {state === "submitting" ? copy.submitting : copy.submit}
              </button>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { countries } from "@/data/countries";
import { useSite } from "@/components/layout/SiteContext";
import type { ContactFormViewModel, ResourceViewModel } from "@/lib/cms/view-models";
import { agrochemicalResourceDelivery } from "@/lib/resource-delivery";
import styles from "./Resources.module.css";

export function ResourceRequestForm({ resource, form, onClose }: {
  resource: ResourceViewModel; form: ContactFormViewModel | null; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const requestKey = useRef<string | null>(null);
  const titleId = useId();
  const site = useSite();
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previousOverflow; trigger?.focus(); };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form || state === "submitting") return;
    const values = new FormData(event.currentTarget);
    requestKey.current ||= crypto.randomUUID();
    setState("submitting"); setFeedback("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSlug: "agrochemical", formSlug: form.slug,
          firstName: String(values.get("firstName") || ""), company: String(values.get("company") || ""),
          email: String(values.get("email") || ""), phone: String(values.get("phone") || ""),
          country: String(values.get("country") || ""), message: String(values.get("message") || ""),
          resourceId: resource.id, sourceURL: window.location.href,
          consent: values.get("consent") === "on", website: String(values.get("website") || ""),
          idempotencyKey: requestKey.current,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "We could not submit your request. Please try again.");
      setFeedback(result?.message || agrochemicalResourceDelivery.successMessage);
      setState("success");
    } catch (error) { setFeedback(error instanceof Error ? error.message : "Please try again later."); setState("error"); }
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button type="button" className={styles.close} onClick={onClose} aria-label="Close resource request">×</button>
    {state === "success" ? <div className="contact-form-success" role="status"><h2 id={titleId}>Thank you for your enquiry.</h2><p>{feedback}</p><button type="button" onClick={onClose}>Return to Resources</button></div> : <>
      <h2 id={titleId}>Request a resource</h2><p className={styles.formIntro}>Complete your details and our sales team will follow up with you.</p>
      {!form ? <p role="status">Online requests are temporarily unavailable. Please contact <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</p> :
        <form className={`contact-form ${styles.form}`} onSubmit={submit}>
          <label className="contact-form__full">Requested Resource<input name="requestedResource" readOnly value={resource.title} /></label>
          <label>Full Name <span aria-hidden="true">*</span><input name="firstName" autoComplete="name" required maxLength={100} /></label>
          <label>Company <span aria-hidden="true">*</span><input name="company" autoComplete="organization" required maxLength={200} /></label>
          <label>Email <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>Phone / Contact Number <span aria-hidden="true">*</span><input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={50} pattern={"[+0-9\\(\\) .\\-]{7,50}"} /></label>
          <label className="contact-form__full">Country <span aria-hidden="true">*</span><select name="country" autoComplete="country-name" required defaultValue=""><option value="">Select Country</option>{countries.map(country => <option key={country}>{country}</option>)}</select></label>
          <label className="contact-form__full">Message (optional)<textarea name="message" maxLength={4000} /></label>
          <label className="contact-form__full contact-consent"><input type="checkbox" name="consent" required /><span>{form.consentLabel}</span></label>
          <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label>
          {state === "error" && <p role="alert" className="contact-form__full form-error">{feedback}</p>}
          <button type="submit" disabled={state === "submitting"}>{state === "submitting" ? "Submitting…" : "Submit request"}</button>
        </form>}
    </>}
  </dialog>;
}

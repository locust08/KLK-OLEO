"use client";

import { useState } from "react";
import Link from "next/link";
import options from "@/lib/generated/enquiry-options.json";

const fieldClass = "mt-2 min-h-12 w-full min-w-0 rounded-sm border border-klk-border bg-white px-4 py-3 text-base text-klk-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klk-lime";
const offices = [
  { label: "China", email: "info.china@klkoleo.com" },
  { label: "Europe", email: "info.europe@klkoleo.com" },
  { label: "Americas", email: "info.americas@klkoleo.com" },
  { label: "India", email: "info.india@klkoleo.com" },
];

export function EnquiryForm({ requestedProduct = "" }: { requestedProduct?: string }) {
  const [draft, setDraft] = useState("");
  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = [...form.entries()].filter(([key]) => key !== "consent" && key !== "office").map(([key, value]) => `${key}: ${value}`).join("\n\n");
    setDraft(`mailto:${form.get("office")}?subject=${encodeURIComponent(`Product Enquiry — ${form.get("Product")}`)}&body=${encodeURIComponent(body)}`);
  }
  return <section className="klk-section bg-klk-surface"><div className="klk-container max-w-[65rem]">
    <h2 className="klk-h2 text-klk-primary">How Can We Help You?</h2>
    <p className="klk-body mt-5 text-klk-text-secondary">Select your product and tell us about your requirements. Prepare an email to a regional sales office, or use the <Link href="https://www.klkoleo.com/product-enquiry/" className="text-klk-primary underline">official enquiry form</Link> for other regions.</p>
    <form onSubmit={prepare} onChange={() => setDraft("")} className="mt-8 rounded-md bg-white p-5 shadow-klk sm:p-8">
      <div className="grid min-w-0 gap-6 sm:grid-cols-2">
        {requestedProduct && <label className="klk-body-small min-w-0 font-semibold sm:col-span-2">Requested Ingredient<input name="Requested Ingredient" defaultValue={requestedProduct} maxLength={200} className={fieldClass} /></label>}
        <label className="klk-body-small min-w-0 font-semibold sm:col-span-2">Product *<select aria-label="Product" name="Product" required defaultValue="" className={fieldClass}><option value="" disabled>Select Product</option>{options["product-group"].map(item => <option key={item}>{item}</option>)}</select></label>
        {[{ name: "Name", type: "text", autoComplete: "name" }, { name: "Email", type: "email", autoComplete: "email" }, { name: "Company", type: "text", autoComplete: "organization" }].map(field => <label key={field.name} className="klk-body-small min-w-0 font-semibold">{field.name} *<input name={field.name} type={field.type} autoComplete={field.autoComplete} required maxLength={200} className={fieldClass} /></label>)}
        <label className="klk-body-small min-w-0 font-semibold">Nature of Business *<select aria-label="Nature of Business" name="Nature of Business" required defaultValue="" className={fieldClass}><option value="" disabled>Select Nature of Business</option>{options["nature-of-business"].map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="klk-body-small min-w-0 font-semibold">Country *<select aria-label="Country" name="Country" required defaultValue="" className={fieldClass}><option value="" disabled>Select Country</option>{options.country.map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="klk-body-small min-w-0 font-semibold">How Do You Know Us? *<select aria-label="How Do You Know Us" name="How Do You Know Us" required defaultValue="" className={fieldClass}><option value="" disabled>Select an Option</option>{options["know-us"].map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="klk-body-small min-w-0 font-semibold sm:col-span-2">Regional Sales Office *<select aria-label="Regional Sales Office" name="office" required defaultValue="" className={fieldClass}><option value="" disabled>Select Sales Office</option>{offices.map(office => <option key={office.email} value={office.email}>{office.label}</option>)}</select></label>
        <label className="klk-body-small min-w-0 font-semibold sm:col-span-2">Message *<textarea name="Message" required maxLength={4000} rows={6} className={fieldClass} /></label>
      </div>
      <label className="klk-body-small mt-6 flex items-start gap-3"><input name="consent" type="checkbox" required className="mt-1 size-5 shrink-0 accent-klk-primary" /><span>I have read the <Link href="/privacy-policy" className="text-klk-primary underline">Personal Data Notice Statement</Link> and consent to providing my details for this enquiry.</span></label>
      <p className="klk-caption mt-4 text-klk-text-secondary">This form prepares an email. Your enquiry is sent only when you send it from your email application.</p>
      <button type="submit" className="klk-button mt-6 min-h-12 rounded-sm bg-klk-primary px-6 py-3 text-white hover:bg-klk-darker">PREPARE ENQUIRY</button>
      {draft && <div role="status" className="mt-6 rounded-sm bg-klk-surface p-5"><p className="klk-body-small">Your enquiry is ready to review in your email application.</p><a href={draft} className="klk-button mt-4 inline-block rounded-sm bg-klk-primary px-6 py-3 text-white">OPEN EMAIL DRAFT</a></div>}
    </form>
  </div></section>;
}

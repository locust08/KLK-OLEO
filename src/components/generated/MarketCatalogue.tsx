"use client";

import { useState } from "react";
import Link from "next/link";

export interface MarketIngredient {
  name: string;
  description: string;
  inci?: string;
  functionalities: string[];
  applications: string[];
  source: string;
}

export function MarketCatalogue({ ingredients }: { ingredients: MarketIngredient[] }) {
  const [query, setQuery] = useState("");
  const [functionality, setFunctionality] = useState("");
  const [application, setApplication] = useState("");
  const [page, setPage] = useState(1);
  const functionalities = [...new Set(ingredients.flatMap(item => item.functionalities))].sort();
  const applications = [...new Set(ingredients.flatMap(item => item.applications))].sort();
  const filtered = ingredients.filter(item => (!functionality || item.functionalities.includes(functionality)) && (!application || item.applications.includes(application)) && `${item.name} ${item.inci || ""} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const fieldClass = "mt-2 min-h-12 w-full min-w-0 rounded-sm border border-klk-border bg-white px-3 py-3 text-base text-klk-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klk-lime";
  return <section id="ingredient-catalogue" className="min-w-0 space-y-6">
    <h2 className="klk-h3 text-klk-primary">Ingredient Portfolio</h2>
    <div className="grid min-w-0 gap-4 rounded-md bg-klk-surface p-5 sm:grid-cols-2">
      <label className="klk-body-small min-w-0 font-semibold sm:col-span-2" htmlFor="ingredient-search">Search Ingredients<input id="ingredient-search" type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Product name, INCI or key feature" className={fieldClass} /></label>
      <label className="klk-body-small min-w-0 font-semibold" htmlFor="ingredient-functionality">Functionality<select aria-label="Functionality" id="ingredient-functionality" value={functionality} onChange={event => { setFunctionality(event.target.value); setPage(1); }} className={fieldClass}><option value="">All Functionalities</option>{functionalities.map(item => <option key={item}>{item}</option>)}</select></label>
      <label className="klk-body-small min-w-0 font-semibold" htmlFor="ingredient-application">Application<select aria-label="Application" id="ingredient-application" value={application} onChange={event => { setApplication(event.target.value); setPage(1); }} className={fieldClass}><option value="">All Applications</option>{applications.map(item => <option key={item}>{item}</option>)}</select></label>
      <button type="button" onClick={() => { setQuery(""); setFunctionality(""); setApplication(""); setPage(1); }} className="klk-caption w-fit text-klk-primary underline underline-offset-4">Clear filters</button>
    </div>
    <p role="status" className="klk-caption text-klk-text-secondary">{filtered.length} ingredients · Page {page} of {pages}</p>
    <div className="grid min-w-0 gap-5 sm:grid-cols-2">{filtered.slice((page - 1) * 12, page * 12).map((item, index) => <article key={`${item.name}-${index}`} className="flex min-w-0 flex-col rounded-md border border-klk-border bg-white p-5 shadow-klk">
      <h3 className="klk-h6 text-klk-primary">{item.name}</h3>
      {item.inci && <p className="klk-body-small mt-4"><span className="font-semibold">INCI: </span>{item.inci}</p>}
      <p className="klk-body-small mt-4 text-klk-text-secondary">{item.description}</p>
      {!!item.functionalities.length && <p className="klk-caption mt-4"><span className="font-semibold text-klk-primary">Functionalities: </span>{item.functionalities.join(", ")}</p>}
      {!!item.applications.length && <p className="klk-caption mt-3"><span className="font-semibold text-klk-primary">Applications: </span>{item.applications.join(", ")}</p>}
      <Link href={`/product-enquiry?product=${encodeURIComponent(item.name)}`} className="klk-button mt-6 w-fit border-b border-klk-brand-blue pb-2 text-klk-primary">ENQUIRE NOW</Link>
    </article>)}</div>
    {!filtered.length && <p className="klk-body rounded-md bg-klk-surface p-6">No ingredients match these filters. Try another product name or clear the filters.</p>}
    <nav aria-label="Ingredient pagination" className="flex flex-wrap items-center justify-between gap-3"><button disabled={page === 1} onClick={() => setPage(value => value - 1)} className="min-h-11 rounded-sm border border-klk-border px-4 py-2 disabled:opacity-40">Previous</button><span className="klk-caption">{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage(value => value + 1)} className="min-h-11 rounded-sm border border-klk-border px-4 py-2 disabled:opacity-40">Next</button></nav>
  </section>;
}

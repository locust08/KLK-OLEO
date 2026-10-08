"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GeneratedPage } from "@/lib/generated/types";

export function NewsArchive({ articles }: { articles: GeneratedPage[] }) {
  const [category, setCategory] = useState("All");
  const [year, setYear] = useState("All");
  const [page, setPage] = useState(1);
  const filtered = articles.filter(article => (category === "All" || article.category === category) && (year === "All" || article.date?.startsWith(year)));
  const years = [...new Set(articles.flatMap(article => article.date ? [article.date.slice(0, 4)] : []))].sort().reverse();
  const pages = Math.max(1, Math.ceil(filtered.length / 9));
  const visible = filtered.slice((page - 1) * 9, page * 9);
  return <section className="klk-section bg-klk-surface"><div className="klk-container grid min-w-0 gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
    <aside className="h-fit rounded-md bg-klk-darker p-6 text-white">
      <h2 className="klk-h6 mb-6">Filter By</h2>
      <fieldset className="space-y-3"><legend className="klk-body-small mb-3 font-semibold">Category</legend>{["All", "Corporate", "Exhibition", "Products", "Sustainability"].map(item => <label key={item} className="klk-body-small flex cursor-pointer items-center gap-3"><input type="radio" name="category" value={item} checked={category === item} onChange={() => { setCategory(item); setPage(1); }} className="size-4 shrink-0 accent-klk-lime" />{item}</label>)}</fieldset>
      <label className="klk-body-small mt-8 block font-semibold" htmlFor="archive-year">Year</label>
      <select id="archive-year" value={year} onChange={event => { setYear(event.target.value); setPage(1); }} className="mt-3 min-h-11 w-full min-w-0 rounded-sm bg-white px-3 py-2 text-base text-klk-text"><option value="All">All Years</option>{years.map(item => <option key={item}>{item}</option>)}</select>
      <button onClick={() => { setCategory("All"); setYear("All"); setPage(1); }} className="klk-caption mt-6 underline underline-offset-4">Reset filters</button>
    </aside>
    <div className="min-w-0">
      <p role="status" className="klk-caption mb-5 text-klk-text-secondary">{filtered.length} articles · Page {page} of {pages}</p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{visible.map(article => <article key={article.slug} className="flex min-w-0 flex-col overflow-hidden rounded-md border border-klk-border bg-white shadow-klk">
        {article.image && <div className="relative aspect-[1.6] overflow-hidden"><Image src={article.image} alt={article.title} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 40vw, 90vw" className="object-cover" /></div>}
        <div className="flex flex-1 flex-col p-6"><p className="klk-caption mb-4 text-klk-text-secondary">{article.category}{article.date ? ` · ${article.date}` : ""}</p><h2 className="klk-h6 text-klk-primary">{article.title}</h2><p className="klk-body-small mb-6 mt-4 line-clamp-3 text-klk-text-secondary">{article.sections.flatMap(section => section.paragraphs)[0]}</p><Link href={`/${article.slug}`} className="klk-button mt-auto flex w-fit items-center gap-3 border-b border-klk-brand-blue pb-2">READ MORE<ArrowRight aria-hidden="true" className="size-4 shrink-0 text-klk-lime" /></Link></div>
      </article>)}</div>
      {!visible.length && <p className="klk-body rounded-md bg-white p-8">No articles match these filters.</p>}
      <nav aria-label="Archive pagination" className="mt-10 flex flex-wrap justify-center gap-3"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-sm border border-klk-border px-4 py-3 disabled:opacity-40">Previous</button>{Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined} onClick={() => setPage(number)} className={`min-h-11 min-w-11 rounded-sm px-3 py-2 ${number === page ? "bg-klk-primary text-white" : "bg-white text-klk-primary"}`}>{number}</button>)}<button disabled={page >= pages} onClick={() => setPage(value => value + 1)} className="rounded-sm border border-klk-border px-4 py-3 disabled:opacity-40">Next</button></nav>
    </div>
  </div></section>;
}

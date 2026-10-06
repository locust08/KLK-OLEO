"use client";

import Image from "next/image";
import { destinationFor } from "@/lib/klk-links";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { products } from "@/lib/klk-data";
import type { Product } from "@/types/klk";

const imageRoot = "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

type Filters = {
  category: string;
  functionality: string;
  formulation: string;
  label: string;
};

const emptyFilters: Filters = { category: "", functionality: "", formulation: "", label: "" };

const fieldOptions = {
  category: [...new Set(products.map((product) => product.category))],
  functionality: [...new Set(products.flatMap((product) => product.functionality))],
  formulation: [...new Set(products.flatMap((product) => product.formulationType))],
  label: [...new Set(products.flatMap((product) => product.labels))],
};

export function ProductExperience({ showFinder = true }: { showFinder?: boolean }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [enquiring, setEnquiring] = useState<Product | null>(null);

  useEffect(() => {
    const open = () => setSearchOpen(true);
    window.addEventListener("open-product-search", open);
    return () => window.removeEventListener("open-product-search", open);
  }, []);

  useEffect(() => {
    const locked = searchOpen || selected || enquiring;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, selected, enquiring]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const queryMatch = !needle || [product.name, product.category, product.description, ...product.applications].join(" ").toLowerCase().includes(needle);
      return queryMatch
        && (!filters.category || product.category === filters.category)
        && (!filters.functionality || product.functionality.includes(filters.functionality))
        && (!filters.formulation || product.formulationType.includes(filters.formulation))
        && (!filters.label || product.labels.includes(filters.label));
    });
  }, [filters, query]);

  return (
    <section id={showFinder ? "products" : undefined} className={showFinder ? "klk-section-large bg-klk-surface" : ""}>
      {showFinder && <div className="klk-container">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="klk-overline mb-2 font-semibold text-klk-lime">Product finder</p>
            <h2 className="klk-h2 max-w-3xl text-klk-primary">Discover Solutions Made For Your Formulation</h2>
          </div>
          <button type="button" onClick={() => setSearchOpen(true)} className="klk-button inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-klk-primary px-6 text-white transition hover:-translate-y-0.5 hover:bg-klk-primary-hover active:bg-klk-primary-active">
            <SlidersHorizontal size={17} /> Advanced search & filters
          </button>
        </div>
        <SearchControls query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} compact />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {matches.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} onOpen={setSelected} />)}
        </div>
        {matches.length === 0 && <EmptyState onClear={() => { setQuery(""); setFilters(emptyFilters); }} />}
      </div>}

      {searchOpen && (
        <Modal title="Search KLK OLEO Products" onClose={() => setSearchOpen(false)} wide>
          <SearchControls query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} />
          <p className="klk-body-small mt-6 text-klk-text-secondary">{matches.length} matching product{matches.length === 1 ? "" : "s"}</p>
          <div className="mt-4 grid max-h-[48vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
            {matches.map((product) => <ProductCard key={product.id} product={product} onOpen={(item) => { setSearchOpen(false); setSelected(item); }} />)}
          </div>
          {matches.length === 0 && <EmptyState onClear={() => { setQuery(""); setFilters(emptyFilters); }} />}
        </Modal>
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <p className="klk-overline font-semibold text-klk-lime">{selected.category}</p>
          <p className="klk-body mt-4 text-klk-text-secondary">{selected.description}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <DetailList title="Functionality" values={selected.functionality} />
            <DetailList title="Formulation type" values={selected.formulationType} />
            <DetailList title="Regulatory & labels" values={selected.labels} />
            <DetailList title="Applications" values={selected.applications} />
          </div>
          <button type="button" onClick={() => { setSelected(null); setEnquiring(selected); }} className="klk-button mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-klk-primary px-6 text-white transition-colors hover:bg-klk-primary-hover active:bg-klk-primary-active">
            Make a product enquiry <ChevronRight size={17} />
          </button>
        </Modal>
      )}

      {enquiring && <EnquiryDialog product={enquiring} onClose={() => setEnquiring(null)} />}
    </section>
  );
}

function SearchControls({ query, setQuery, filters, setFilters, compact = false }: {
  query: string;
  setQuery: (value: string) => void;
  filters: Filters;
  setFilters: (value: Filters) => void;
  compact?: boolean;
}) {
  const update = (key: keyof Filters, value: string) => setFilters({ ...filters, [key]: value });
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(16.25rem,1.5fr)_repeat(4,minmax(9.0625rem,1fr))]">
      <label className="relative block">
        <span className="sr-only">Search by product name</span>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-klk-primary" size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name" className="klk-body-small h-[3.25rem] w-full rounded-full border border-klk-border bg-white pl-12 pr-5 text-klk-text outline-none transition focus:border-klk-primary focus:ring-2 focus:ring-klk-lime/20" />
      </label>
      {(Object.keys(fieldOptions) as (keyof Filters)[]).map((key) => (
        <label key={key} className={compact ? "hidden lg:block" : "block"}>
          <span className="sr-only">Filter by {key}</span>
          <select value={filters[key]} onChange={(event) => update(key, event.target.value)} className="klk-body-small h-[3.25rem] w-full rounded-full border border-klk-border bg-white px-4 text-klk-text-secondary outline-none transition focus:border-klk-primary">
            <option value="">All {key === "label" ? "labels" : key}</option>
            {fieldOptions[key].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      ))}
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  return (
    <button type="button" onClick={() => onOpen(product)} className="group min-h-56 rounded-md border border-klk-border/70 bg-white p-6 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[var(--klk-shadow-raised)]">
      <p className="klk-overline font-semibold text-klk-lime">{product.category}</p>
      <h3 className="klk-h5 mt-3 text-klk-primary">{product.name}</h3>
      <p className="klk-body-small mt-3 line-clamp-3 text-klk-text-secondary">{product.description}</p>
      <span className="klk-overline mt-5 inline-flex items-center gap-1.5 font-semibold text-klk-text">View product <ChevronRight size={15} className="text-klk-lime transition group-hover:translate-x-1" /></span>
    </button>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return <div className="mt-8 rounded-md border border-dashed border-klk-border bg-white/70 p-10 text-center"><p className="klk-body text-klk-text-secondary">No products match all selected criteria.</p><button type="button" onClick={onClear} className="klk-link mt-4 font-semibold text-klk-primary underline underline-offset-4">Clear search and filters</button></div>;
}

function DetailList({ title, values }: { title: string; values: string[] }) {
  return <div><h4 className="klk-body-small font-semibold text-klk-darker">{title}</h4><ul className="mt-2 space-y-1.5">{values.map((value) => <li key={value} className="klk-body-small flex items-center gap-2 text-klk-text-secondary"><Check size={14} className="text-klk-lime" />{value}</li>)}</ul></div>;
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const trigger = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);

  return (
    <dialog ref={dialogRef} onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex='0']")).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }} onCancel={(event) => { event.preventDefault(); onClose(); }} className="fixed inset-0 z-[90] m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-4 open:grid open:place-items-center backdrop:bg-klk-darker/80 backdrop:backdrop-blur-sm" aria-label={title}>
      <div className={`max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-lg bg-white p-6 shadow-[var(--klk-shadow-raised)] sm:p-8 ${wide ? "max-w-6xl" : "max-w-2xl"}`}>
        <div className="mb-6 flex items-start justify-between gap-5"><h2 className="klk-h3 text-klk-primary">{title}</h2><button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full bg-klk-surface text-klk-darker transition-colors hover:bg-klk-surface-subtle" aria-label="Close"><X size={20} /></button></div>
        {children}
      </div>
    </dialog>
  );
}

function EnquiryDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Modal title={`Enquire about ${product.name}`} onClose={onClose}>
      {submitted ? <div className="py-12 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-klk-surface text-klk-primary"><Check size={28} /></div><h3 className="klk-h4 mt-5 text-klk-darker">Thank you for your enquiry</h3><p className="klk-body-small mt-2 text-klk-text-secondary">This local prototype has captured the enquiry flow successfully.</p></div> : (
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="grid gap-4 sm:grid-cols-2">
          {[["Name", "text"], ["Work email", "email"], ["Company", "text"], ["Country", "text"]].map(([label, type]) => <label key={label} className="klk-body-small font-medium text-klk-text-secondary">{label}<input required type={type} className="mt-2 h-11 w-full rounded-sm border border-klk-border px-3 outline-none transition focus:border-klk-primary" /></label>)}
          <label className="klk-body-small font-medium text-klk-text-secondary sm:col-span-2">How can we help?<textarea required rows={4} defaultValue={`I would like to learn more about ${product.name}.`} className="mt-2 w-full rounded-sm border border-klk-border p-3 outline-none transition focus:border-klk-primary" /></label>
          <button type="submit" className="klk-button min-h-12 rounded-full bg-klk-primary px-6 text-white transition-colors hover:bg-klk-primary-hover active:bg-klk-primary-active sm:col-span-2">Submit enquiry</button>
        </form>
      )}
    </Modal>
  );
}

export function SiteFooter() {
  const columns = [
    { title: "Quick Links", links: ["KLK OLEO in Brief", "History & Milestones", "Sustainability", "Corporate Responsibility", "Career", "News & Events"] },
    { title: "Products", links: ["Amides", "Anionic Surfactants", "Esters", "Fatty Acids", "Fatty Alcohols", "Glycerine", "Nonionic Surfactants", "Phytonutrients"] },
    { title: "Markets", links: ["Beauty & Personal Care", "Food & Nutrition", "Home Care, Industries & Institutional (I&I) Cleaning", "Life Science", "Lubricants", "Oleo Basics", "Polymers"] },
  ];
  return (
    <footer id="contact-us" className="bg-klk-darker pb-24 pt-12 text-white">
      <div className="klk-container grid gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_repeat(3,1fr)]">
        <div><Image src={`${imageRoot}/KLK-OLEO-Header-Logo-1.png`} alt="KLK OLEO" width={190} height={72} className="h-auto w-[11.875rem] brightness-0 invert" /><p className="klk-body-large mt-5 max-w-xs font-semibold text-klk-lime">Global Oleochemical Producer<br />For More Than 30 Years</p><h3 className="klk-body-small mt-8 font-semibold">KLK OLEO Corporate Headquarters</h3><p className="klk-caption mt-3 max-w-xs text-white/70">Level 8, Menara KLK, No.1, Jalan PJU 7/6, Mutiara Damansara, 47810 Petaling Jaya, Selangor, Malaysia.</p><p className="klk-caption mt-3 text-white/70"><a href="tel:+60378098833">+603 7809 8833</a> · <a href={destinationFor("Product Enquiry")}>Product Enquiry</a></p></div>
        {columns.map((column) => <div key={column.title}><h3 className="klk-body-small border-b border-white/15 pb-3 font-semibold">{column.title}</h3><ul className="mt-3 space-y-2.5">{column.links.map((link) => <li key={link}>{link === "Career" ? <span aria-disabled="true" title="No linked Career page in the prototype" className="klk-caption text-white/70">{link}</span> : <a href={destinationFor(link)} className="klk-caption text-white/70 transition hover:text-klk-lime">{link}</a>}</li>)}</ul></div>)}
      </div>
      <div className="klk-container klk-caption flex flex-col items-center justify-between gap-3 pt-6 text-center text-white/60 md:flex-row"><p>Copyright © 2026 KLK OLEO 0587027T (200201019364). All rights reserved.</p><p>{["Disclaimer", "Personal Data Notice Statement", "Privacy Notice", "Cookie Notice"].map((label, index) => <span key={label}>{index > 0 && " · "}<a href={destinationFor(label)}>{label}</a></span>)}</p></div>
    </footer>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(localStorage.getItem("klk-cookie-choice") === null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const choose = (choice: string) => { localStorage.setItem("klk-cookie-choice", choice); setVisible(false); };
  if (!visible) return null;
  return <div className="klk-caption fixed inset-x-0 bottom-0 z-[80] flex flex-col gap-3 bg-klk-text px-4 py-3 text-white/85 shadow-[var(--klk-shadow-raised)] md:flex-row md:items-center"><p className="flex-1">This website uses cookies, pixel tags, and local storage for performance, personalization, and marketing purposes. Only essential cookies are on by default.</p><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => choose("essential")} className="min-h-11 rounded-xs border border-white/20 px-4 py-2 hover:bg-white/10">Do not allow cookies</button><button type="button" onClick={() => choose("all")} className="min-h-11 rounded-xs bg-klk-brand-blue px-4 py-2 font-semibold text-white hover:brightness-90">Allow all cookies</button><button type="button" onClick={() => choose("dismissed")} className="grid size-11 place-items-center" aria-label="Close cookie banner"><X size={18} /></button></div></div>;
}

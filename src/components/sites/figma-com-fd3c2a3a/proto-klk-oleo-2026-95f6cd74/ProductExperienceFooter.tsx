"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

export function ProductExperience() {
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
    <section id="products" className="bg-[#e8f3ed] px-5 py-16 sm:px-10 lg:py-20">
      <div className="mx-auto max-w-[1364px]">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7bbf2a]">Product finder</p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-[#006b3f] sm:text-4xl">Discover Solutions Made For Your Formulation</h2>
          </div>
          <button type="button" onClick={() => setSearchOpen(true)} className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#006b3f] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#003f27]">
            <SlidersHorizontal size={17} /> Advanced search & filters
          </button>
        </div>
        <SearchControls query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} compact />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {matches.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} onOpen={setSelected} />)}
        </div>
        {matches.length === 0 && <EmptyState onClear={() => { setQuery(""); setFilters(emptyFilters); }} />}
      </div>

      {searchOpen && (
        <Modal title="Search KLK OLEO Products" onClose={() => setSearchOpen(false)} wide>
          <SearchControls query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} />
          <p className="mt-6 text-sm text-neutral-500">{matches.length} matching product{matches.length === 1 ? "" : "s"}</p>
          <div className="mt-4 grid max-h-[48vh] gap-4 overflow-y-auto pr-1 md:grid-cols-2">
            {matches.map((product) => <ProductCard key={product.id} product={product} onOpen={(item) => { setSearchOpen(false); setSelected(item); }} />)}
          </div>
          {matches.length === 0 && <EmptyState onClear={() => { setQuery(""); setFilters(emptyFilters); }} />}
        </Modal>
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7bbf2a]">{selected.category}</p>
          <p className="mt-4 leading-7 text-neutral-600">{selected.description}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <DetailList title="Functionality" values={selected.functionality} />
            <DetailList title="Formulation type" values={selected.formulationType} />
            <DetailList title="Regulatory & labels" values={selected.labels} />
            <DetailList title="Applications" values={selected.applications} />
          </div>
          <button type="button" onClick={() => { setSelected(null); setEnquiring(selected); }} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#006b3f] px-6 text-sm font-semibold text-white hover:bg-[#003f27]">
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
    <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.5fr)_repeat(4,minmax(145px,1fr))]">
      <label className="relative block">
        <span className="sr-only">Search by product name</span>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006b3f]" size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product name" className="h-[52px] w-full rounded-full border border-[#87ab98] bg-white pl-12 pr-5 text-sm outline-none transition focus:border-[#006b3f] focus:ring-2 focus:ring-[#7bbf2a]/20" />
      </label>
      {(Object.keys(fieldOptions) as (keyof Filters)[]).map((key) => (
        <label key={key} className={compact ? "hidden lg:block" : "block"}>
          <span className="sr-only">Filter by {key}</span>
          <select value={filters[key]} onChange={(event) => update(key, event.target.value)} className="h-[52px] w-full rounded-full border border-[#b3ccbf] bg-white px-4 text-sm text-[#33453c] outline-none focus:border-[#006b3f]">
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
    <button type="button" onClick={() => onOpen(product)} className="group min-h-56 rounded-xl bg-white p-6 text-left shadow-[0_10px_35px_rgba(0,63,39,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,63,39,.13)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7bbf2a]">{product.category}</p>
      <h3 className="mt-3 text-xl font-semibold text-[#006b3f]">{product.name}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500">{product.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#17251d]">View product <ChevronRight size={15} className="text-[#7bbf2a] transition group-hover:translate-x-1" /></span>
    </button>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return <div className="mt-8 rounded-xl border border-dashed border-[#87ab98] bg-white/70 p-10 text-center"><p className="text-neutral-600">No products match all selected criteria.</p><button type="button" onClick={onClear} className="mt-4 text-sm font-semibold text-[#006b3f] underline underline-offset-4">Clear search and filters</button></div>;
}

function DetailList({ title, values }: { title: string; values: string[] }) {
  return <div><h4 className="text-sm font-semibold text-[#003f27]">{title}</h4><ul className="mt-2 space-y-1.5">{values.map((value) => <li key={value} className="flex items-center gap-2 text-sm text-neutral-600"><Check size={14} className="text-[#7bbf2a]" />{value}</li>)}</ul></div>;
}

function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#002a1b]/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8 ${wide ? "max-w-6xl" : "max-w-2xl"}`}>
        <div className="mb-6 flex items-start justify-between gap-5"><h2 className="text-2xl font-semibold text-[#006b3f] sm:text-3xl">{title}</h2><button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf5f0] text-[#003f27] hover:bg-[#dcebe2]" aria-label="Close"><X size={20} /></button></div>
        {children}
      </div>
    </div>
  );
}

function EnquiryDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <Modal title={`Enquire about ${product.name}`} onClose={onClose}>
      {submitted ? <div className="py-12 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-[#e8f3ed] text-[#006b3f]"><Check size={28} /></div><h3 className="mt-5 text-2xl font-semibold text-[#003f27]">Thank you for your enquiry</h3><p className="mt-2 text-neutral-500">This local prototype has captured the enquiry flow successfully.</p></div> : (
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="grid gap-4 sm:grid-cols-2">
          {[["Name", "text"], ["Work email", "email"], ["Company", "text"], ["Country", "text"]].map(([label, type]) => <label key={label} className="text-sm font-medium text-[#33453c]">{label}<input required type={type} className="mt-2 h-11 w-full rounded-lg border border-[#b3ccbf] px-3 outline-none focus:border-[#006b3f]" /></label>)}
          <label className="text-sm font-medium text-[#33453c] sm:col-span-2">How can we help?<textarea required rows={4} defaultValue={`I would like to learn more about ${product.name}.`} className="mt-2 w-full rounded-lg border border-[#b3ccbf] p-3 outline-none focus:border-[#006b3f]" /></label>
          <button type="submit" className="h-12 rounded-full bg-[#006b3f] px-6 text-sm font-semibold text-white hover:bg-[#003f27] sm:col-span-2">Submit enquiry</button>
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
    <footer id="contact-us" className="bg-[#003f27] px-5 pb-24 pt-12 text-white sm:px-10">
      <div className="mx-auto grid max-w-[1364px] gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[1.15fr_repeat(3,1fr)]">
        <div><Image src={`${imageRoot}/KLK-OLEO-Header-Logo-1.png`} alt="KLK OLEO" width={190} height={72} className="h-auto w-[190px] brightness-0 invert" /><p className="mt-5 max-w-xs text-lg font-semibold leading-7 text-[#7bbf2a]">Global Oleochemical Producer<br />For More Than 30 Years</p><h3 className="mt-8 text-sm font-semibold">KLK OLEO Corporate Headquarters</h3><p className="mt-3 max-w-xs text-xs leading-6 text-white/70">Level 8, Menara KLK, No.1, Jalan PJU 7/6, Mutiara Damansara, 47810 Petaling Jaya, Selangor, Malaysia.</p><p className="mt-3 text-xs text-white/70">+603 7809 8833 · Product Enquiry</p></div>
        {columns.map((column) => <div key={column.title}><h3 className="border-b border-white/15 pb-3 text-sm font-semibold">{column.title}</h3><ul className="mt-3 space-y-2.5">{column.links.map((link) => <li key={link}><a href="#products" className="text-xs leading-5 text-white/70 transition hover:text-[#7bbf2a]">{link}</a></li>)}</ul></div>)}
      </div>
      <div className="mx-auto flex max-w-[1364px] flex-col items-center justify-between gap-3 pt-6 text-center text-[11px] text-white/60 md:flex-row"><p>Copyright © 2026 KLK OLEO 0587027T (200201019364). All rights reserved.</p><p>Disclaimer · Personal Data Notice Statement · Privacy Notice · Cookie Notice</p></div>
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
  return <div className="fixed inset-x-0 bottom-0 z-[80] flex flex-col gap-3 bg-[#262626] px-4 py-3 text-[11px] leading-4 text-white/85 shadow-2xl md:flex-row md:items-center"><p className="flex-1">This website uses cookies, pixel tags, and local storage for performance, personalization, and marketing purposes. Only essential cookies are on by default.</p><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => choose("essential")} className="rounded border border-white/20 px-4 py-2 hover:bg-white/10">Do not allow cookies</button><button type="button" onClick={() => choose("all")} className="rounded bg-[#168dd1] px-4 py-2 font-semibold text-white hover:bg-[#0878b9]">Allow all cookies</button><button type="button" onClick={() => choose("dismissed")} className="grid size-9 place-items-center" aria-label="Close cookie banner"><X size={18} /></button></div></div>;
}

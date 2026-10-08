"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, Mail, Plus, Search } from "lucide-react";
import { getProductCategory, productCategories, productFamilyHref, productListingDescription, type ProductCategory, type ProductFamily } from "@/lib/product-catalog";
import { PrototypePageShell, PrototypeBreadcrumbs, prototypeImageRoot } from "../shared/PrototypePageShell";
import styles from "./ProductsPrototype.module.css";

const categoryDescriptions: Record<string, string> = {
  amides: "Versatile oleochemical derivatives used to support performance in personal care, home care, and industrial formulations.",
  "anionic-surfactants": "High-performance surfactants designed for effective cleansing, foaming, wetting, and emulsifying applications.",
  esters: "Functional esters developed for use across personal care, lubricants, food, industrial, and specialty applications.",
  "fatty-acids": "High-quality fatty acids derived from renewable raw materials for a wide range of industrial and consumer applications.",
  "fatty-alcohols": "Versatile fatty alcohols used as key ingredients in personal care, home care, surfactants, and industrial formulations.",
  glycerine: "High-purity glycerine suitable for pharmaceutical, personal care, food, and other demanding applications.",
  "nonionic-surfactants": "Flexible surfactant solutions offering effective emulsification, wetting, dispersion, and cleaning performance.",
  phytonutrients: "Naturally derived phytonutrients including tocotrienols and mixed carotene for food, nutrition, and wellness applications.",
};

const linkClass = "klk-button inline-flex items-center gap-2 border-b border-klk-lime/50 pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-klk-lime";

function ProductBrochure({ product }: { product: ProductFamily }) {
  if (!product.brochure) return null;
  const directDownload = /\.pdf(?:\?|$)/i.test(product.brochure);
  return <a href={product.brochure} target="_blank" rel="noopener noreferrer" className="klk-button inline-flex min-h-11 items-center gap-2 rounded-sm bg-klk-brand-blue px-4 py-3 text-white">
    {directDownload ? "Download Brochure" : "Request Brochure"}<Download className="size-[0.9375rem]" aria-hidden="true" />
  </a>;
}

function ProductsBanner({ category, product }: { category: ProductCategory; product?: ProductFamily }) {
  const image = product?.slug === "palmester-fatty-acid-esters" ? "palmester-background.jpg" : "palmerol-background.jpg";
  return <section className="relative isolate bg-klk-surface">
      <div className="absolute inset-x-0 top-[-4.25rem] bottom-0 z-0 overflow-hidden md:top-[-5.625rem]">
      <Image src={`${prototypeImageRoot}/${image}`} alt="" fill preload sizes="100vw" className="object-cover object-[center_40%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-klk-darker/70 via-klk-darker/10 to-transparent" />
    </div>
    <PrototypeBreadcrumbs items={[
      { label: "Products", href: "/products" },
      { label: category.title, href: product ? `/products/${category.slug}` : undefined },
      ...(product ? [{ label: product.name }] : []),
    ]} />
    <div className="klk-container relative flex min-h-[16.25rem] items-center py-12 md:min-h-[26.125rem]">
      <h1 className="klk-h1 text-white">Products</h1>
    </div>
  </section>;
}

export function ProductsPrototypeOverview() {
  return <PrototypePageShell>
    <div className="relative isolate">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image src={`${prototypeImageRoot}/products-background.jpg`} fill preload sizes="100vw" alt="" className="object-cover object-left-top" />
      </div>
      <PrototypeBreadcrumbs items={[{ label: "Products" }]} />
      <section className="klk-section relative z-10">
        <div className="klk-container">
        <div className="mx-auto mb-14 max-w-[50rem] text-center">
          <p className="klk-overline mb-3 text-klk-primary">Our Products</p>
          <h1 className="klk-h2 text-klk-primary">Enriching Human Lives<br className="hidden sm:block" /> Everyday In Many Ways</h1>
          <p className="klk-body mt-6 text-klk-text-secondary">Everyday convenience to global solutions.<br />At home, in the garden, at work, for leisure and on the road.<br />From food to pharmaceutical ingredients to sustainable fuel.<br />From morning till night,<br />KLK OLEO is enriching human lives everyday in many ways.</p>
          <p className="klk-body mt-6 text-klk-text-secondary">Our product portfolio serves a broad customer base ranging from global brands to regional businesses, we are recognised for our quality, technical capabilities, and commitment to sustainability. Our collaborative approach enables us to work closely with customers to turn ideas into impactful solutions.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[2.5rem]">
          {productCategories.map(category => <article key={category.slug} className="flex flex-col rounded-md bg-klk-darker/90 p-7 text-white shadow-klk md:min-h-[16.375rem] md:p-8">
            <h2 className="klk-h4 border-b border-white/20 pb-4">{category.title}</h2>
            <p className="klk-body-small mt-4 mb-6 flex-1">{categoryDescriptions[category.slug]}</p>
            <Link href={`/products/${category.slug}`} className={`${linkClass} self-start`}>View Products <ArrowRight className="size-4 text-klk-lime" aria-hidden="true" /></Link>
          </article>)}
        </div>
        </div>
      </section>
    </div>
  </PrototypePageShell>;
}

export function ProductsPrototypeListing({ categorySlug = "fatty-acids" }: { categorySlug?: string }) {
  const [query, setQuery] = useState("");
  const category = getProductCategory(categorySlug)!;
  const filteredProducts = category.products.filter(product => `${product.name} ${productListingDescription(product)}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <PrototypePageShell>
    <ProductsBanner category={category} />
    <div className="grid md:grid-cols-[25.625%_1fr]">
      <aside className="bg-klk-primary p-6 text-white md:px-10 md:py-16">
        <label className="relative block">
          <span className="sr-only">Search {category.title.toLowerCase()} products</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search" type="search" className="klk-body-small min-h-11 w-full rounded-full bg-klk-surface px-4 py-3 pr-10 text-klk-darker outline-offset-4 focus-visible:outline-2 focus-visible:outline-white" />
          <Search className="pointer-events-none absolute top-3.5 right-3 size-4 text-klk-lime" aria-hidden="true" />
        </label>
        <h2 className="mt-8 mb-2 text-2xl font-semibold">Category</h2>
        <ul>{productCategories.map(item => <li key={item.slug} className="border-b border-white/15 py-4 text-[0.9375rem]">
          <Link href={`/products/${item.slug}`} aria-current={category.slug === item.slug ? "page" : undefined} className={`${category.slug === item.slug ? "font-semibold" : ""} focus-visible:outline-2 focus-visible:outline-offset-4`}>{item.title}</Link>
        </li>)}</ul>
      </aside>
      <section className="min-w-0 px-5 py-10 md:px-10 md:py-16 lg:pr-[10.625%]">
        <h1 className="klk-h2 mb-8 text-klk-primary">{category.title}</h1>
        <div className="space-y-6" aria-live="polite">
          {filteredProducts.map(product => <article key={product.slug} className="rounded-md border border-klk-border bg-klk-surface p-6 md:p-8">
            <h2 className="klk-h4 mb-4 text-klk-primary">{product.name}</h2>
            <p className="klk-body-small text-klk-text-secondary">{productListingDescription(product).startsWith(product.name) ? <><strong>{product.name}</strong>{productListingDescription(product).slice(product.name.length)}</> : productListingDescription(product)}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={productFamilyHref(category, product)} className={linkClass}>Learn More <ArrowRight className="size-4 text-klk-lime" aria-hidden="true" /></Link>
              <ProductBrochure product={product} />
            </div>
          </article>)}
          {filteredProducts.length === 0 && <p className="klk-body py-10 text-klk-text-secondary">No {category.title.toLowerCase()} products match “{query}”.</p>}
        </div>
      </section>
    </div>
  </PrototypePageShell>;
}

export function ProductsPrototypeDetail({ categorySlug = "fatty-acids", productSlug = "palmera" }: { categorySlug?: string; productSlug?: string }) {
  const category = getProductCategory(categorySlug)!;
  const product = category.products.find(item => item.slug === productSlug)!;
  return <PrototypePageShell>
    <ProductsBanner category={category} product={product} />
    <section className="klk-container py-10 md:py-16">
      <Link href={`/products/${category.slug}`} className={`${linkClass} border-0`}><ArrowLeft className="size-4 text-klk-primary" aria-hidden="true" /> Back</Link>
      <h1 className="klk-h2 mt-6 border-b border-klk-primary/20 pb-6 text-klk-primary">{product.name}</h1>
      <div className={`${styles.productCopy} klk-body-small overflow-x-auto py-6 text-klk-text-secondary`} tabIndex={product.introHtml.includes("<table") ? 0 : undefined} role={product.introHtml.includes("<table") ? "region" : undefined} aria-label={product.introHtml.includes("<table") ? `${product.name} product information, scroll to see all columns` : undefined} dangerouslySetInnerHTML={{ __html: product.introHtml }} />
      <div className="mt-5 rounded-md border border-klk-border bg-klk-surface p-6 md:p-8">
        {product.sections.map(section => <details key={section.title} className="group border-b border-klk-primary/20 last-of-type:border-b-0">
          <summary className="klk-h6 flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-klk-text [&::-webkit-details-marker]:hidden">
            {section.title}<Plus aria-hidden="true" className="size-[1.125rem] shrink-0 rounded-full bg-klk-primary p-0.5 text-white transition-transform group-open:rotate-45" />
          </summary>
          <div className={`${styles.productCopy} klk-body-small overflow-x-auto pb-6 text-klk-text-secondary`} dangerouslySetInnerHTML={{ __html: section.html }} />
        </details>)}
        <Link href={`/contact-us?product=${encodeURIComponent(product.name)}`} className="klk-button mt-8 inline-flex min-h-11 items-center gap-3 rounded-sm bg-klk-primary px-4 py-3 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-klk-primary">Send Enquiry <Mail className="size-[0.9375rem]" aria-hidden="true" /></Link>
      </div>
      {product.brochure && <div className="mt-6 mb-12 grid overflow-hidden rounded-md bg-klk-primary shadow-klk md:grid-cols-2">
        <div className="relative min-h-[17.5rem] md:min-h-[18.75rem]"><Image src={`${prototypeImageRoot}/${category.slug === "fatty-acids" ? "prototype-products-basic-oleochemicals.png" : `product-${product.slug}.jpg`}`} alt={`${product.name} brochure`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div>
        <div className="flex flex-col items-start justify-center p-8 text-white md:p-10"><h2 className="mb-6 text-2xl font-semibold md:text-3xl">{product.name} Brochure/ Leaflet:</h2><ProductBrochure product={product} /></div>
      </div>}
    </section>
  </PrototypePageShell>;
}

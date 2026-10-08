import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GeneratedPage } from "@/lib/generated/types";
import { generatedBannerImage, localSourceLink } from "@/lib/generated/pages";
import catalogues from "@/lib/generated/market-catalogues.json";
import { MarketCatalogue, type MarketIngredient } from "./MarketCatalogue";
import { PrototypePageBanner, PrototypePageShell } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

export function ContentPage({ page }: { page: GeneratedPage }) {
  const isNews = page.slug.startsWith("news-events/");
  const ingredients = (catalogues as Record<string, MarketIngredient[]>)[page.slug];
  const ingredientNames = new Set(ingredients?.map(item => item.name));
  const sections = ingredients ? page.sections.filter(section => !ingredientNames.has(section.heading || "") && !["Functionality", "Application", "Explore the complete ingredient portfolio"].includes(section.heading || "")) : page.sections;
  const parent = isNews ? { label: "News & Events", href: "/news-events" } : page.category === "Markets" ? { label: "Markets", href: "/markets" } : { label: page.category, href: "/site-directory" };
  return <PrototypePageShell>
    <PrototypePageBanner title={page.title} image={generatedBannerImage(page)} breadcrumbs={[parent, { label: page.title }]} />
    <article className="klk-section bg-white">
      <div className="klk-container grid min-w-0 gap-12 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-10">
          {page.date && <p className="klk-caption text-klk-text-secondary">{page.category} · {new Date(`${page.date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</p>}
          {sections.map((section, index) => <section key={index} className="min-w-0 space-y-5">
            {section.heading && <h2 className="klk-h4 text-klk-primary">{section.heading}</h2>}
            {section.image && <Image src={section.image} alt={section.heading || page.title} width={1200} height={800} sizes="(min-width: 1024px) 65vw, 90vw" className="h-auto max-h-[35rem] w-full rounded-md object-contain" />}
            {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="klk-body whitespace-pre-line text-klk-text-secondary">{paragraph}</p>)}
            {section.links && <ul className="space-y-3">{section.links.map((link, linkIndex) => <li key={linkIndex}><Link href={link.href === page.source ? link.href : localSourceLink(link.href)} className="klk-body-small inline-flex max-w-full items-center gap-3 text-klk-primary underline decoration-klk-lime underline-offset-4 hover:text-klk-brand-blue">{link.label}<ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link></li>)}</ul>}
          </section>)}
          {ingredients && <MarketCatalogue ingredients={ingredients} />}
        </div>
        <aside className="h-fit rounded-md bg-klk-surface p-6">
          <h2 className="klk-h6 text-klk-primary">Explore KLK OLEO</h2>
          <ul className="klk-body-small mt-5 space-y-4">
            <li><Link href="/markets" className="hover:text-klk-primary">Markets & Applications</Link></li>
            <li><Link href="/products" className="hover:text-klk-primary">Our Products</Link></li>
            <li><Link href="/sustainability" className="hover:text-klk-primary">Sustainability</Link></li>
            <li><Link href="/product-enquiry" className="hover:text-klk-primary">Product Enquiry</Link></li>
            <li><Link href="/news-events/archive" className="hover:text-klk-primary">News Archive</Link></li>
            <li><Link href="/site-directory" className="hover:text-klk-primary">All Pages</Link></li>
          </ul>
          <Link href={page.source} className="klk-caption mt-8 block text-klk-text-secondary underline">Official source</Link>
        </aside>
      </div>
    </article>
  </PrototypePageShell>;
}

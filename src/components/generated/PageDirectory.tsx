import Image from "next/image";
import Link from "next/link";
import { generatedBannerImage, generatedPages } from "@/lib/generated/pages";

export function PageDirectory({ marketsOnly = false }: { marketsOnly?: boolean }) {
  const markets = generatedPages.filter(page => page.category === "Markets");
  const otherPages = generatedPages.filter(page => !page.slug.startsWith("news-events/") && page.category !== "Markets");
  return <section className="klk-section bg-white"><div className="klk-container">
    <h2 className="klk-h2 mb-8 text-klk-primary">Solutions For Every Industry</h2>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{markets.map(page => <Link key={page.slug} href={`/${page.slug}`} className="group overflow-hidden rounded-md border border-klk-border bg-klk-surface shadow-klk"><div className="relative aspect-[1.6]"><Image src={generatedBannerImage(page)} alt={page.title} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div><h3 className="klk-h5 p-6 text-klk-primary">{page.title}</h3></Link>)}</div>
    {!marketsOnly && <><h2 className="klk-h2 mb-8 mt-16 text-klk-primary">Company & Resources</h2><ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{otherPages.map(page => <li key={page.slug}><Link href={`/${page.slug}`} className="klk-body-small block h-full rounded-md border border-klk-border p-5 text-klk-primary hover:bg-klk-surface">{page.title}</Link></li>)}{[{ title: "News & Events Archive", slug: "news-events/archive" }, { title: "Product Enquiry", slug: "product-enquiry" }, { title: "About Us", slug: "about-us" }, { title: "Our Products", slug: "products" }, { title: "Contact Us", slug: "contact-us" }].map(page => <li key={page.slug}><Link href={`/${page.slug}`} className="klk-body-small block h-full rounded-md border border-klk-border p-5 text-klk-primary hover:bg-klk-surface">{page.title}</Link></li>)}</ul></>}
  </div></section>;
}

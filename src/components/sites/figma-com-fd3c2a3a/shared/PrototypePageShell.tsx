import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HeaderHero } from "../proto-klk-oleo-2026-95f6cd74/HeaderHero";
import { CookieBanner, ProductExperience, SiteFooter } from "../proto-klk-oleo-2026-95f6cd74/ProductExperienceFooter";

export const prototypeImageRoot = "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

export function PrototypePageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-klk-text">
      <HeaderHero compact />
      {children}
      <SiteFooter />
      <ProductExperience showFinder={false} />
      <CookieBanner />
    </main>
  );
}

export function PrototypeBreadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="relative z-10 min-h-9 bg-[linear-gradient(90deg,var(--klk-primary)_0%,var(--klk-brand-blue)_55%,var(--klk-lime)_100%)] py-2 text-white">
      <div className="klk-container klk-caption flex flex-wrap items-center gap-2">
        <Link href="/" className="text-white/80 transition-colors hover:text-white">Home</Link>
        {items.map((item) => <span key={item.label} className="flex items-center gap-2"><ChevronRight aria-hidden="true" className="size-3" />{item.href ? <Link href={item.href} className="transition-colors hover:text-white/80">{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}
      </div>
    </nav>
  );
}

export function PrototypePageBanner({ title, image, breadcrumbs }: { title: string; image: string; breadcrumbs: Array<{ label: string; href?: string }> }) {
  return (
    <section className="relative isolate overflow-hidden bg-klk-darker">
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-klk-darker/90 via-klk-darker/25 to-transparent" />
      <PrototypeBreadcrumbs items={breadcrumbs} />
      <div className="klk-container relative flex min-h-[16.25rem] items-center py-12 md:min-h-[25rem]">
        <h1 className="klk-h1 max-w-4xl text-white">{title}</h1>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { destinationFor } from "@/lib/klk-links";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const imageRoot =
  "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

const heroSlides = [
  {
    image: `${imageRoot}/extracted-emmerich-hero.jpg`,
    eyebrow: "Everyday Convenience",
    title: "To Global Solutions",
    position: "object-center",
  },
  {
    image: `${imageRoot}/2026-05-26-New-Website-KLK-OLEO-Banner-Enriching-Human-Lives-Everyday.png`,
    eyebrow: "Enriching Human Lives",
    title: "Every Day",
    position: "object-center",
  },
  {
    image: `${imageRoot}/About-KLK-OLEO-MKLK-scaled.jpg`,
    eyebrow: "A Global Oleochemical Producer",
    title: "Built On 30 Years Of Excellence",
    position: "object-center",
  },
  {
    image: `${imageRoot}/2026-01-Global-Presence_English-1.jpg`,
    eyebrow: "Strategically Connected",
    title: "A Truly Global Presence",
    position: "object-center",
  },
  {
    image: `${imageRoot}/Market-Image_Life-Science.png`,
    eyebrow: "Inspired By Nature",
    title: "Advancing Life Sciences",
    position: "object-center",
  },
  {
    image: `${imageRoot}/Lubricant-01.png`,
    eyebrow: "High Performance Solutions",
    title: "For Modern Industry",
    position: "object-center",
  },
  {
    image: `${imageRoot}/bg02-01.jpg`,
    eyebrow: "Responsible Chemistry",
    title: "For A Better Tomorrow",
    position: "object-center",
  },
  {
    image: `${imageRoot}/ESG-Palm-Fruit-01.png`,
    eyebrow: "Sustainability At Heart",
    title: "Creating Lasting Value",
    position: "object-center",
  },
] as const;

const productGroups = [
  { title: "Products", items: ["Amides", "Anionic Surfactants", "Esters"] },
  { title: "Oleo Basics", items: ["Fatty Acids", "Fatty Alcohols", "Glycerine"] },
  { title: "Specialties", items: ["Nonionic Surfactants", "Phytonutrients"] },
] as const;

const navItems = ["About Us", "Products", "Markets", "Career", "News & Events", "Contact Us"] as const;

const navTargets: Record<(typeof navItems)[number], string> = {
  "About Us": "/about-us",
  Products: "/products",
  Markets: "/#solutions",
  Career: destinationFor("Career"),
  "News & Events": "/news-events",
  "Contact Us": "/contact-us",
};

export function HeaderHero({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const darkHeader = scrolled || headerHovered || menuOpen;

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 8);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

  const openSearch = () => {
    window.dispatchEvent(new Event("open-product-search"));
    setMenuOpen(false);
  };


  return (
    <section className={compact ? "relative h-[4.25rem] md:h-[5.625rem]" : "relative h-[36.875rem] overflow-hidden bg-klk-darker md:h-[44.625rem]"}>
      <header
        data-dark={darkHeader}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        className={`site-header fixed inset-x-0 top-0 z-50 h-[4.25rem] border-b backdrop-blur-[0.625rem] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 md:h-[5.625rem] ${darkHeader ? "border-white/10 bg-klk-darker/95" : "border-klk-primary/10 bg-white/90"}`}
      >
        <div className="klk-container flex h-full items-center justify-between gap-4">
          <Link href="/#top" aria-label="KLK OLEO home" className="relative block h-10 w-[7.875rem] shrink-0 md:h-14 md:w-[9.375rem] xl:h-20 xl:w-[13.125rem]">
            <Image
              src={`${imageRoot}/KLK-OLEO-Header-Logo-1.png`}
              alt="KLK OLEO"
              fill
              sizes="(max-width: 767px) 126px, (max-width: 1199px) 150px, 174px"
              className={`object-contain transition-[filter] duration-300 ${darkHeader ? "brightness-0 invert" : ""}`}
            />
          </Link>

          <nav aria-label="Primary navigation" className="ml-auto hidden min-w-0 items-center gap-4 min-[56.25rem]:flex xl:mr-8 xl:gap-9">
            {navItems.map((item) =>
              item === "Career" ? (
                <span key={item} aria-disabled="true" title="No linked Career page in the prototype" className={`klk-overline whitespace-nowrap font-semibold ${darkHeader ? "text-white" : "text-klk-primary"}`}>Career</span>
              ) : item === "Products" ? (
                <div key={item} className="group relative flex h-[5.625rem] items-center">
                  <Link
                    href="/products"
                    aria-current={pathname.startsWith("/products") ? "page" : undefined}
                    className={`klk-overline flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors hover:text-klk-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-klk-lime xl:gap-2 ${darkHeader ? "text-white" : "text-klk-primary"}`}
                  >
                    Products
                    <ChevronDown aria-hidden="true" className="h-4 w-4 fill-klk-lime stroke-klk-lime transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  </Link>
                  <div className="invisible absolute right-[-18.125rem] top-full w-[47.5rem] translate-y-2 border-t-2 border-klk-lime bg-white p-8 opacity-0 shadow-[var(--klk-shadow-raised)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="grid grid-cols-3 gap-9">
                      {productGroups.map((group) => (
                        <div key={group.title}>
                          <p className="klk-body-small mb-4 border-b border-klk-primary/15 pb-3 font-semibold uppercase tracking-[0.04em] text-klk-darker">
                            {group.title}
                          </p>
                          <ul className="space-y-3">
                            {group.items.map((item) => (
                              <li key={item}>
                                <Link href={destinationFor(item)} className="klk-body-small font-medium normal-case tracking-normal text-klk-text-secondary transition-colors hover:text-klk-primary">
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item}
                  href={navTargets[item]}
                  aria-current={pathname === navTargets[item] ? "page" : undefined}
                  className={`klk-overline flex items-center gap-1.5 whitespace-nowrap font-semibold transition-colors hover:text-klk-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-klk-lime xl:gap-2 ${darkHeader ? "text-white" : "text-klk-primary"}`}
                >
                  {item}
                  {(item === "About Us" || item === "Markets" || item === "Contact Us") && (
                    <ChevronDown aria-hidden="true" className="h-4 w-4 fill-klk-lime stroke-klk-lime" />
                  )}
                </Link>
              ),
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-3 md:gap-4 min-[56.25rem]:gap-2 xl:gap-4">
            <button
              type="button"
              aria-label="Open product search"
              onClick={openSearch}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-klk-lime shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klk-lime md:h-11 md:w-11"
            >
              <Search aria-hidden="true" className="h-[1.125rem] w-[1.125rem] stroke-[3]" />
            </button>
            <details className="group relative hidden sm:block">
              <summary aria-label="Change language" className="klk-caption flex h-11 cursor-pointer list-none items-center gap-1 rounded-xs bg-klk-primary px-3 font-semibold text-white transition-colors hover:bg-klk-primary-hover active:bg-klk-primary-active">
                EN <ChevronDown aria-hidden="true" className="h-3 w-3 fill-white" />
              </summary>
              <div className="absolute right-0 top-full mt-2 min-w-32 rounded-sm bg-white p-2 text-sm text-klk-primary shadow-[var(--klk-shadow-raised)]">
                <Link href="/" className="block rounded-xs px-3 py-2 hover:bg-klk-surface">English</Link>
                <Link href="https://www.klkoleo.com/de/" className="block rounded-xs px-3 py-2 hover:bg-klk-surface">Deutsch</Link>
                <Link href="https://www.klkoleo.com/cn/" className="block rounded-xs px-3 py-2 hover:bg-klk-surface">中文</Link>
              </div>
            </details>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex h-11 w-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-klk-lime min-[56.25rem]:hidden ${darkHeader ? "text-white" : "text-klk-primary"}`}
            >
              {menuOpen ? <X aria-hidden="true" className="h-7 w-7" /> : <Menu aria-hidden="true" className="h-7 w-7" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`absolute inset-x-0 top-full max-h-[calc(100vh-4.25rem)] overflow-y-auto border-t border-klk-primary/10 bg-white shadow-[var(--klk-shadow-raised)] transition-[opacity,transform,visibility] duration-300 min-[56.25rem]:hidden ${
            menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <nav aria-label="Mobile navigation" className="klk-container py-5">
            <Link href="/about-us" onClick={() => setMenuOpen(false)} className="block border-b border-klk-primary/10 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-klk-primary">
              About Us
            </Link>
            <details className="group border-b border-klk-primary/10">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold uppercase tracking-[0.04em] text-klk-primary">
                Products
                <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <Link href="/products" onClick={() => setMenuOpen(false)} className="mb-4 block text-sm font-semibold text-klk-primary">View all products</Link>
              <div className="grid gap-5 pb-5 sm:grid-cols-3">
                {productGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-klk-darker">{group.title}</p>
                    {group.items.map((item) => (
                      <Link key={item} href={destinationFor(item)} onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-klk-text-secondary">
                        {item}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </details>
            {navItems.slice(2).map((item) => item === "Career" ? <span key={item} aria-disabled="true" title="No linked Career page in the prototype" className="block border-b border-klk-primary/10 py-4 text-sm font-semibold uppercase text-klk-primary">Career</span> : (
              <Link
                key={item}
                href={navTargets[item]}
                  aria-current={pathname === navTargets[item] ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-klk-primary/10 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-klk-primary last:border-b-0"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {!compact && <>
      <div id="top" className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={`${slide.image}-${index}`}
            aria-hidden={activeSlide !== index}
            className={`absolute inset-0 transition-[opacity,transform] duration-600 ease-out motion-reduce:transition-none ${
              activeSlide === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.025] opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              className={`object-cover ${slide.position}`}
            />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,63,39,0.86)_100%)]" />

      {heroSlides.map((slide, index) => (
        <div
          key={`${slide.title}-${index}`}
          aria-hidden={activeSlide !== index}
          className={`absolute bottom-[4.625rem] left-[1.375rem] right-[1.375rem] z-10 text-white transition-[opacity,transform] duration-600 motion-reduce:transition-none md:bottom-[5.125rem] md:left-[2.625rem] md:right-auto ${
            activeSlide === index ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <p className="klk-h3 font-normal text-white drop-shadow-sm">{slide.eyebrow}</p>
          <h1 className="klk-h1 mt-2 w-full max-w-5xl text-white drop-shadow-sm md:mt-3">
            {slide.title}
          </h1>
        </div>
      ))}

      <div className="absolute bottom-[1.625rem] left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Hero slides">
        {heroSlides.map((slide, index) => (
          <button
            key={`${slide.title}-dot`}
            type="button"
            role="tab"
            aria-selected={activeSlide === index}
            aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
            onClick={() => setActiveSlide(index)}
            className={`h-3 w-3 rounded-full border border-white shadow-sm transition-colors motion-reduce:transition-none ${
              activeSlide === index ? "bg-klk-lime" : "bg-white/85 hover:bg-white"
            }`}
          />
        ))}
      </div>
      </>}
    </section>
  );
}

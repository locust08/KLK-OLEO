"use client";

import Image from "next/image";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const imageRoot =
  "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

const heroSlides = [
  {
    image: `${imageRoot}/slide01-03.jpg`,
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
  {
    title: "Oleo Basics",
    items: ["Fatty Acids", "Fatty Alcohols", "Glycerine", "Fatty Esters"],
  },
  {
    title: "Specialties",
    items: ["Surfactants", "Emollients", "Phytonutrients", "Food Ingredients"],
  },
  {
    title: "Markets",
    items: ["Personal Care", "Home Care", "Life Science", "Industrial Solutions"],
  },
] as const;

const navItems = ["About Us", "Products", "Markets", "Career", "News & Events", "Contact Us"] as const;

const navTargets: Record<(typeof navItems)[number], string> = {
  "About Us": "#about-us",
  Products: "#products",
  Markets: "#solutions",
  Career: "#contact-us",
  "News & Events": "#news",
  "Contact Us": "#contact-us",
};

export function HeaderHero() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
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

  const isDarkHeader = isScrolled || headerHovered || menuOpen;

  return (
    <section className="relative h-[590px] overflow-hidden bg-[#003f27] md:h-[714px]">
      <header
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        onFocusCapture={() => setHeaderHovered(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setHeaderHovered(false);
          }
        }}
        className={`fixed inset-x-0 top-0 z-50 h-[68px] border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 md:h-[90px] ${
          isDarkHeader
            ? "border-[#7bbf2a]/35 bg-[#003f27]/95 shadow-[0_8px_30px_rgba(0,35,22,0.24)] backdrop-blur-[14px]"
            : "border-transparent bg-white/70 backdrop-blur-[10px]"
        }`}
      >
        <div className="flex h-full items-center justify-between gap-4 px-[18px] md:px-7 xl:px-10">
          <a href="#top" aria-label="KLK OLEO home" className="relative block h-10 w-[126px] shrink-0 md:h-14 md:w-[150px] xl:h-16 xl:w-[174px]">
            <Image
              src={`${imageRoot}/KLK-OLEO-Header-Logo-1.png`}
              alt="KLK OLEO"
              fill
              sizes="(max-width: 767px) 126px, (max-width: 1199px) 150px, 174px"
              className={`object-contain transition-[filter] duration-300 ${isDarkHeader ? "brightness-0 invert" : ""}`}
            />
          </a>

          <nav aria-label="Primary navigation" className="hidden min-w-0 items-center gap-4 min-[900px]:flex xl:gap-8">
            {navItems.map((item) =>
              item === "Products" ? (
                <div key={item} className="group relative flex h-[90px] items-center">
                  <button
                    type="button"
                    onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                    className={`flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.03em] transition-colors hover:text-[#7bbf2a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7bbf2a] xl:gap-2 xl:text-[13px] xl:tracking-[0.04em] ${
                      isDarkHeader ? "text-white" : "text-[#006b3f]"
                    }`}
                  >
                    Products
                    <ChevronDown aria-hidden="true" className="h-4 w-4 fill-[#7bbf2a] stroke-[#7bbf2a] transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  </button>
                  <div className="invisible absolute right-[-290px] top-full w-[760px] translate-y-2 border-t-2 border-[#7bbf2a] bg-white p-8 opacity-0 shadow-[0_18px_50px_rgba(0,63,39,0.18)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <div className="grid grid-cols-3 gap-9">
                      {productGroups.map((group) => (
                        <div key={group.title}>
                          <p className="mb-4 border-b border-[#006b3f]/15 pb-3 text-[14px] font-semibold uppercase tracking-[0.04em] text-[#003f27]">
                            {group.title}
                          </p>
                          <ul className="space-y-3">
                            {group.items.map((item) => (
                              <li key={item}>
                                <a href="#products" className="text-[13px] font-medium normal-case tracking-normal text-[#4b5e54] transition-colors hover:text-[#006b3f]">
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  key={item}
                  href={navTargets[item]}
                  className={`flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.03em] transition-colors hover:text-[#7bbf2a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7bbf2a] xl:gap-2 xl:text-[13px] xl:tracking-[0.04em] ${
                    isDarkHeader ? "text-white" : "text-[#006b3f]"
                  }`}
                >
                  {item}
                  {(item === "About Us" || item === "Markets" || item === "Contact Us") && (
                    <ChevronDown aria-hidden="true" className="h-4 w-4 fill-[#7bbf2a] stroke-[#7bbf2a]" />
                  )}
                </a>
              ),
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-3 md:gap-4 min-[900px]:gap-2 xl:gap-4">
            <button
              type="button"
              aria-label="Open product search"
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#7bbf2a] shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7bbf2a] md:h-10 md:w-10"
            >
              <Search aria-hidden="true" className="h-[18px] w-[18px] stroke-[3]" />
            </button>
            <button
              type="button"
              aria-label="Change language"
              className={`hidden h-10 items-center gap-1 rounded-[3px] px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7bbf2a] sm:flex ${
                isDarkHeader
                  ? "bg-[#7bbf2a] text-[#003f27] hover:bg-[#8dcc36]"
                  : "bg-[#006b3f] text-white hover:bg-[#005331]"
              }`}
            >
              EN
              <ChevronDown aria-hidden="true" className={`h-3 w-3 ${isDarkHeader ? "fill-[#003f27]" : "fill-white"}`} />
            </button>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex h-10 w-10 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7bbf2a] min-[900px]:hidden ${
                isDarkHeader ? "text-white" : "text-[#006b3f]"
              }`}
            >
              {menuOpen ? <X aria-hidden="true" className="h-7 w-7" /> : <Menu aria-hidden="true" className="h-7 w-7" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`absolute inset-x-0 top-full max-h-[calc(100vh-68px)] overflow-y-auto border-t border-[#006b3f]/10 bg-white px-[22px] shadow-[0_20px_40px_rgba(0,63,39,0.14)] transition-[opacity,transform,visibility] duration-300 min-[900px]:hidden ${
            menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <nav aria-label="Mobile navigation" className="py-5">
            <a href="#about-us" onClick={() => setMenuOpen(false)} className="block border-b border-[#006b3f]/10 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-[#006b3f]">
              About Us
            </a>
            <details className="group border-b border-[#006b3f]/10">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-semibold uppercase tracking-[0.04em] text-[#006b3f]">
                Products
                <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid gap-5 pb-5 sm:grid-cols-3">
                {productGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.04em] text-[#003f27]">{group.title}</p>
                    {group.items.map((item) => (
                      <a key={item} href="#products" onClick={() => setMenuOpen(false)} className="block py-1.5 text-sm text-[#4b5e54]">
                        {item}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </details>
            {navItems.slice(2).map((item) => (
              <a
                key={item}
                href={navTargets[item]}
                onClick={() => setMenuOpen(false)}
                className="block border-b border-[#006b3f]/10 py-4 text-sm font-semibold uppercase tracking-[0.04em] text-[#006b3f] last:border-b-0"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

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
          className={`absolute bottom-[74px] left-[22px] right-[22px] z-10 text-white transition-[opacity,transform] duration-600 motion-reduce:transition-none md:bottom-[82px] md:left-[42px] md:right-auto ${
            activeSlide === index ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <p className="text-[25px] font-normal leading-tight tracking-[-0.02em] drop-shadow-sm md:text-[46px]">{slide.eyebrow}</p>
          <h1 className="mt-2 max-w-[1100px] text-[42px] font-normal leading-[0.98] tracking-[-0.025em] drop-shadow-sm md:mt-3 md:text-[78px]">
            {slide.title}
          </h1>
        </div>
      ))}

      <div className="absolute bottom-[26px] left-1/2 z-20 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Hero slides">
        {heroSlides.map((slide, index) => (
          <button
            key={`${slide.title}-dot`}
            type="button"
            role="tab"
            aria-selected={activeSlide === index}
            aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
            onClick={() => setActiveSlide(index)}
            className={`h-3 w-3 rounded-full border border-white shadow-sm transition-colors motion-reduce:transition-none ${
              activeSlide === index ? "bg-[#7bbf2a]" : "bg-white/85 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { FaAnglesRight } from "react-icons/fa6";
import { ProductCategoryCarousel } from "@/components/home/ProductCategoryCarousel";
import { HomeFaq } from "@/components/home/HomeFaq";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { siteAssets } from "@/data/site-assets";
import type { BannerViewModel, PageContentViewModel } from "@/lib/cms/view-models";

const capabilities = [
  {
    title: "Global Reach, Local Impact",
    copy: "Delivering solutions that advance sustainability across diverse agricultural needs locally and globally.",
    image: siteAssets.whatWeDoGlobal,
  },
  {
    title: "Tailored Agricultural Solutions",
    copy: "Powered by strong R&D, product development, and agronomic expertise to deliver solutions to meet modern agricultural challenges practically.",
    image: siteAssets.whatWeDoTailored,
  },
  {
    title: "Comprehensive Agrochemical Portfolio",
    copy: "Delivering efficient, high-performance formulants with diverse functional ingredients for real-world agricultural success.",
    image: siteAssets.whatWeDoPortfolio,
  },
  {
    title: "Sustainable Formulation Solutions",
    copy: "Delivering solutions that advance sustainability across diverse agricultural needs locally and globally.",
    image: siteAssets.whatWeDoSustainable,
  },
];
const innovations = [["Aidigro GA2425", "Aidigro GA2425 is our latest ready-to-use surfactant blend, specially formulated to enhance the performance of Glufosinate Ammonium (GA) applications."], ["Aidigro WA1125", "Aidigro WA1125 is a low odour, non-ionic surfactant based on unique EO/PO copolymer with excellent wetting and penetrating function."]];

export function HomePage({
  page,
  banner,
}: {
  page: PageContentViewModel | null;
  banner: BannerViewModel | null;
}) {
  const [expandedCapability, setExpandedCapability] = useState<number | null>(null);
  const configuredHeroImage = banner?.imageUrl || page?.heroImageUrl;
  // Replace the previous shared banner while retaining CMS image overrides.
  const heroImage = !configuredHeroImage || configuredHeroImage === "/images/common/contact-us-agrochem.webp"
    ? siteAssets.homeHero
    : configuredHeroImage;
  const heroBrand = banner?.headline || page?.heroEyebrow || "AIDIGRO";
  const heroHeading = page?.heroHeading && page.heroHeading !== heroBrand
    ? page.heroHeading
    : banner?.body || "Comprehensive Formulation Solutions for Agrochemicals";
  const introduction = page?.heroBody || "KLK OLEO Agrochemicals is a trusted global partner in sustainable agrochemical ingredients. We are committed to delivering innovative, sustainable solutions that empower farmers and agricultural businesses to thrive and grow.";

  return <><SiteHeader /><main>
  <section className="home-hero" style={{ backgroundImage: `url(${heroImage})` }}><div className="home-hero__content"><p className="home-hero__brand">{heroBrand}</p><div className="home-hero__rule home-hero__rule--leaf" /><div className="home-hero__rule home-hero__rule--gold" /><h1>{heroHeading}</h1></div></section>
  <section className="intro-section"><div className="split-intro"><div className="intro-media"><Image src={siteAssets.homeIntroduction} width={900} height={934} alt="A young plant growing from soil" /></div><div className="intro-copy"><p className="eyebrow">About Us</p><h2>KLK OLEO Agrochemicals</h2><p>{introduction}</p><ul><li>Backed by KLK OLEO’s global oleochemical expertise and decades of manufacturing excellence.</li><li>AIDIGRO represents quality, innovation, and a commitment to effecient, sustainable agriculture.</li><li>Committed to high quality, safety standards, and comprehensive regulatory compliance.</li><li>Championing sustainability through plant-derived ingredients that drive responsible agriculture and environmentally conscious innovation.</li></ul><PrimaryButton href="/about-us">Learn More <FaAnglesRight aria-hidden="true" /></PrimaryButton></div></div></section>
  <section className="capability-section"><p className="eyebrow">What We Do</p><h2>Your Trusted Global Partner in Agrochemicals</h2><div className="capability-grid">{capabilities.map(({ title, copy, image }, index) => <article key={title} className={`capability capability--${index + 1}`} tabIndex={0} role="button" aria-label={title} aria-expanded={expandedCapability === index} onClick={() => setExpandedCapability(current => current === index ? null : index)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setExpandedCapability(current => current === index ? null : index); } }}><div className="capability__panel capability__panel--front" style={{ backgroundImage: `url(${image})` }}><h3>{title}</h3></div><div className="capability__panel capability__panel--back"><p>{copy}</p></div></article>)}</div></section>
  <section className="innovation-section" style={{ backgroundImage: `url(${siteAssets.latestInnovations})` }}><p className="eyebrow">Features</p><h2>Our Latest Innovations</h2><div className="innovation-grid">{innovations.map(([title, copy], index) => <article key={title} className={`innovation-card innovation-card--${index + 1}`}><h3>{title}</h3><p>{copy}</p><PrimaryButton href="/products">Learn More <FaAnglesRight aria-hidden="true" /></PrimaryButton></article>)}</div></section>
  <section className="finder-cta"><div className="finder-copy finder-copy--title finder-reveal"><p className="eyebrow">Product Finder</p><h2>Looking for a Product? Use Our Product Finder!</h2></div><div className="finder-copy finder-copy--action finder-reveal"><p>Discover the right solution faster with our Product Finder, designed to help you explore our portfolio with ease.</p><PrimaryButton href="/products">Product Finder <FaAnglesRight aria-hidden="true" /></PrimaryButton></div><ProductCategoryCarousel /></section>
  <HomeFaq />
  <section className="contact-cta contact-cta--image" style={{ backgroundImage: `url(${siteAssets.contactBackground})` }}><div className="contact-cta__content" data-reveal="up"><p className="eyebrow">Contact Us</p><h2>Still Can&apos;t Find What You&apos;re Looking For?</h2><p className="contact-cta__message">Contact our team and we’ll help you identify the right solution.</p><PrimaryButton href="/contact">Contact Us <FaAnglesRight aria-hidden="true" /></PrimaryButton></div>
  </section></main><SiteFooter /></>; }

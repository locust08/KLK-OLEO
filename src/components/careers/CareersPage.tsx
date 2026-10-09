"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CalendarDays, Factory, FlaskConical, Globe2, MapPin, Users, HandHeart, ShieldCheck, Leaf } from "lucide-react";
import { PrototypeBreadcrumbs } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

const assetRoot = "/images/generated/company";
const benefits = [
  { label: "Global Impact", title: "Global Impact, Sustainable Future", body: "Be part of a company that plays a key role in the global oleochemical industry, delivering sustainable solutions that are used in everyday products worldwide. Your work contributes to responsible innovation and a greener future.", image: "f44dd769f0-2026-05-13-Website-Career-page-Link-Global-Impact-R3b-1024x683.png", alt: "Aerial view of a KLK OLEO production complex surrounded by greenery" },
  { label: "Career Growth", title: "Growth & Development Opportunities", body: "We invest in our people through continuous learning, training programs, and career advancement opportunities—helping you build a long-term, rewarding career.", image: "d88d6f27c5-2026-05-13-Website-Career-page-Link-Career-Growth-1024x683.jpg", alt: "Colleagues sharing knowledge and developing their careers" },
  { label: "Work Culture", title: "Collaborative & Inclusive Culture", body: "Work in a diverse, supportive environment where teamwork, respect, and open communication empower you to thrive and make meaningful contributions.", image: "73ca5c4bb8-2026-05-13-Website-Career-page-Link-Work-Culture-1024x683.jpg", alt: "The diverse KLK OLEO team working together" },
] as const;

const metrics = [
  { value: 100, suffix: "+", label: "Years", icon: CalendarDays },
  { value: 4000, suffix: "+", label: "Employees", icon: Users },
  { value: 8, suffix: "", label: "Countries", icon: MapPin },
  { value: 16, suffix: "", label: "Operating Facilities", icon: Factory },
  { value: 4, suffix: "", label: "R&D Centres", icon: FlaskConical },
  { value: 6, suffix: "", label: "Global Sales Offices", icon: Globe2 },
] as const;

function CareersMetrics() {
  const root = useRef<HTMLDListElement>(null);
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const started = performance.now();
      const tick = (now: number) => {
        const elapsed = Math.max(0, Math.min((now - started) / 2000, 1));
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.2 });
    observer.observe(root.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return (
    <dl ref={root} className="mx-auto mt-8 grid max-w-[60rem] grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 md:gap-y-8">
      {metrics.map(({ value, suffix, label, icon: Icon }) => (
        <div key={label} className="grid min-w-0 grid-cols-1 items-center justify-items-center gap-2 bg-transparent py-2 text-center md:grid-cols-[auto_1fr] md:gap-x-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-klk-primary md:row-span-2 lg:size-14"><Icon aria-hidden="true" className="size-6 text-white lg:size-7" /></span>
          <dt className="klk-body-small row-start-3 text-white/90 md:col-start-2 md:row-start-2">{label}</dt>
          <dd className="klk-h4 row-start-2 text-white md:col-start-2 md:row-start-1"><span aria-hidden="true">{Math.round(value * progress).toLocaleString("en-US")}{suffix}</span><span className="sr-only">{value.toLocaleString("en-US")}{suffix}</span></dd>
        </div>
      ))}
    </dl>
  );
}

export function CareersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-klk-darker" aria-labelledby="careers-heading">
        <Image src="/images/careers/hero.png" alt="KLK OLEO engineers at an oleochemical production facility" fill preload sizes="100vw" className="object-cover object-[70%_center] md:object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-klk-darker/90 via-klk-darker/25 to-transparent" />
        <PrototypeBreadcrumbs items={[{ label: "Careers" }]} />
        <div className="klk-container relative flex min-h-[23rem] items-center pt-10 pb-20 md:min-h-[28rem] md:pt-12 md:pb-24">
          <div className="max-w-[30rem] md:max-w-[28rem]">
            <h1 id="careers-heading" className="klk-h1 mb-6 text-white">Careers</h1>
            <p className="klk-body text-white">Empower your future with a global leader in oleochemicals. Join our diverse team of innovators and experts as we drive sustainable growth and create impactful solutions for a better world.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 h-0 bg-transparent" aria-label="Your future at KLK OLEO">
        <div className="klk-container">
          <nav aria-label="Careers sections" className="relative -top-12 grid grid-cols-2 gap-3 md:-top-16 md:grid-cols-4 md:gap-5">
            {[{ label: "Why Choose Us", href: "#why", icon: HandHeart, image: `${assetRoot}/5583c3cab6-cr-environment-01.jpg` }, { label: "Life at KLK OLEO", href: "#life", icon: ShieldCheck, image: "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images/about-top-slider.jpg" }, { label: "Global Presence", href: "#global", icon: Globe2, image: `${assetRoot}/${benefits[0].image}` }, { label: "Explore Careers", href: "#JL", icon: BriefcaseBusiness, image: "/images/careers/hero.png" }].map(({ label, href, icon: Icon, image }) => (
              <a key={href} href={href} aria-label={label} className="group relative isolate block aspect-[1.9] overflow-hidden rounded-md border border-white/80 bg-klk-primary shadow-md">
                <Image src={image} alt="" fill sizes="(max-width: 767px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-klk-primary/65 via-klk-primary/20 to-transparent" />
                <span className="absolute top-4 left-4 flex size-12 items-center justify-center rounded-full bg-klk-surface/95 text-klk-primary md:top-5 md:left-5 lg:size-16"><Icon aria-hidden="true" strokeWidth={1.5} className="size-6 lg:size-8" /></span>
                <span className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-white text-klk-primary transition-colors group-hover:bg-klk-surface md:right-4 md:bottom-4 lg:size-10"><ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" /></span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section id="why" className="klk-section relative isolate overflow-hidden bg-klk-surface pt-[clamp(13rem,60vw,22rem)] md:pt-[clamp(7rem,12vw,13rem)]" aria-labelledby="why-heading">
        <Image src="/images/careers/why-background.png" alt="" fill sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-white/80" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent md:h-32" />
        <div className="klk-container relative">
          <h2 id="why-heading" className="klk-h2 mb-8 text-center text-klk-primary">Why Choose Us</h2>
          <div role="tablist" aria-label="Why choose KLK OLEO" className="mb-8 flex flex-wrap justify-center gap-3">
            {benefits.map(({ label }, index) => <button key={label} ref={el => { tabRefs.current[index] = el; }} id={`career-tab-${index}`} role="tab" aria-selected={activeTab === index} aria-controls={`career-panel-${index}`} tabIndex={activeTab === index ? 0 : -1} onClick={() => setActiveTab(index)} onKeyDown={event => {
              let next = activeTab;
              if (event.key === "ArrowRight") next = (activeTab + 1) % benefits.length;
              else if (event.key === "ArrowLeft") next = (activeTab + benefits.length - 1) % benefits.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = benefits.length - 1;
              else return;
              event.preventDefault(); setActiveTab(next); tabRefs.current[next]?.focus();
            }} className={`klk-button min-h-11 rounded-sm border px-5 py-3 transition-colors motion-reduce:transition-none ${activeTab === index ? "border-klk-primary bg-klk-primary text-white" : "border-klk-border bg-white text-klk-primary hover:bg-klk-surface-subtle"}`}>{label}</button>)}
          </div>
          {benefits.map(({ title, body, image, alt }, index) => (
            <div key={title} id={`career-panel-${index}`} role="tabpanel" aria-labelledby={`career-tab-${index}`} hidden={activeTab !== index} tabIndex={0}>
              <div className="mx-auto grid max-w-[60rem] items-center gap-6 rounded-md bg-white/90 p-5 shadow-md md:grid-cols-2 md:gap-8 md:p-8">
                <figure className="relative aspect-[1.5] overflow-hidden rounded-sm bg-klk-surface-subtle"><Image src={`${assetRoot}/${image}`} alt={alt} fill sizes="(max-width: 767px) 100vw, 45vw" className="object-cover" /></figure>
                <div className="text-center"><h3 className="klk-h4 mb-4 text-klk-primary">{title}</h3><p className="klk-body text-klk-text-secondary">{body}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="life" className="klk-section bg-white" aria-labelledby="life-heading">
        <div className="klk-container">
          <h2 id="life-heading" className="klk-h2 mb-6 text-center text-klk-primary">Life at KLK OLEO</h2>
          <p className="klk-body mx-auto max-w-[60rem] text-center text-klk-text-secondary">At KLK OLEO, we don’t just manufacture products, we create the building blocks for a more sustainable world. Join a global team of innovators dedicated to excellence in oleochemicals and making a tangible difference in the industries we serves.</p>
          <div className="mx-auto mt-8 grid max-w-[60rem] gap-6 md:grid-cols-2">
            {[{ title: "Meaningful Work", image: "efcbadd7e2-2026-05-13-Website-Career-page-Link-Meaninggul-Work-1024x575.png", body: "At KLK OLEO, meaningful work means creating real impact, from sustainable living to green chemistry and global supply chain." }, { title: "People First", image: "45be1688a5-2026-05-13-Website-Career-page-Link-People-First-1024x575.png", body: "We value our people, nurturing talent, diversity, and an inclusive workplace culture." }].map(({ title, image, body }) => (
              <article key={title} className="group overflow-hidden rounded-md border border-klk-border bg-white shadow-md">
                <div className="relative aspect-video overflow-hidden"><Image src={`${assetRoot}/${image}`} alt={title === "People First" ? "KLK OLEO colleagues collaborating in the laboratory" : "A KLK OLEO scientist examining a sample in the laboratory"} fill sizes="(max-width: 767px) 100vw, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none" /></div>
                <div className="flex items-start gap-4 p-5 md:p-6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-klk-primary text-white">{title === "People First" ? <Users aria-hidden="true" className="size-6" /> : <Leaf aria-hidden="true" className="size-6" />}</span>
                  <div><h3 className="klk-h5 mb-3 text-klk-primary">{title}</h3><p className="klk-body-small text-klk-text-secondary">{body}</p>{title === "People First" && <Link href="/about-us#core-values" className="klk-body-small mt-4 inline-flex items-center gap-2 font-semibold text-klk-primary underline decoration-klk-border underline-offset-4 hover:decoration-klk-primary">Learn more about our Core Values here.<ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link>}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="global" className="klk-section relative isolate overflow-hidden bg-klk-darker" aria-labelledby="global-heading">
        <Image src="/images/careers/world-map.png" alt="" fill sizes="100vw" className="object-cover object-center md:object-fill" />
        <div className="klk-container relative">
          <h2 id="global-heading" className="klk-h2 mb-6 text-center text-white">Global Presence</h2>
          <p className="klk-body-small mx-auto max-w-[55rem] text-center text-white/90">We are looking for talents with passion, energy, enthusiasm; and more importantly, aligned to our <Link href="/about-us#core-values" className="underline decoration-klk-lime underline-offset-4 hover:text-klk-lime">Core Values of <strong>Teamwork, Humility, Results, Integrity, Innovation and Loyalty</strong></Link>.<br />Join us, be part of our team, and we will unlock your full potential.</p>
          <CareersMetrics />
        </div>
      </section>

      <section id="JL" className="klk-section bg-white" aria-labelledby="explore-heading">
        <div className="klk-container">
          <h2 id="explore-heading" className="klk-h2 mb-6 text-klk-primary">Explore Careers</h2>
          <p className="klk-body max-w-[60rem] text-klk-text-secondary">At KLK OLEO, we offer more than just a job, we offer the opportunity to build a meaningful career, rooted in Malaysia and reaching across the world. Whether you are in Europe, Americas, Asia or China, your journey with us begins here.</p>
          <div className="mt-10 rounded-md border border-klk-border bg-klk-surface p-6 sm:p-10">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="klk-body-small font-semibold text-klk-primary">Country<select disabled className="klk-body mt-2 block min-h-12 w-full rounded-sm border border-klk-border bg-white px-4 py-3 text-klk-text-secondary disabled:cursor-not-allowed"><option>Select Country</option></select></label>
              <label className="klk-body-small font-semibold text-klk-primary">Location<select disabled className="klk-body mt-2 block min-h-12 w-full rounded-sm border border-klk-border bg-white px-4 py-3 text-klk-text-secondary disabled:cursor-not-allowed"><option>Select Location</option></select></label>
            </div>
            <button type="button" disabled className="klk-link mt-4 text-klk-text-disabled disabled:cursor-not-allowed">Clear Filters</button>
            <p className="klk-body mt-8 text-klk-text-secondary" role="status">No posts found</p>
            <a href="https://www.klkoleo.com/careers/#JL" className="klk-link mt-4 inline-flex items-center gap-3 text-klk-primary underline underline-offset-4">Check current opportunities<ArrowRight aria-hidden="true" className="size-5" /></a>
          </div>
          <div className="mt-10 flex flex-col gap-6 rounded-md bg-klk-primary p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div><h3 className="klk-h3 mb-4">No matching role right now?</h3><p className="klk-body">Submit your resume and we will reach out first when the right role opens.</p></div>
            <a href="https://www.klkoleo.com/cv-form/" className="klk-button inline-flex min-h-11 shrink-0 items-center justify-center gap-3 self-start rounded-sm bg-white px-6 py-3 text-klk-primary transition-colors hover:bg-klk-surface motion-reduce:transition-none">Submit Here<ArrowRight aria-hidden="true" className="size-5" /></a>
          </div>
        </div>
      </section>
    </>
  );
}

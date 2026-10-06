"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PrototypePageBanner, prototypeImageRoot } from "../shared/PrototypePageShell";

const news = [
  { title: "Visit KLK OLEO At In-Cosmetics Latin America 2026", category: "Products", date: "07 Aug 2026", image: "prototype-news-latin.png", description: "In-cosmetics Latin America is taking place in São Paulo, Brazil, on 23–24 September 2026. As one of Latin America’s leading events for personal care ingredients, in-cosmetics Latin..." },
  { title: "Trusted Partner For Healthy Ageing And Healthier Living", category: "Exhibition", date: "07 Aug 2026", image: "2026-09-VItafoods-Asia-Visual-1080px--1024x1024.png", description: "Meet the KLK OLEO team at Vitafoods Asia to learn more about their sustainable, high-performance functional ingredients for food and nutrition, as well as the ..." },
  { title: "Sustainable Ingredients, Touching Lives Positively, Everyday", category: "Exhibition", date: "16 Jun 2026", image: "KLK-OLEO-in-cosmetics-Korea-1024x1024.png", description: "Visit KLK OLEO at Booth D-C60 and Innovation Zone at in-cosmetics Korea! Featured products: Sympare Sense: Transf..." },
  { title: "Celebrating 100 Years Of Excellence In Delden", category: "Corporate", date: "10 Jun 2026", image: "KKS-Site-100th-Anniversary-eBanner-1024x1024.jpg", description: "For a full century, the site along the Langestraat has been a familiar landmark for anyone passing through this corner of..." },
  { title: "Discover KLK OLEO’s Science-Led Innovations At Vitafoods Europe 2026", category: "Exhibition", date: "21 Apr 2026", image: "prototype-news-vita-europe.jpg", description: "Join KLK OLEO at Vitafoods Europe (Booth 3D240) to discover the full health potential of every bioactive ingredient. Healthy Agei..." },
  { title: "Discover Innovative Nature-Derived Products And Solutions At ChemExpo India!", category: "Products", date: "06 Apr 2026", image: "prototype-news-chemexpo.png", description: "As one of the world’s leading oleochemical producers, KLK OLEO’s products touch everyday lives across Beauty & Personal C..." },
  { title: "Discover KLK OLEO’s Sustainable Personal Care And Home Care Solutions At PCHi", category: "Exhibition", date: "03 Mar 2026", image: "prototype-news-pchi.jpg", description: "Visit KLK OLEO at Booth 8K23 to explore sustainable, high-performing oleochemical solutions designed to elevat..." },
  { title: "KLK Invites You To POC 2026", category: "Exhibition", date: "15 Jan 2026", image: "prototype-news-poc.png", description: "KLK is pleased to announce our participation in this year’s Palm and Lauric Oils Price Outlook Conference & Exhibition..." },
  { title: "Elevate Cognitive Health And Sustainable Food Solutions At Fi Europe 2025", category: "Exhibition", date: "13 Nov 2025", image: "prototype-news-fi-europe.jpg", description: "Join KLK OLEO at Fi Europe and explore innovations in cognitive health and sustainable food solutions for healthy age..." },
  { title: "New Homepage For KLK OLEO Life Science", category: "Corporate", date: "27 Oct 2025", image: "prototype-news-life-science.jpg", description: "The newly established business unit KLK OLEO Life Science now has its own homepage. Visit www.klkoleo.com/lifescie..." },
];

function NewsCard({ article, featured = false }: { article: typeof news[number]; featured?: boolean }) {
  return (
    <article className={`flex rounded-md border border-klk-border bg-white p-4 shadow-klk ${featured ? "flex-col gap-4 sm:flex-row" : "flex-col"}`}>
      <div className={`relative overflow-hidden rounded-sm ${featured ? "aspect-square w-full shrink-0 sm:w-1/2" : "aspect-[1.6] w-full"}`}>
        <Image src={`${prototypeImageRoot}/${article.image}`} alt={article.title} fill sizes={featured ? "(min-width: 768px) 24vw, 90vw" : "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"} className="object-cover" />
      </div>
      <div className={`flex flex-1 flex-col ${featured ? "justify-center py-2" : "px-4 pb-4 pt-5"}`}>
        <p className="klk-caption mb-4 text-klk-text-secondary">{article.category} <span className="px-1">•</span> {article.date}</p>
        <h3 className="klk-h6 mb-3 text-klk-primary">{article.title}</h3>
        <p className="klk-body-small mb-5 text-klk-text-secondary">{article.description}</p>
        <button type="button" disabled aria-describedby="news-prototype-note" className="klk-button mt-auto flex w-fit items-center gap-3 border-b border-klk-brand-blue pb-2 text-klk-text disabled:cursor-not-allowed disabled:opacity-60">READ MORE <ArrowRight aria-hidden="true" className="size-4 text-klk-lime" /></button>
      </div>
    </article>
  );
}

export function NewsPrototype() {
  const [category, setCategory] = useState("All");
  const archive = news.slice(2).filter((article) => category === "All" || article.category === category);
  return (
    <>
      <PrototypePageBanner title="News & Events" image={`${prototypeImageRoot}/prototype-news-booth.jpg`} breadcrumbs={[{ label: "News & Events" }]} />
      <section className="klk-section bg-white">
        <div className="klk-container">
        <h2 className="klk-h2 text-center text-klk-primary">Our Latest News</h2>
        <p className="klk-body mx-auto mt-5 mb-10 max-w-[70rem] text-center text-klk-text-secondary">Discover the latest happenings at KLK OLEO and how our sustainable oleochemical solutions touch lives positively every day. Meet us at key industry events and exhibitions across the Americas, Europe and Asia, where we showcase high-performance ingredients, science-led innovations and solutions for diverse applications and evolving market needs. From product innovation and industry events to sustainability initiatives, business milestones and the people behind our progress, explore the stories shaping KLK OLEO today and tomorrow.</p>
        <div className="grid gap-6 md:grid-cols-2">{news.slice(0, 2).map((article) => <NewsCard key={article.title} article={article} featured />)}</div>
        </div>
      </section>
      <section className="klk-section bg-klk-surface">
        <div className="klk-container">
          <div className="mb-10 flex flex-wrap items-center justify-center gap-6 rounded-md bg-klk-darker p-6 text-white">
            <label htmlFor="news-category" className="font-semibold">Filter By</label>
            <select id="news-category" value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 w-60 rounded-sm bg-klk-surface px-4 py-3 text-sm text-klk-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-klk-lime">
              <option value="All">Select Category</option><option>Exhibition</option><option>Corporate</option><option>Products</option>
            </select>
          </div>
          <p className="sr-only" role="status">Showing {archive.length} news articles{category === "All" ? "" : ` in ${category}`}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{archive.map((article) => <NewsCard key={article.title} article={article} />)}</div>
          <p id="news-prototype-note" className="sr-only">Article detail pages are not linked in the supplied prototype.</p>
        </div>
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { destinationFor } from "@/lib/klk-links";
import { useEffect, useRef, useState } from "react";

const imageRoot = "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";
const solutions = [
  { title: "Beauty & Personal Care", image: "prototype-solutions-beauty.png" },
  { title: "Food & Nutrition", image: "prototype-solutions-food.png" },
  { title: "Home Care, Industries & Institutional (I&I) Cleaning", image: "prototype-solutions-cleaning.png" },
  { title: "Life Science", image: "prototype-solutions-life-science.png" },
  { title: "Lubricants", image: "prototype-solutions-lubricants.png" },
  { title: "Oleo Basics", image: "prototype-solutions-oleo-basics.png" },
  { title: "Polymers", image: "prototype-solutions-polymers.png" },
] as const;

export function IndustrySolutions() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, left: 0, active: false, moved: false });
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let step = 0;
    let selectedIndex = 0;
    const measure = () => {
      const cards = track.querySelectorAll<HTMLElement>("article");
      if (cards.length < 2) return;
      step = cards[1].offsetLeft - cards[0].offsetLeft;
      track.scrollTo({ left: (solutions.length + selectedIndex) * step, behavior: "instant" });
    };
    const update = () => {
      if (!step) return;
      selectedIndex = ((Math.round(track.scrollLeft / step) % solutions.length) + solutions.length) % solutions.length;
      setActivePage(Math.floor(selectedIndex / 3));
    };
    // Identical copies on either side keep both directions continuous. Rebase
    // only after scrolling settles, so touch momentum is never interrupted.
    const wrap = () => {
      const cycle = step * solutions.length;
      if (!cycle) return;
      if (track.scrollLeft < cycle - step / 2) {
        track.scrollTo({ left: track.scrollLeft + cycle, behavior: "instant" });
      } else if (track.scrollLeft >= cycle * 2 - step / 2) {
        track.scrollTo({ left: track.scrollLeft - cycle, behavior: "instant" });
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("scrollend", wrap);
    measure();
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", update);
      track.removeEventListener("scrollend", wrap);
    };
  }, []);

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>("article");
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const current = Math.round(track.scrollLeft / step);
    const target = index < 0 ? current - 1 : index >= solutions.length ? current + 1 : solutions.length + index;
    track.scrollTo({ left: target * step, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };

  return (
    <section id="solutions" aria-labelledby="solutions-heading" className="overflow-hidden bg-klk-dark py-16 text-white max-md:py-12">
      <div className="klk-container">
        <h2 id="solutions-heading" className="klk-h2">Solutions By Industry</h2>
        <p className="klk-body-large mt-6 text-white/90">No matter what business you are in, we have all your needs in one place.</p>
      </div>
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Solutions by industry. Swipe or use left and right arrow keys to explore."
        tabIndex={0}
        className="relative mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain px-[max(2.5rem,calc((100vw-90rem)/2+2.5rem))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white data-[dragging=true]:snap-none data-[dragging=true]:cursor-grabbing max-md:gap-5 max-md:px-5"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            scrollToCard(event.key === "ArrowLeft" ? -1 : solutions.length);
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || event.button !== 0) return;
          dragRef.current = { x: event.clientX, left: event.currentTarget.scrollLeft, active: true, moved: false };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag.active) return;
          const distance = event.clientX - drag.x;
          if (Math.abs(distance) > 6) {
            drag.moved = true;
            event.currentTarget.dataset.dragging = "true";
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.scrollLeft = drag.left - distance;
          }
        }}
        onPointerUp={(event) => {
          dragRef.current.active = false;
          delete event.currentTarget.dataset.dragging;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          if (dragRef.current.moved) {
            const cards = event.currentTarget.querySelectorAll<HTMLElement>("article");
            const step = cards[1].offsetLeft - cards[0].offsetLeft;
            event.currentTarget.scrollTo({ left: Math.round(event.currentTarget.scrollLeft / step) * step, behavior: "smooth" });
          }
        }}
        onPointerCancel={(event) => {
          dragRef.current.active = false;
          delete event.currentTarget.dataset.dragging;
        }}
        onPointerLeave={() => { dragRef.current.active = false; }}
        onClickCapture={(event) => {
          if (dragRef.current.moved) {
            event.preventDefault();
            dragRef.current.moved = false;
          }
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        {[0, 1, 2].flatMap((copy) => solutions.map((solution) => (
          <article key={`${copy}-${solution.title}`} aria-hidden={copy !== 1 || undefined} className="group relative aspect-[31/30] w-[min(27rem,calc((100vw-8rem)/3))] shrink-0 snap-start scroll-ml-10 overflow-hidden rounded-md bg-klk-darker shadow-klk max-md:w-[82vw] max-md:scroll-ml-5">
            <Image src={`${imageRoot}/${solution.image}`} alt="" fill loading="eager" sizes="(max-width: 768px) 82vw, 33vw" draggable={false} className="pointer-events-none object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,79,45,0)_50%,rgba(0,79,45,0.55)_82%,rgba(123,191,42,0.85)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-6 max-sm:p-5">
              <h3 className="klk-h4">{solution.title}</h3>
              <Link href={destinationFor(solution.title)} tabIndex={copy === 1 ? 0 : -1} className="klk-button mt-4 inline-flex items-center gap-3 border-b border-white pb-2">
                Learn More <span aria-hidden="true" className="text-lg text-klk-lime">→</span>
              </Link>
            </div>
          </article>
        )))}
      </div>
      <div className="mt-6 flex justify-center gap-1.5" aria-label="Solution slides">
        {[0, 1, 2].map((index) => (
          <button key={index} type="button" aria-label={`Show solution slide ${index + 1}`} aria-pressed={activePage === index} onClick={() => scrollToCard(index * 3)} className={`size-3 rounded-full border-[1.5px] border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${activePage === index ? "bg-transparent" : "bg-white/75"}`} />
        ))}
      </div>
    </section>
  );
}

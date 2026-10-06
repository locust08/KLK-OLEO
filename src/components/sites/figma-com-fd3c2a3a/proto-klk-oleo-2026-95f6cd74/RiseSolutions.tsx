"use client";

import Image from "next/image";
import { IndustrySolutions } from "./IndustrySolutions";
import { useEffect, useRef, useState } from "react";

const imageRoot =
  "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

const riseItems = [
  {
    letter: "R",
    color: "text-klk-brand-pink",
    eyebrow: "Reliable",
    title: "Going Extra Mile",
    paragraphs: [
      "Enjoy peace of mind by choosing us as your key partner. Backed by over 100 years of experience, KLK OLEO serves a range of industries and have the knowledge and expertise to help you achieve your product development goals while ensuring performance, quality and security of supply.",
      "Our global presence ensures that we can effectively support all our customers’ formulation objective at a local level. Reach out to us, and we will always go the extra mile to develop a product that enriches all human lives, today and tomorrow.",
    ],
  },
  {
    letter: "I",
    color: "text-klk-brand-pink",
    eyebrow: "Integrated",
    title: "One Integrated Partner",
    paragraphs: [
      "From renewable raw materials to high-performance ingredients, our integrated value chain gives customers confidence, consistency and greater visibility at every step.",
      "Our global teams connect technical expertise, manufacturing strength and market insight to create practical solutions that move ideas from formulation to finished product.",
    ],
  },
  {
    letter: "S",
    color: "text-klk-lime",
    eyebrow: "Sustainable",
    title: "Enriching Lives Sustainably",
    paragraphs: [
      "Sustainability is embedded in the way we source, manufacture and innovate. We work continuously to reduce impact while helping customers meet evolving performance and responsibility goals.",
      "Together with our partners, we turn renewable resources into solutions that support people, communities and the planet for generations to come.",
    ],
  },
  {
    letter: "E",
    color: "text-klk-brand-blue",
    eyebrow: "Efficient",
    title: "Delivering With Efficiency",
    paragraphs: [
      "A resilient international network, dependable manufacturing and responsive local teams help us deliver the right solution where and when it is needed.",
      "We keep improving processes across our supply chain so customers can count on quality, speed and value from development through delivery.",
    ],
  },
] as const;

export function RiseSolutions() {
  const [activeRise, setActiveRise] = useState(0);
  const riseHoverLockedRef = useRef(false);
  const riseHoverLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const rise = riseItems[activeRise];

  const lockRiseHover = () => {
    riseHoverLockedRef.current = true;

    if (riseHoverLockTimerRef.current) {
      clearTimeout(riseHoverLockTimerRef.current);
    }

    riseHoverLockTimerRef.current = setTimeout(() => {
      riseHoverLockedRef.current = false;
      riseHoverLockTimerRef.current = null;
    }, 720);
  };

  const selectRiseFromHover = (index: number) => {
    if (riseHoverLockedRef.current || activeRise === index) {
      return;
    }

    setActiveRise(index);
    lockRiseHover();
  };

  const selectRiseImmediately = (index: number) => {
    setActiveRise(index);
    lockRiseHover();
  };

  useEffect(
    () => () => {
      if (riseHoverLockTimerRef.current) {
        clearTimeout(riseHoverLockTimerRef.current);
      }
    },
    [],
  );

  return (
    <>
      <section className="klk-section relative min-h-[38.125rem] overflow-hidden">
        <Image
          src={`${imageRoot}/extracted-rise-aerial.png`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 bg-klk-surface-subtle/20" />

        <div className="klk-container relative z-10">
          <h2 className="klk-h2 max-w-[40rem] text-klk-darker">
            Built On A Strong Foundation
            <br />
            Committed To RISE
          </h2>

          <div className="mt-10 hidden min-h-[27.5rem] gap-4 min-[56.25rem]:flex xl:min-h-[22.5rem]">
            {riseItems.map((item, index) => {
              const isActive = activeRise === index;

              return (
                <div
                  key={item.letter}
                  onMouseEnter={() => selectRiseFromHover(index)}
                  className={`min-w-0 [perspective:75rem] transition-[flex-basis,width] duration-500 ease-out motion-reduce:transition-none ${
                    isActive ? "basis-[43%] shrink-0" : "flex-1"
                  }`}
                >
                  <div
                    className={`relative h-full min-h-[27.5rem] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none xl:min-h-[22.5rem] ${
                      isActive ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Show ${item.eyebrow} principle`}
                      aria-pressed={isActive}
                      onClick={() => selectRiseImmediately(index)}
                      onFocus={() => selectRiseImmediately(index)}
                      className="group absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm border border-white/45 bg-[linear-gradient(180deg,rgba(250,252,250,0.66)_0%,rgba(244,249,244,0.62)_57%,rgba(205,221,75,0.75)_100%)] shadow-[inset_0_0.0625rem_0_rgba(255,255,255,0.4)] backdrop-blur-[0.1875rem] [backface-visibility:hidden] hover:border-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span
                        className={`text-[clamp(5.5rem,8.6vw,8.875rem)] leading-none font-bold tracking-[-0.08em] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none ${item.color}`}
                      >
                        {item.letter}
                      </span>
                    </button>

                    <article
                      aria-live={isActive ? "polite" : "off"}
                      className="absolute inset-0 overflow-y-auto rounded-sm bg-klk-darker p-8 text-left text-white shadow-klk [backface-visibility:hidden] [scrollbar-width:none] [transform:rotateY(180deg)] [&::-webkit-scrollbar]:hidden max-xl:p-7"
                    >
                      <p className="klk-overline font-semibold text-klk-lime">
                        {item.eyebrow}
                      </p>
                      <h3 className="klk-h4 mt-2">
                        {item.title}
                      </h3>
                      <div className="klk-body-small mt-7 max-w-[31.25rem] space-y-6 text-white/90 max-xl:mt-5 max-xl:space-y-4">
                        {item.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </article>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 min-[56.25rem]:hidden">
            <article
              key={rise.letter}
              aria-live="polite"
              className="min-h-[18.75rem] animate-in rounded-sm bg-klk-darker p-6 text-white shadow-klk fade-in duration-300 motion-reduce:animate-none"
            >
              <p className="klk-overline font-semibold text-klk-lime">
                {rise.eyebrow}
              </p>
              <h3 className="klk-h4 mt-2">
                {rise.title}
              </h3>
              <div className="klk-body-small mt-5 space-y-4 text-white/90">
                {rise.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <div className="mt-4 grid grid-cols-4 gap-2 [perspective:56.25rem]">
              {riseItems.map((item, index) => {
                const isActive = activeRise === index;

                return (
                  <button
                    key={item.letter}
                    type="button"
                    aria-label={`Show ${item.eyebrow} principle`}
                    aria-pressed={isActive}
                    onMouseEnter={() => selectRiseFromHover(index)}
                    onFocus={() => selectRiseImmediately(index)}
                    onClick={() => selectRiseImmediately(index)}
                    className={`group flex min-h-[9.375rem] items-center justify-center overflow-hidden rounded-sm border border-white/45 bg-[linear-gradient(180deg,rgba(250,252,250,0.68)_0%,rgba(244,249,244,0.64)_58%,rgba(205,221,75,0.78)_100%)] transition-[transform,border-color] duration-500 [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none max-sm:min-h-[7rem] ${
                      isActive
                        ? "border-white/80 [transform:rotateY(180deg)]"
                        : "hover:border-white/75"
                    }`}
                  >
                    <span
                      className={`text-[4.25rem] leading-none font-bold tracking-[-0.08em] transition-transform duration-500 motion-reduce:transition-none max-sm:text-[3.125rem] ${
                        isActive
                          ? "[transform:rotateY(180deg)]"
                          : "group-hover:scale-105"
                      } ${item.color}`}
                    >
                      {item.letter}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <IndustrySolutions />
    </>
  );
}

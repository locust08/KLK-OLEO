"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const imageRoot =
  "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

const riseItems = [
  {
    letter: "R",
    color: "text-[#b31964]",
    eyebrow: "Reliable",
    title: "Going Extra Mile",
    paragraphs: [
      "Enjoy peace of mind by choosing us as your key partner. Backed by over 100 years of experience, KLK OLEO serves a range of industries and have the knowledge and expertise to help you achieve your product development goals while ensuring performance, quality and security of supply.",
      "Our global presence ensures that we can effectively support all our customers’ formulation objective at a local level. Reach out to us, and we will always go the extra mile to develop a product that enriches all human lives, today and tomorrow.",
    ],
  },
  {
    letter: "I",
    color: "text-[#ec1384]",
    eyebrow: "Integrated",
    title: "One Integrated Partner",
    paragraphs: [
      "From renewable raw materials to high-performance ingredients, our integrated value chain gives customers confidence, consistency and greater visibility at every step.",
      "Our global teams connect technical expertise, manufacturing strength and market insight to create practical solutions that move ideas from formulation to finished product.",
    ],
  },
  {
    letter: "S",
    color: "text-[#75bd19]",
    eyebrow: "Sustainable",
    title: "Enriching Lives Sustainably",
    paragraphs: [
      "Sustainability is embedded in the way we source, manufacture and innovate. We work continuously to reduce impact while helping customers meet evolving performance and responsibility goals.",
      "Together with our partners, we turn renewable resources into solutions that support people, communities and the planet for generations to come.",
    ],
  },
  {
    letter: "E",
    color: "text-[#078f96]",
    eyebrow: "Efficient",
    title: "Delivering With Efficiency",
    paragraphs: [
      "A resilient international network, dependable manufacturing and responsive local teams help us deliver the right solution where and when it is needed.",
      "We keep improving processes across our supply chain so customers can count on quality, speed and value from development through delivery.",
    ],
  },
] as const;

const solutionPages = [
  [
    { title: "Beauty & Personal Care", image: "Cosmetics-01.jpg" },
    { title: "Food & Nutrition", image: "FnN-Image-2022.jpg" },
    {
      title: "Home Care, Industries & Institutional (I&I) Cleaning",
      image: "solutions-home-care.jpg",
    },
  ],
  [
    { title: "Life Science", image: "Market-Image_Life-Science.png" },
    { title: "Lubricants", image: "Lubricant-01.png" },
    { title: "Polymers", image: "solutions-polymers.jpg" },
  ],
  [
    { title: "Oleo Basics", image: "solutions-oleo-basics.jpg" },
    { title: "Sustainable Solutions", image: "ESG-Palm-Fruit-01.png" },
    { title: "Global Supply", image: "slide01-03.jpg" },
  ],
] as const;

export function RiseSolutions() {
  const [activeRise, setActiveRise] = useState(0);
  const [activeSolutionPage, setActiveSolutionPage] = useState(0);
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
      <section className="relative min-h-[610px] overflow-hidden px-[38px] py-16 max-md:px-5 max-md:py-12">
        <Image
          src={`${imageRoot}/Market-Image_Life-Science.png`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/55" />
        <div className="absolute inset-0 bg-[#dbe5dc]/20" />

        <div className="relative z-10 mx-auto max-w-[1364px]">
          <h2 className="max-w-[600px] text-[36px] leading-[1.2] font-semibold tracking-[-0.02em] text-white drop-shadow-[0_2px_12px_rgba(0,63,39,0.42)] max-sm:text-[31px]">
            Built On A Strong Foundation
            <br />
            Committed To RISE
          </h2>

          <div className="mt-10 hidden min-h-[440px] gap-4 min-[900px]:flex xl:min-h-[360px]">
            {riseItems.map((item, index) => {
              const isActive = activeRise === index;

              return (
                <div
                  key={item.letter}
                  onMouseEnter={() => selectRiseFromHover(index)}
                  className={`min-w-0 [perspective:1200px] transition-[flex-basis,width] duration-500 ease-out motion-reduce:transition-none ${
                    isActive ? "basis-[43%] shrink-0" : "flex-1"
                  }`}
                >
                  <div
                    className={`relative h-full min-h-[440px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] motion-reduce:transition-none xl:min-h-[360px] ${
                      isActive ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Show ${item.eyebrow} principle`}
                      aria-pressed={isActive}
                      onClick={() => selectRiseImmediately(index)}
                      onFocus={() => selectRiseImmediately(index)}
                      className="group absolute inset-0 flex items-center justify-center overflow-hidden rounded-[10px] border border-white/45 bg-[linear-gradient(180deg,rgba(250,252,250,0.66)_0%,rgba(244,249,244,0.62)_57%,rgba(205,221,75,0.75)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[3px] [backface-visibility:hidden] hover:border-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span
                        className={`text-[clamp(5.5rem,8.6vw,8.875rem)] leading-none font-bold tracking-[-0.08em] transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none ${item.color}`}
                      >
                        {item.letter}
                      </span>
                    </button>

                    <article
                      aria-live={isActive ? "polite" : "off"}
                      className="absolute inset-0 overflow-y-auto rounded-[10px] bg-[#003f27] p-[34px] text-left text-white shadow-[0_20px_45px_rgba(0,63,39,0.18)] [backface-visibility:hidden] [scrollbar-width:none] [transform:rotateY(180deg)] [&::-webkit-scrollbar]:hidden max-xl:p-7"
                    >
                      <p className="text-[16px] font-semibold text-[#7bbf2a]">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-2 text-[26px] leading-[1.18] font-semibold">
                        {item.title}
                      </h3>
                      <div className="mt-7 max-w-[500px] space-y-6 text-[13px] leading-[1.8] text-white/90 max-xl:mt-5 max-xl:space-y-4">
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

          <div className="mt-8 min-[900px]:hidden">
            <article
              key={rise.letter}
              aria-live="polite"
              className="min-h-[300px] animate-in rounded-[10px] bg-[#003f27] p-6 text-white fade-in duration-300 motion-reduce:animate-none"
            >
              <p className="text-[15px] font-semibold text-[#7bbf2a]">
                {rise.eyebrow}
              </p>
              <h3 className="mt-2 text-[24px] leading-[1.18] font-semibold">
                {rise.title}
              </h3>
              <div className="mt-5 space-y-4 text-[13px] leading-[1.75] text-white/90">
                {rise.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <div className="mt-4 grid grid-cols-4 gap-2 [perspective:900px]">
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
                    className={`group flex min-h-[150px] items-center justify-center overflow-hidden rounded-[10px] border border-white/45 bg-[linear-gradient(180deg,rgba(250,252,250,0.68)_0%,rgba(244,249,244,0.64)_58%,rgba(205,221,75,0.78)_100%)] transition-[transform,border-color] duration-500 [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none max-sm:min-h-[112px] ${
                      isActive
                        ? "border-white/80 [transform:rotateY(180deg)]"
                        : "hover:border-white/75"
                    }`}
                  >
                    <span
                      className={`text-[68px] leading-none font-bold tracking-[-0.08em] transition-transform duration-500 motion-reduce:transition-none max-sm:text-[50px] ${
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

      <section
        id="solutions"
        aria-labelledby="solutions-heading"
        className="bg-[#005c37] px-[38px] pt-[58px] pb-[72px] max-md:px-5 max-md:py-12"
      >
        <div className="mx-auto max-w-[1364px]">
          <h2
            id="solutions-heading"
            className="text-[36px] leading-[1.2] font-semibold tracking-[-0.02em] text-white max-sm:text-[31px]"
          >
            Solutions By Industry
          </h2>
          <p className="mt-5 text-[14px] text-white/90">
            No matter what business you are in, we have all your needs in one
            place.
          </p>

          <div
            key={activeSolutionPage}
            className="mt-12 grid animate-in grid-cols-3 gap-9 fade-in duration-300 motion-reduce:animate-none max-md:grid-cols-1"
          >
            {solutionPages[activeSolutionPage].map((solution, index) => (
              <article
                key={solution.title}
                className={`group relative aspect-[1.25] min-h-[300px] overflow-hidden rounded-[10px] bg-[#003f27] ${index > 0 ? "max-md:hidden" : ""}`}
              >
                <Image
                  src={`${imageRoot}/${solution.image}`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,79,45,0.94)_0%,rgba(0,79,45,0.91)_48%,rgba(121,190,39,0.91)_100%)] transition-opacity duration-500 group-hover:opacity-90 motion-reduce:transition-none" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="max-w-[390px] text-[25px] leading-[1.08] font-semibold">
                    {solution.title}
                  </h3>
                  <a
                    href="#"
                    className="mt-3 inline-flex items-center gap-4 border-b border-white pb-2 text-[12px] font-semibold tracking-[0.1em] uppercase"
                  >
                    Learn More
                    <span aria-hidden="true" className="text-lg text-[#7bbf2a]">
                      →
                    </span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-2" aria-label="Solution slides">
            {solutionPages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show solution slide ${index + 1}`}
                aria-pressed={activeSolutionPage === index}
                onClick={() => setActiveSolutionPage(index)}
                className={`size-3 rounded-full border-2 border-white transition-colors duration-200 motion-reduce:transition-none ${
                  activeSolutionPage === index ? "bg-[#7bbf2a]" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUp, Factory, FlaskConical } from "lucide-react";
import { useState } from "react";

import { newsItems } from "@/lib/klk-data";

const assetRoot =
  "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

type Region = {
  name: string;
  countries: Array<{
    name: string;
    research?: boolean;
    facilities: string[];
  }>;
};

const regions: Region[] = [
  {
    name: "South East Asia",
    countries: [
      {
        name: "Malaysia",
        research: true,
        facilities: [
          "Davos Life Science",
          "KLK Bioenergy",
          "KL-Kepong Oleomas",
          "Palm-Oleo",
          "Palm-Oleo (Klang)",
          "Stolthaven (Westport)",
        ],
      },
      {
        name: "Singapore",
        research: true,
        facilities: ["Davos Life Science"],
      },
      {
        name: "Indonesia",
        facilities: ["KLK Dumai", "Perindustrian Sawit Synergi"],
      },
    ],
  },
  {
    name: "Asia",
    countries: [
      { name: "China", research: true, facilities: ["Taiko Palm-Oleo (Zhangjiagang)", "KLK OLEO (Shanghai)"] },
      { name: "India", facilities: ["KLK OLEO India"] },
    ],
  },
  {
    name: "Europe",
    countries: [
      { name: "Germany", facilities: ["KLK Emmerich (Emmerich & Dusseldorf sites)"] },
      { name: "Netherlands", research: true, facilities: ["Dr. W. Kolb Nederland", "KLK Kolb Specialties"] },
      { name: "Belgium", facilities: ["KLK Tensachem"] },
      { name: "Italy", facilities: ["KLK Temix"] },
      { name: "Switzerland", facilities: ["Kolb Distribution"] },
    ],
  },
  {
    name: "Americas",
    countries: [
      { name: "United States", facilities: ["KLK OLEO Americas"] },
    ],
  },
];

const esgCards = [
  {
    title: "Sustainability",
    image: `${assetRoot}/2025-RISE-Thumbnail-01.png`,
    imageClass: "object-cover object-center",
  },
  {
    title: "Corporate Responsibility",
    image: `${assetRoot}/About-KLK-OLEO-MKLK-scaled.jpg`,
    imageClass: "object-cover object-[68%_70%]",
  },
];

function RegionContent({ region }: { region: Region }) {
  return (
    <div className="space-y-3 px-4 pb-4 pt-1 text-[12px] leading-[1.35] text-white/90 sm:px-5">
      {region.countries.map((country) => (
        <div key={country.name}>
          <div className="flex items-center gap-1.5 border-b border-white/15 pb-2 font-semibold text-white">
            {country.research ? (
              <FlaskConical aria-hidden="true" className="h-4 w-4 text-[#f6a04d]" />
            ) : null}
            <span>{country.name}</span>
          </div>
          <ul className="mt-2 space-y-2">
            {country.facilities.map((facility) => (
              <li className="flex items-start gap-2" key={facility}>
                <Factory aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#77bd2c]" />
                <span>{facility}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function PresenceNewsEsg() {
  const [openRegion, setOpenRegion] = useState("South East Asia");

  return (
    <>
      <section id="markets" className="bg-white px-[38px] py-[66px] text-[#16231b] max-sm:px-5 max-sm:py-12">
        <div className="mx-auto max-w-[1364px]">
          <h2 className="mb-7 text-[34px] font-semibold leading-tight tracking-[-0.02em] text-[#006f3c] max-sm:text-[28px]">
            KLK OLEO Global Presence
          </h2>

          <div className="grid grid-cols-[minmax(0,68fr)_minmax(310px,32fr)] items-start gap-10 max-[900px]:grid-cols-1">
            <div className="relative aspect-[1.61/1] w-full">
              <Image
                alt="KLK OLEO global locations, facilities and regional network map"
                className="object-contain"
                fill
                sizes="(max-width: 900px) calc(100vw - 40px), 65vw"
                src={`${assetRoot}/2026-01-Global-Presence_English-1.jpg`}
              />
            </div>

            <div className="space-y-4">
              {regions.map((region) => {
                const isOpen = region.name === openRegion;

                return (
                  <div
                    className={`overflow-hidden rounded-lg ${isOpen ? "bg-[#004525] text-white" : "bg-[#e2f0e9] text-[#17231d]"}`}
                    key={region.name}
                  >
                    <button
                      aria-expanded={isOpen}
                      className="flex h-[58px] w-full cursor-pointer items-center justify-between px-4 text-left text-[26px] font-semibold leading-none sm:px-5"
                      onClick={() => setOpenRegion(region.name)}
                      type="button"
                    >
                      <span>{region.name}</span>
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#79bd2c] text-white">
                        {isOpen ? (
                          <ArrowUp aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <ArrowDown aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
                        )}
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-[260ms] ease-in-out motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <RegionContent region={region} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="news" className="bg-[#e6f2ec] px-[38px] py-[62px] text-[#18231d] max-sm:px-5 max-sm:py-12">
        <div className="mx-auto max-w-[1364px]">
          <div className="mb-9 flex items-end justify-between gap-6">
            <h2 className="text-[34px] font-semibold leading-tight tracking-[-0.02em] text-[#006f3c] max-sm:text-[28px]">
              Latest News
            </h2>
            <a
              className="group flex shrink-0 items-center gap-2 border-b border-[#2d968c] pb-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
              href="#news"
            >
              View more news
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#78bd2d] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
            {newsItems.slice(0, 3).map((item) => (
              <article className="rounded-[10px] bg-white p-[14px]" key={item.title}>
                <div className="relative aspect-[1.52/1] overflow-hidden rounded-lg">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) calc(100vw - 68px), (max-width: 900px) 45vw, 31vw"
                    src={item.image}
                  />
                </div>
                <div className="px-1 pb-1 pt-4">
                  <p className="text-[11px] leading-5 text-[#303a34]">
                    {item.category}
                    <span aria-hidden="true" className="mx-2">•</span>
                    {item.date}
                  </p>
                  <h3 className="mt-2 text-[14px] font-semibold leading-[1.35] text-[#087643]">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-[#4c554f]">
                    {item.excerpt}
                  </p>
                  <a
                    className="group mt-4 inline-flex items-center gap-2 border-b border-[#2d968c] pb-2 text-[11px] font-semibold uppercase tracking-[0.09em]"
                    href="#news"
                  >
                    Read more
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#78bd2d] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="esg" className="bg-[#00572f] px-[38px] py-[62px] text-white max-sm:px-5 max-sm:py-12">
        <div className="mx-auto max-w-[1364px]">
          <h2 className="mb-7 max-w-[620px] text-[36px] font-semibold leading-[1.08] tracking-[-0.025em] max-sm:text-[29px]">
            Environment, Social, And Corporate Governance
          </h2>

          <div className="grid grid-cols-[1fr_1.55fr] gap-5 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
            {esgCards.map((card, index) => (
              <a
                className={`group relative overflow-hidden rounded-[10px] ${index === 0 ? "aspect-square" : "aspect-[1.55/1] max-[900px]:aspect-square"}`}
                href="#esg"
                key={card.title}
              >
                <Image
                  alt=""
                  className={`${card.imageClass} transition-transform duration-300 ease-out group-hover:scale-[1.035] motion-reduce:transition-none`}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 900px) 46vw, 60vw"
                  src={card.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 max-sm:p-5">
                  <h3 className="text-[28px] font-semibold leading-tight max-sm:text-[23px]">
                    {card.title}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-2 border-b border-white/70 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
                    Learn more
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#79bd2d] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

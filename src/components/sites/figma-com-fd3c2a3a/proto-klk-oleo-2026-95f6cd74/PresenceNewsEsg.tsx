"use client";

import Image from "next/image";
import { destinationFor } from "@/lib/klk-links";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useId, useState } from "react";
import { LocationMap } from "../shared/LocationMap";

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
    image: `${assetRoot}/extracted-tree-planting.jpg`,
    imageClass: "object-cover object-center",
  },
  {
    title: "Corporate Responsibility",
    image: `${assetRoot}/extracted-community.jpg`,
    imageClass: "object-cover object-center",
  },
];

function RegionContent({ region }: { region: Region }) {
  return (
    <div className="space-y-6 px-4 pt-1 pb-4 text-klk-text-light sm:px-5">
      {region.countries.map((country) => (
        <div key={country.name}>
          <div className="flex items-center gap-1.5 border-b border-klk-border/25 pb-2 text-[18px] leading-[1.3] font-semibold text-white">
            {country.name === "Malaysia" ? <Image src="/images/maps/global-presence/headquarters-light.svg" width={26} height={26} alt="Corporate headquarters" /> : null}
            {country.research ? (
              <Image src="/images/maps/global-presence/research.svg" width={26} height={26} alt="Research and development" />
            ) : null}
            <span>{country.name}</span>
          </div>
          <ul className="mt-2 space-y-2">
            {country.facilities.map((facility) => (
              <li className="flex items-start gap-2 text-[14px] leading-8 [overflow-wrap:anywhere] sm:text-[16px]" key={facility}>
                <Image src={`/images/maps/global-presence/${facility.startsWith("Stolthaven") ? "storage" : facility.includes("Shanghai") || facility.includes("India") ? "sales-office" : country.name === "Singapore" ? "facility-singapore" : country.name === "Indonesia" ? "facility-indonesia" : "facility"}.svg`} width={16} height={16} alt="" className="mt-2 h-auto w-4 shrink-0" />
                <span>{facility}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function GlobalPresence({ heading = "KLK OLEO Global Presence", id = "markets" }: { heading?: string; id?: string }) {
  const [openRegion, setOpenRegion] = useState<string | null>("South East Asia");
  const regionId = useId();
  return (
      <section id={id} className="klk-section bg-white text-klk-text min-[120rem]:min-h-[74.9375rem]">
        <div className="klk-container">
          <h2 className="klk-h2 mb-8 text-klk-primary">
            {heading}
          </h2>

          <div className="grid grid-cols-[minmax(0,1259fr)_minmax(0,510fr)] items-start gap-[clamp(1.5rem,2.65625vw,3.1875rem)] max-[1199px]:grid-cols-1">
            <LocationMap selectedRegion={openRegion} onSelectRegion={setOpenRegion} />

            <div className="space-y-4">
              {regions.map((region, index) => {
                const isOpen = region.name === openRegion;

                return (
                  <div
                    className={`overflow-hidden rounded-sm border border-klk-border ${isOpen ? "bg-klk-darker text-white" : "bg-klk-surface text-klk-text"}`}
                    key={region.name}
                  >
                    <button
                      aria-expanded={isOpen}
                      aria-controls={`${regionId}-panel-${index}`}
                      id={`${regionId}-button-${index}`}
                      className="klk-h5 flex min-h-14 w-full cursor-pointer items-center justify-between px-4 text-left sm:px-5"
                      onClick={() => setOpenRegion(isOpen ? null : region.name)}
                      type="button"
                    >
                      <span>{region.name}</span>
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-klk-lime text-white">
                        {isOpen ? (
                          <ArrowUp aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <ArrowDown aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
                        )}
                      </span>
                    </button>
                    <div
                      id={`${regionId}-panel-${index}`}
                      role="region"
                      aria-labelledby={`${regionId}-button-${index}`}
                      aria-hidden={!isOpen}
                      inert={!isOpen}
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

  );
}

export function PresenceNewsEsg() {
  return (
    <>
      <GlobalPresence />
      <section id="news" className="klk-section bg-klk-surface text-klk-text min-[120rem]:min-h-[58.5rem]">
        <div className="klk-container">
          <div className="mb-9 flex items-end justify-between gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <h2 className="klk-h2 text-klk-primary">
              Latest News
            </h2>
            <a
              className="klk-button group flex shrink-0 items-center gap-2 border-b border-klk-brand-blue pb-2"
              href={destinationFor("News & Events")}
            >
              View more news
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-klk-lime transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-[1.875rem] max-[56.25rem]:grid-cols-2 max-[40rem]:grid-cols-1">
            {newsItems.slice(0, 3).map((item) => (
              <article className="flex flex-col rounded-md border border-klk-border bg-white p-5 shadow-klk min-[120rem]:min-h-[42.3435rem]" key={item.title}>
                <div className="relative aspect-[2.24/1] overflow-hidden rounded-sm">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) calc(100vw - 68px), (max-width: 900px) 45vw, 31vw"
                    src={item.image}
                  />
                </div>
                <div className="px-1 pb-1 pt-4">
                  <p className="klk-caption text-klk-text">
                    {item.category}
                    <span aria-hidden="true" className="mx-2">•</span>
                    {item.date}
                  </p>
                  <h3 className="klk-h6 mt-2 text-klk-primary">
                    {item.title}
                  </h3>
                  <p className="klk-body mt-3 line-clamp-3 text-klk-text-secondary">
                    {item.excerpt}
                  </p>
                  <a
                    className="klk-button group mt-4 inline-flex items-center gap-2 border-b border-klk-brand-blue pb-2"
                    href={item.href.replace("https://www.klkoleo.com/news-media/", "/news-events/")}
                  >
                    Read more
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-klk-lime transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="esg" className="klk-section bg-klk-dark text-white">
        <div className="klk-container">
          <h2 className="klk-h2 mb-8 max-w-[42rem]">
            Environment, Social, And Corporate Governance
          </h2>

          <div className="grid grid-cols-2 gap-[1.875rem] max-[56.25rem]:grid-cols-2 max-[40rem]:grid-cols-1">
            {esgCards.map((card) => (
              <a
                className="group relative aspect-[1.525/1] overflow-hidden rounded-md shadow-klk"
                href={destinationFor(card.title)}
                key={card.title}
              >
                <Image
                  alt=""
                  className={`${card.imageClass} transition-transform duration-300 ease-out group-hover:scale-[1.035] motion-reduce:transition-none`}
                  fill
                  sizes="(max-width: 640px) calc(100vw - 40px), 46vw"
                  src={card.image}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 p-7 max-sm:p-5">
                  <h3 className="klk-h4">
                    {card.title}
                  </h3>
                  <span className="klk-button mt-3 inline-flex items-center gap-2 border-b border-white pb-2">
                    Learn more
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-klk-lime transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
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

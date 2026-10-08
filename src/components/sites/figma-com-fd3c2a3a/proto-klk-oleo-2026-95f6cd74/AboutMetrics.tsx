import Image from "next/image";
import { destinationFor } from "@/lib/klk-links";

const imageRoot =
  "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";

const awards = [
  {
    image: `${imageRoot}/The-Edge-Billion-Ringgit-Club-2023-Logo.png`,
    label: "The Edge Billion Ringgit Club",
  },
  {
    image: `${imageRoot}/Fortune-500-Lime.png`,
    label: "FORTUNE Southeast Asia 500 (Ranked 69th)",
  },
  {
    image: `${imageRoot}/bestmanagedcompanies2025.png`,
    label: "Malaysia’s Best Managed Companies 2025",
  },
] as const;

const metrics = [
  {
    image: `${imageRoot}/extracted-cosmetic-bottles.png`,
    number: "30+",
    label: "Years Of Excellence In Oleochemicals",
  },
  {
    image: `${imageRoot}/extracted-oleomas-facilities.jpg`,
    number: "15+",
    label: "Operating Facilities Worldwide",
  },
  {
    image: `${imageRoot}/extracted-tank-farm.jpg`,
    number: "3.5",
    label: "Million Metric Tonnes Manufacturing Capacity",
  },
  {
    image: `${imageRoot}/extracted-global-workforce.png`,
    number: "4,200+",
    label: "Global Workforce",
  },
  {
    image: `${imageRoot}/ESG-Palm-Fruit-01.png`,
    kicker: "Since",
    number: "2014",
    label: "RSPO Supply Chain Certified (SCC)",
  },
  {
    image: `${imageRoot}/extracted-global-supply.jpg`,
    kicker: "Supplying To",
    number: "120+",
    label: "Countries",
  },
] as const;

export function AboutMetrics() {
  return (
    <>
      <section
        id="about-us"
        aria-labelledby="about-klk-heading"
        className="klk-section bg-white"
      >
        <div className="klk-container grid grid-cols-2 gap-16 max-lg:grid-cols-1 max-lg:gap-10">
          <div className="min-w-0">
            <p className="klk-overline mb-4 text-klk-primary">
              About KLK OLEO
            </p>
            <h2
              id="about-klk-heading"
              className="klk-h2 max-w-[40rem] text-klk-primary"
            >
              Global Oleochemical Producer For More Than 30 Years
            </h2>

            <div className="mt-12 grid grid-cols-3 gap-6 max-sm:mt-9 max-sm:gap-3">
              {awards.map((award) => (
                <article key={award.label} className="min-w-0">
                  <div className="relative h-36 overflow-hidden rounded-sm border border-klk-border bg-white max-sm:h-24">
                    <Image
                      src={award.image}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-contain p-4"
                    />
                  </div>
                  <p className="klk-body-small mt-3 text-center font-semibold text-klk-text max-sm:text-[0.6875rem]">
                    {award.label}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="klk-body pt-1 text-klk-text-secondary">
            <p>
              KLK OLEO is a global oleochemical producer, which has integrated
              complexes located strategically in Malaysia, Indonesia, China,
              and Europe. KLK OLEO offers an array of high quality, innovative
              and sustainable products and solutions. We are the manufacturing
              division of our parent company, {" "}
              <strong className="font-semibold text-klk-primary">
                Kuala Lumpur Kepong Berhad
              </strong>
              , a leading international plantations group listed on Main Market
              of Bursa Malaysia Securities Berhad with a market capitalisation
              of approximately RM22.94 (USD5.45) billion at the end of September
              2025.
            </p>
            <p className="mt-6">
              KLK OLEO’s production portfolio ranges from basic oleochemical
              products, such as Fatty Acids, Glycerine, Fatty Alcohols and Fatty
              Esters, all the way down the spectrum to specialties, such as
              Methyl Ester Sulphonates (MES), Surfactants and Phytonutrients.
              Our products are used in diverse end-use applications, including
              beauty &amp; personal care, home care, industries &amp;
              institutional (I&amp;I) cleaning, life science, food &amp;
              nutrition, lubricants, polymers and more.
            </p>
            <a
              href={destinationFor("KLK OLEO in Brief")}
              className="klk-button mt-8 inline-flex items-center gap-4 border-b border-klk-brand-blue pb-2 text-klk-text transition-colors duration-200 hover:text-klk-primary motion-reduce:transition-none"
            >
              Learn More
              <span aria-hidden="true" className="text-xl leading-none text-klk-lime">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      <section
        aria-label="KLK OLEO in numbers"
        className="klk-section bg-klk-surface"
      >
        <div className="klk-container grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.number}
              className="group relative h-[15.625rem] min-w-0 overflow-hidden rounded-sm bg-klk-dark shadow-klk xl:h-[20rem]"
            >
              <Image
                src={metric.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
              />
              <div className="absolute inset-0 bg-linear-to-t from-klk-darker via-klk-darker/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 px-5 pb-7 text-white max-sm:gap-3 max-sm:px-4 max-sm:pb-5">
                <div className="shrink-0">
                  {"kicker" in metric && metric.kicker ? (
                    <p className="klk-caption mb-[-0.1875rem] font-semibold">
                      {metric.kicker}
                    </p>
                  ) : null}
                  <p className="text-[3.25rem] leading-[0.9] font-semibold tracking-[-0.04em] max-sm:text-[2.75rem]">
                    {metric.number}
                  </p>
                </div>
                <p className="klk-h5 max-w-[16.875rem] pb-0.5">
                  {metric.label}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
